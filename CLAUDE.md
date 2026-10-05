# CLAUDE.md

A portal where students browse and try a growing collection of small learning items
(interactive tools, guided lessons, quizzes), organised by module.

## Stack & Conventions

- **Hard constraint: vanilla HTML, CSS, and JavaScript only — no frameworks, no build step.**
  - No UI frameworks or libraries (e.g. React, Vue, Svelte, Angular, jQuery, Tailwind).
  - No bundlers, transpilers, or preprocessors (e.g. Webpack, Vite, Babel, TypeScript, Sass).
  - No `package.json` dependencies required to run the project.
  - Every page must work by opening the `.html` file directly in a browser or serving the folder with any static file server.
- **Must work from `file://`.** Hosting is undecided, so:
  - Use relative paths only (no leading `/`).
  - Link to `.../index.html` explicitly; `file://` does not resolve a folder to its index.
  - Don't `fetch()` local data files (blocked on `file://`). Data lives in `.js` files that set a global, like `catalogue.js`.
- **No student data.** No accounts, no tracking, no saving progress or scores (not even `localStorage`), no external requests.
- **Clean, neutral look** with light and dark themes via `prefers-color-scheme`. Must work equally on phones and laptops (no horizontal scroll at 360px wide).

## Layout

```
index.html                    Home page: lists modules
module.html?m=<module-id>     One module's items, grouped as Tools / Lessons / Quizzes
catalogue.js                  The list of modules and items: the only file edited to register content
portal/portal.css, portal.js  Portal-only styling and rendering (items never load these)
items/<module-id>/<item-id>/  One self-contained folder per item; entry point is index.html
```

- The portal pages render entirely from `window.CATALOGUE`; never hand-list items in HTML.
- `portal.js` logs `console.warn` messages for catalogue mistakes (unknown module or type, duplicate ids).

## Items

- Each item is **self-contained**: its own HTML, CSS and JS inside its folder (inline in `index.html`
  is fine; extra files in the same folder are fine too). Items must not import from `portal/` or from other items.
- Its only link out is a back link to its module: `../../../module.html?m=<module-id>`.
- Types: `tool`, `lesson`, `quiz`. The three examples in `items/sample/` are the templates:
  - `base-converter`: tool (inputs that update live)
  - `binary-basics`: lesson (Back/Next steps, with an embedded interactive part)
  - `binary-quiz`: quiz (edit the `QUESTIONS` array; instant feedback; nothing saved)

### Adding an item

1. Copy the example folder of the same type to `items/<module-id>/<new-item-id>/`.
2. Update the `<title>`, heading, back link (module id and label) and content.
3. Add an entry to `items` in `catalogue.js` (`id` must equal the folder name; `module`, `type`, `title`, `summary`).
4. Use `hidden: true` to keep a draft off the portal. It's still reachable by direct URL, so it isn't access control.
5. Open `index.html` from disk and check the item appears, works, and its back link returns to the module.

### Adding a module

Add an entry to `modules` in `catalogue.js` (`id`, `code`, `title`, `description`) and create `items/<module-id>/`.
Use `hidden: true` on a module to keep it off the home page (its module page and items still open by direct link).
The `sample` module is hidden this way; keep its folder, since its items are the templates above.
