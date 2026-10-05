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
- **Progress stays on the trainee's device.** No accounts, no server, no external requests, no analytics.
  - `tracker.js` saves progress and quiz results in `localStorage` only. This is the main place student data is stored.
  - Exception: `items/aircraft/aircraft-familiarisation/` also has a trainee sign-in (name + trainee ID) and saves each
    trainee's completed modules and best Parts Check scores in its own `localStorage` keys (`aircraft-training-*`).
    Its `dashboard.html` (password-gated, client-side only, so not real security) reads those keys, so it only sees
    trainees who used that same browser on that same device. Keep module titles and keys in sync between its `app.js`
    and `dashboard.js`.
  - A trainee shares progress by downloading a file from `progress.html` and handing it in (e.g. via the LMS).
  - `instructor.html` reads those files in the browser and keeps them in memory only: it never saves or uploads them.
  - Render names and other file content with `textContent`, never `innerHTML`.
- **Clean, neutral look** with light and dark themes via `prefers-color-scheme`. Must work equally on phones and laptops (no horizontal scroll at 360px wide).

## Layout

```
index.html                    Home page: lists modules
module.html?m=<module-id>     One module's items, grouped as Tools / Lessons / Quizzes
progress.html                 Trainee's own progress and weak topics; downloads their progress file
instructor.html               Class overview built from trainees' progress files
catalogue.js                  The list of modules and items: the only file edited to register content
tracker.js                    Saves progress in localStorage; the only shared file items may load
portal/portal.css, portal.js  Portal-only styling and rendering (items never load these)
portal/summary.js             Turns saved progress into completion, scores and weak topics
portal/instructor.js          Instructor dashboard; portal/sample-class.js is its demo data
items/<module-id>/<item-id>/  One self-contained folder per item; entry point is index.html
```

- The portal pages render entirely from `window.CATALOGUE`; never hand-list items in HTML.
- `portal.js` logs `console.warn` messages for catalogue mistakes (unknown module or type, duplicate ids).

## Items

- Each item is **self-contained**: its own HTML, CSS and JS inside its folder (inline in `index.html`
  is fine; extra files in the same folder are fine too). Items must not import from `portal/` or from other items.
  The one exception is `../../../tracker.js`; items must still work if it fails, so guard calls with `if (window.Tracker)`.
- Its only link out is a back link to its module: `../../../module.html?m=<module-id>`.
- Types: `tool`, `lesson`, `quiz`. The three examples in `items/sample/` are the templates:
  - `base-converter`: tool (inputs that update live)
  - `binary-basics`: lesson (Back/Next steps, with an embedded interactive part)
  - `binary-quiz`: quiz (edit the `QUESTIONS` array; give each question a `topic`; instant feedback)

### Progress tracking in items

Each item loads the tracker in its `<head>` with its own ids:
`<script src="../../../tracker.js" data-module="<module-id>" data-item="<item-id>" data-type="<type>"></script>`

- Tool: nothing more; the first click or input marks it done.
- Lesson: call `Tracker.complete()` when the last step is shown.
- Quiz: call `Tracker.quizResult(score, total, answers)` when every question is answered, with
  `answers` as `[{ q, topic, correct }]`.
- Any item can call `Tracker.quizResult` for a check or round it scores (the aircraft Parts Checks and
  Cut the Thrust's training activities do). Only quizzes are marked done by it.
- Scores use each question's **latest** answer, so keep `q` unique and stable within an item
  (include the variant in it, e.g. `"Fixed-wing · Ribs: …"`).
- Topics drive the "weak areas" lists: reuse the same topic name for questions that test the same idea.
- If an item's question names or topics change, update `portal/sample-class.js` to match.

### Adding an item

1. Copy the example folder of the same type to `items/<module-id>/<new-item-id>/`.
2. Update the `<title>`, heading, back link (module id and label), the `tracker.js` ids and content.
3. Add an entry to `items` in `catalogue.js` (`id` must equal the folder name; `module`, `type`, `title`, `summary`).
4. Use `hidden: true` to keep a draft off the portal. It's still reachable by direct URL, so it isn't access control.
5. Open `index.html` from disk and check the item appears, works, and its back link returns to the module.

### Adding a module

Add an entry to `modules` in `catalogue.js` (`id`, `code`, `title`, `description`) and create `items/<module-id>/`.
Use `hidden: true` on a module to keep it off the home page (its module page and items still open by direct link).
The `sample` module is hidden this way; keep its folder, since its items are the templates above.
