# gulp-bootstrap

A minimal Gulp 4 + Bootstrap 5.3 starter for static site development.

**Blank means no theme, not no tooling.** This project provides a working
build pipeline — SCSS compilation, HTML partials, image optimization,
live reload. Bootstrap supplies the UI components; this repo supplies the
development environment around them. No prebuilt pages, no design system,
no third-party UI plugins.

## Requirements

- Node.js (Active LTS or newer)
- Gulp 4.x — this project targets Gulp 4, not 5. Gulp 5 introduces breaking
  changes (default stream encoding, stricter async task-completion checks)
  that have not been verified against this pipeline's plugins
  (`gulp-imagemin`, `gulp-clean-css`). Do not upgrade without testing those
  plugins under Gulp 5 first.

## Structure

```
gulp-bootstrap/
├── gulpfile.js          # build logic
├── package.json
├── src/                 # you work here — everything else is generated
│   ├── index.html         # pages (flat .html files at src/ root)
│   ├── robots.txt
│   ├── site.webmanifest
│   ├── partials/           # reusable pieces (head/navbar/footer/scripts)
│   │   ├── _head.html
│   │   ├── _navbar.html
│   │   ├── _footer.html
│   │   └── _scripts.html
│   └── assets/
│       ├── scss/
│       │   └── main.scss    # your own styles — empty by default
│       ├── js/
│       │   └── main.js
│       └── img/
│           └── favicon/favicon.ico   # drop your favicon here
├── dev/                 # `npm run build:dev` output — uncompressed, for debugging
└── dist/                # `npm run build:dist` / `npm start` output — what the browser serves
```

`dev/` and `dist/` are generated on every build (`clean:dev`/`clean:dist` wipe
them first) and are git-ignored — never edit them by hand. All editing
happens in `src/`.

Bootstrap's own CSS/JS are copied as-is from `node_modules/bootstrap/dist/`
and are never recompiled. Your own SCSS compiles to `main.css`, loaded
*after* `bootstrap.min.css`, so a same-specificity rule in `main.scss`
overrides Bootstrap's.

## Adding a page

Create `src/about.html` (any name, `.html`, not inside `partials/`):

```html
<!doctype html>
<html lang="en">
<head>
@@include('_head.html', {
  "title": "About",
  "description": "...",
  "keywords": "..."
})
</head>
<body>
@@include('_navbar.html', { "siteName": "gulp-bootstrap" })
<main class="container py-5">
  <!-- page content -->
</main>
@@include('_footer.html', { "siteName": "gulp-bootstrap" })
@@include('_scripts.html')
</body>
</html>
```

**Note on `gulp-file-include`:** only flat `@@param` interpolation is
reliable inside `@@include(...)` — `@@if`/`@@else` can render as literal
text. Keep partials free of conditional logic.

## Commands

```bash
npm install          # once, after cloning / changing package.json
npm run build:dev     # → dev/, uncompressed
npm run build:dist    # → dist/, minified (CSS via clean-css)
npm start              # build:dist + browser-sync live reload, opens the browser
```

## Adding dependencies

New npm library (e.g. a lightbox, a carousel lib) — `npm install <package>`,
then add a copy/concat task in `gulpfile.js` by analogy with
`bootstrapjs:dev/dist`, or just reference a `.min.js`/`.min.css` file
directly via `<script>`/`<link>` in a partial if it doesn't need a build
step on your side.
