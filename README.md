# ronaksarda.github.io

Personal site of **Ronak Sarda**: Founding Head of Engineering at FschoolAI, B.E. IT @ CBIT Hyderabad (class of 2029).

Live: **https://ronaksarda.github.io**

Two views of the same content, both read from `data.js`:

- **Desktop** (home page): a retro computer. Folders for projects, trophies and certificates, a working terminal, trophy stickers, and a live pixel black hole wallpaper. Built with Vite, React, TypeScript and Three.js; source in `os/`.
- **Plain view** (`plain.html`): one scrolling page for a quick read. Plain HTML, CSS and JavaScript, no build step.

| File | What it holds |
|---|---|
| `data.js` | every fact the site says (edit this to update content) |
| `assets/` | photos, certificates, resume PDF, shared by both views |
| `os/` | desktop source |
| `index.html`, `desktop/` | built desktop (generated, do not edit) |
| `plain.html`, `script.js`, `styles.css`, `fluid.js` | plain view |

GitHub Pages serves the repo as-is, so the built desktop is committed. After changing `os/` or `data.js`:

```
npm --prefix os run build
```

Run locally: `npm --prefix os run dev` for the desktop, or `python -m http.server` and open http://localhost:8000/plain.html for the plain view.
