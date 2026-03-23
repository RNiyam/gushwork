# Mangalam HDPE — static front-end (`public/`)

Serve this folder with a local HTTP server so `fetch('json/data.json')` works (e.g. `npx serve public` or your IDE’s Live Server).

## Hero image zoom (`js/zoom.js`)

- **What it does:** On desktop, moving the pointer over the main product carousel shows a **square lens** on the image and a **flyout panel** to the right with a magnified view of what sits inside that lens.
- **“What’s in the box”:** The flyout is aligned to the **center of the lens** (not the raw cursor when the lens is clamped at the edges). Background size/position use the same **object-fit: cover** math as the hero `<img>`, so the enlarged pixels match the cropped photo you see.
- **Strength of zoom:** Controlled by `LENS` and `RESULT` at the top of `zoom.js`:
  - **`LENS`** — side length in px of the lens on the hero.
  - **`RESULT`** — side length in px of the flyout (must match `.hero-zoom-result` width/height in `styles.css`).
  - Rough apparent zoom is related to **`RESULT / LENS`** and the image’s cover scale; lower ratio ⇒ less “punch”.
- **Mobile / a11y:** Below **992px** width the lens and flyout are hidden (CSS + JS). If the user prefers reduced motion, zoom is disabled and listeners are not attached.

## Scripts (load order)

1. `js/content.js` — loads JSON, renders sections and carousel markup.  
2. `js/buttons.js` — carousel arrows, nav, accordions, marquees, etc.  
3. `js/zoom.js` — hero magnifier (runs after DOM is ready).  
4. `js/button.js` — modals.  
5. `js/main.js` — `loadPageData()` then `initButtons()`.

`MangalamPage.initHeroImageZoom` is exposed if you need to re-run after a hot swap (guard prevents double-init on the same viewport).
