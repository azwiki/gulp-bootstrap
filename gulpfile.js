'use strict';

/* Paths */
var path = {
  dev: {
    html: 'dev/',
    css: 'dev/assets/css/',
    js: 'dev/assets/js/',
    img: 'dev/assets/img/'
  },
  dist: {
    html: 'dist/',
    css: 'dist/assets/css/',
    js: 'dist/assets/js/',
    img: 'dist/assets/img/'
  },
  src: {
    html: ['src/**/*.html', '!src/partials/**/*.html'],
    partials: 'src/partials/',
    style: 'src/assets/scss/main.scss',
    mainjs: 'src/assets/js/main.js',
    bootstrapCss: 'node_modules/bootstrap/dist/css/bootstrap.min.css',
    bootstrapJs: 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
    img: ['src/assets/img/**/*.*', '!src/assets/img/**/*.ico', '!src/assets/img/**/.DS_Store'],
    favicon: 'src/assets/img/favicon/favicon.ico',
    root: ['src/robots.txt', 'src/site.webmanifest']
  },
  watch: {
    html: 'src/**/*.html',
    partials: 'src/partials/**/*.*',
    scss: 'src/assets/scss/**/*.scss',
    mainjs: 'src/assets/js/main.js',
    img: ['src/assets/img/**/*.*', '!src/assets/img/**/*.ico', '!src/assets/img/**/.DS_Store'],
    favicon: 'src/assets/img/favicon/favicon.ico',
    root: ['src/robots.txt', 'src/site.webmanifest']
  },
  clean: {
    dev: 'dev/*',
    dist: 'dist/*'
  }
};

/* Plugins */
var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    sass = require('gulp-sass')(require('sass')),
    autoprefixer = require('gulp-autoprefixer'),
    cleanCSS = require('gulp-clean-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    del = require('del'),
    fileinclude = require('gulp-file-include'),
    newer = require('gulp-newer'),
    browserSync = require('browser-sync').create();

/* HTML (gulp-file-include: only flat @@param interpolation — @@if/@@else in @@include is unreliable) */
gulp.task('html:dev', function () {
  return gulp.src(path.src.html)
    .pipe(newer({ dest: path.dev.html, extra: path.watch.partials }))
    .pipe(plumber())
    .pipe(fileinclude({ prefix: '@@', basepath: path.src.partials }))
    .pipe(gulp.dest(path.dev.html));
});
gulp.task('html:dist', function () {
  return gulp.src(path.src.html)
    .pipe(newer({ dest: path.dist.html, extra: path.watch.partials }))
    .pipe(plumber())
    .pipe(fileinclude({ prefix: '@@', basepath: path.src.partials }))
    .pipe(gulp.dest(path.dist.html));
});

/* Our SCSS -> main.css (independent from Bootstrap — Bootstrap's own CSS is copied separately, see bootstrapcss) */
gulp.task('sass:dev', function () {
  return gulp.src(path.src.style)
    .pipe(plumber())
    .pipe(sass().on('error', function (err) { sass.logError(err); this.emit('end'); }))
    .pipe(autoprefixer())
    .pipe(gulp.dest(path.dev.css));
});
gulp.task('sass:dist', function () {
  return gulp.src(path.src.style)
    .pipe(plumber())
    .pipe(sass().on('error', function (err) { sass.logError(err); this.emit('end'); }))
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(gulp.dest(path.dist.css));
});

/* Bootstrap CSS/JS — copied as-is from node_modules, never recompiled */
gulp.task('bootstrapcss:dev', function () {
  return gulp.src(path.src.bootstrapCss).pipe(gulp.dest(path.dev.css));
});
gulp.task('bootstrapcss:dist', function () {
  return gulp.src(path.src.bootstrapCss).pipe(gulp.dest(path.dist.css));
});
gulp.task('bootstrapjs:dev', function () {
  return gulp.src(path.src.bootstrapJs).pipe(gulp.dest(path.dev.js));
});
gulp.task('bootstrapjs:dist', function () {
  return gulp.src(path.src.bootstrapJs).pipe(gulp.dest(path.dist.js));
});

/* Our own JS */
gulp.task('mainjs:dev', function () {
  return gulp.src(path.src.mainjs).pipe(newer(path.dev.js)).pipe(gulp.dest(path.dev.js));
});
gulp.task('mainjs:dist', function () {
  return gulp.src(path.src.mainjs).pipe(newer(path.dist.js)).pipe(gulp.dest(path.dist.js));
});

/* Images (no gulp-cache — breaks on large batches; newer() only) */
gulp.task('image:dev', function () {
  return gulp.src(path.src.img, { allowEmpty: true })
    .pipe(newer(path.dev.img))
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      pngquant(),
      imagemin.svgo({ plugins: [{ removeViewBox: false }] })
    ]))
    .pipe(gulp.dest(path.dev.img));
});
gulp.task('image:dist', function () {
  return gulp.src(path.src.img, { allowEmpty: true })
    .pipe(newer(path.dist.img))
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      pngquant(),
      imagemin.svgo({ plugins: [{ removeViewBox: false }] })
    ]))
    .pipe(gulp.dest(path.dist.img));
});

