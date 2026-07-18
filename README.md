# p4muki — personal site

This folder contains a ready-to-publish site for GitHub Pages: `index.html`, `style.css`, `script.js`.

## Publishing (GitHub Pages)

1. On GitHub, create a repo named `p4muki.github.io` (it must match your username exactly if it's a user site).
2. Upload these files (`index.html`, `style.css`, `script.js`) and your `logo.png` to the root of the repo.
3. Go to the repo's **Settings → Pages**, set "Branch" to `main`, and save.
4. Within a few minutes the site will be live at: `https://p4muki.github.io`

If it's a separate project repo (not a user site), follow the same steps; the live URL will be `username.github.io/repo-name`.

## What to customize

- The 3 cards in the **Projects** section are placeholders — replace them with your own projects.
- The `codeLines` array in `script.js` builds the "typing" code block in the hero — update it with your own info.
- The GitHub link (`github.com/p4muki`) is a placeholder — replace it with your real username.
- The email address (`pamuki2020@gmail.com`) is already wired into the contact section and copies to clipboard on click.
- Upload `logo.png` to the root of the repo — it's already used in the header and as the favicon.

## Note

The site is fully static (no server needed), so no extra setup is required for GitHub Pages.
