# ronaksarda.github.io

Personal site of **Ronak Sarda**: Founding AI Engineering Intern @ FschoolAI, B.E. IT @ CBIT Hyderabad (class of 2029).

Live: **https://ronaksarda.github.io**

A chat-first portfolio. Ask a question or tap a quick chip (Me, Projects, Experience, Skills, Wins, Contact) and the answer arrives as a reply with a real widget: a project rail, a project deep-dive, a timeline, a certificate wall, contact rows, live GitHub and LeetCode numbers.

There is no model behind it. Answers are assembled from `data.js`, and free text is matched against intents, project names and tech tags. Unknown questions get an honest "not in my notes" plus the questions it can answer.

Deep links work: `#projects`, `#contact`, `#wins`, or a project id such as `#gitspace`.

Plain HTML, CSS and JavaScript. No build step, no frameworks.

| File | What it holds |
|---|---|
| `index.html` | hero, thread, dock, lightbox |
| `data.js` | every fact the site says (edit this to update content) |
| `script.js` | intents, free-text matching, widgets, chat flow, theme |
| `styles.css` | everything visual, light and dark tokens |

Run locally: `python -m http.server` and open http://localhost:8000.
