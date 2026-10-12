# Deploying to GitHub Pages

This project is plain HTML, CSS and JavaScript. There is **nothing to build or install**. GitHub Pages serves the
files exactly as they are in the repository.

The site will be at:

```
https://<your-username>.github.io/<repository-name>/
```

All links in the project are relative, so it works under that `/<repository-name>/` path and also from a custom domain.

## Before you publish

1. Run the checker from the repository root (needs Node.js, nothing else):

   ```
   node tools/check-links.js
   ```

   It should print `OK`. It checks every link and file reference, the catalogue, and that no page asks for anything
   from the internet.
2. Open `index.html` from disk and click through a module to be sure everything loads.
3. Make sure the work you want to publish is on the branch Pages will use (usually `main`).
   The Fuel System Learning Centre was developed on the branch `claude/magical-ramanujan-spb7ml`; merge it into
   `main` first (for example with a pull request).

The repository already contains a `.nojekyll` file. It tells GitHub Pages to serve the files as they are, without
running them through Jekyll.

## Option A: publish from a branch (simplest)

1. On GitHub, open the repository and go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Under **Branch**, choose `main` and the folder `/ (root)`, then click **Save**.
4. Wait one to two minutes. The page shows the address of your site. You can also follow progress in the **Actions** tab.
5. Open the address. The portal home page (`index.html`) opens and asks the trainee to sign in.

Every push to `main` after this updates the site automatically.

## Option B: publish with GitHub Actions

The workflow file `.github/workflows/pages.yml` is already in the repository. It runs the checker and then publishes.

1. Go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
2. Open the **Actions** tab, choose **Deploy to GitHub Pages**, click **Run workflow**, and pick `main`.
3. When the run is green, open the address shown in the run summary.

To publish on every push to `main`, edit `.github/workflows/pages.yml` and remove the `#` in front of the three
`push:` lines.

## After publishing: check it works

Open the site in a normal browser window and check:

- The home page loads with its styling and the sign-in box.
- Sign in, open a module, open an item, and use its **back** link.
- Open **Aircraft Fuel Systems → Aircraft Fuel System Learning Centre**. Click through the menu, move the fuel
  slider, take a quiz question, and open **My Progress**.
- Open `progress.html` and `instructor.html` from the links on the home page.
- Reload the page: progress should still be there.
- Try it on a phone.

## Things to know

- **Progress is saved in each trainee's own browser.** There is no server and no database. A different browser, device
  or address (for example a new custom domain) starts with no saved progress. Trainees hand in progress files from
  `progress.html`.
- **Pages share one browser storage per account.** All project sites under `<username>.github.io` share the same
  origin, so another site on the same account could read these saved keys. The portal stores only a name, a trainee ID
  and scores, and the ID is a label, not a login. Do not put anything sensitive in these fields. A custom domain gives
  the site its own storage.
- **Anyone with the link can open the site.** A GitHub Pages site is public unless your plan and organisation settings
  allow a private one. Pages such as the aircraft dashboard password are client-side only and are not real security.
  Do not publish anything that must stay confidential.
- **Cached files:** after an update, a browser may show the old version for a few minutes. Do a hard refresh
  (Ctrl+Shift+R, or Cmd+Shift+R on a Mac).

## Previewing on your own computer

From the repository root:

```
python3 -m http.server
```

Then open `http://localhost:8000/`. This behaves like GitHub Pages. You can also just open `index.html` from disk.

## Troubleshooting

| Problem | What to check |
|---------|---------------|
| The site address shows "404" | Pages is not turned on yet, or the branch or folder is wrong. Re-check **Settings → Pages**. The first publish can take a few minutes. |
| The page is there but has no styling | A file name or folder has the wrong capital letters. GitHub Pages is case-sensitive. Run `node tools/check-links.js`. |
| A link goes to a "404" page | The file does not exist or the link starts with `/`. Use relative links and link to `.../index.html`. The checker finds both. |
| Progress is not saved | The browser may block storage (private window, strict settings). Use a normal window. |
| The Actions run fails at "Configure Pages" | Pages is not enabled with the **GitHub Actions** source. See Option B, step 1. |
| The Actions run fails at "Check links and assets" | Read the lines that start with `PROBLEM`. They name the file and the problem. |