/* Favicon .ico — never through imagemin.
   allowEmpty: favicon.ico not committed yet — drop the real file into
   src/assets/img/favicon/favicon.ico, no gulpfile change needed. */
gulp.task('favicon:dev', function () {
  return gulp.src(path.src.favicon, { allowEmpty: true }).pipe(newer(path.dev.img)).pipe(gulp.dest(path.dev.img));
});
gulp.task('favicon:dist', function () {
  return gulp.src(path.src.favicon, { allowEmpty: true }).pipe(newer(path.dist.img)).pipe(gulp.dest(path.dist.img));
});

/* robots.txt / site.webmanifest — *.html task doesn't pick these up */
gulp.task('root:dev', function () {
  return gulp.src(path.src.root).pipe(newer(path.dev.html)).pipe(gulp.dest(path.dev.html));
});
gulp.task('root:dist', function () {
  return gulp.src(path.src.root).pipe(newer(path.dist.html)).pipe(gulp.dest(path.dist.html));
});

/* Clean */
gulp.task('clean:dev', function () { return del(path.clean.dev); });
gulp.task('clean:dist', function () { return del(path.clean.dist); });

/* Builds */
gulp.task('build:dev', gulp.series('clean:dev',
  gulp.parallel('html:dev', 'sass:dev', 'bootstrapcss:dev', 'bootstrapjs:dev', 'mainjs:dev', 'image:dev', 'favicon:dev', 'root:dev')
));
gulp.task('build:dist', gulp.series('clean:dist',
  gulp.parallel('html:dist', 'sass:dist', 'bootstrapcss:dist', 'bootstrapjs:dist', 'mainjs:dist', 'image:dist', 'favicon:dist', 'root:dist')
));

/* Watch + browser-sync (serves dist/) */
gulp.task('watch', function () {
  browserSync.init({ server: { baseDir: 'dist' } });

  gulp.watch(path.watch.html, gulp.series('html:dist')).on('change', browserSync.reload);
  gulp.watch(path.watch.partials, gulp.series('html:dist')).on('change', browserSync.reload);
  gulp.watch(path.watch.scss, gulp.series('sass:dist')).on('change', browserSync.reload);
  gulp.watch(path.watch.mainjs, gulp.series('mainjs:dist')).on('change', browserSync.reload);
  gulp.watch(path.watch.img, gulp.series('image:dist')).on('change', browserSync.reload);
  gulp.watch(path.watch.favicon, gulp.series('favicon:dist')).on('change', browserSync.reload);
  gulp.watch(path.watch.root, gulp.series('root:dist')).on('change', browserSync.reload);
});

gulp.task('serve', gulp.series('build:dist', 'watch'));

gulp.task('default', gulp.series('serve'));
