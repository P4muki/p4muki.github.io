# p4muki — personal site

This folder contains a ready-to-publish site for GitHub Pages:
`index.html`, `blog.html`, `gallery.html`, `now.html`, `search.html`, `style.css`, `script.js`, `logo.png`.

## Publishing (GitHub Pages)

1. On GitHub, create a repo named `p4muki.github.io` (it must match your username exactly if it's a user site).
2. Upload **all** the files above to the root of the repo (all 5 HTML pages, `style.css`, `script.js`, `logo.png`).
3. Go to the repo's **Settings → Pages**, set "Branch" to `main`, and save.
4. Within a few minutes the site will be live at: `https://p4muki.github.io`

If it's a separate project repo (not a user site), follow the same steps; the live URL will be `username.github.io/repo-name`.

## Pages

- **Home** (`index.html`) — hero, About, Skills, Projects, Contact + guestbook.
- **Blog** (`blog.html`) — a simple devlog list. Each `.blog-card` is a placeholder post; duplicate the block to add a new entry.
- **Gallery** (`gallery.html`) — a grid for PVP clips/screenshots. Swap each `.gallery-thumb` div for an `<img>` or `<video>` tag once you upload real files.
- **Now** (`now.html`) — a "what I'm currently doing" list, inspired by the nownownow.com idea. Update the entries and the "last updated" date whenever your focus changes.
- **Search Helper** (`search.html`) — type an item and get one-click links that open a pre-filled search on both FINN.no and Facebook Marketplace.

## New features

- **Dark / light mode toggle** — the sun/moon button in the header. The choice is remembered per-browser (`localStorage`) and applied instantly on page load (no flash of the wrong theme).
- **Animated stat counters** — in the About section on the homepage, count up when scrolled into view. Edit the `data-count-to` values in `index.html` to change the numbers.
- **Guestbook** — on the homepage Contact section. Visitor messages are saved in that visitor's own browser (`localStorage`), since this is a static site with no server/database. That means entries are **not shared between visitors** — you'll only see messages left on your own device/browser. If you want a real shared guestbook later, a free option is [Giscus](https://giscus.app) (uses GitHub Discussions as the backend and works great with GitHub Pages) — happy to wire that in if you want it.
- **Search Helper** — see above. Important: this doesn't run a live AI comparison of listings. Neither FINN.no nor Facebook Marketplace offer a public search API, and Facebook actively blocks automated scraping of Marketplace, so there's no way to pull and rank real listings from a static GitHub Pages site. What it does instead is open both sites' search results in new tabs with your query already filled in, so you can compare them yourself in seconds.

## What to customize

- The 3 cards in the **Projects** section are placeholders — replace them with your own projects.
- The `codeLines` array in `script.js` builds the "typing" code block in the hero — update it with your own info.
- The GitHub link (`github.com/p4muki`) is a placeholder — replace it with your real username.
- The email address (`pamuki2020@gmail.com`) is already wired into the contact section and copies to clipboard on click.
- Blog posts, gallery items, and Now-page entries are all placeholder content — edit or duplicate the blocks in each file.
- `logo.png` is already used in the header and as the favicon on every page.

## Note

The site is fully static (no server needed), so no extra setup is required for GitHub Pages.
