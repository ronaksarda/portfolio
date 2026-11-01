// One question for the visitor. The answer picks three projects from data.js and one line from me.
// Project cards open through the shared [data-project] click handler in script.js.
(() => {
    const host = document.getElementById('ask');
    if (!host) return;
    const { q, answers } = window.SITE.ask;
    const byId = Object.fromEntries(window.SITE.projects.map((p) => [p.id, p]));
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    const KEY = 'ask-answer';
    const read = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
    const write = (v) => { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch (e) { } };

    function ask() {
        host.innerHTML = `
            <p class="ask-q" id="ask-q">${esc(q)}</p>
            <div class="ask-opts" role="group" aria-labelledby="ask-q">
                ${answers.map((a) => `<button type="button" class="ask-opt" data-k="${a.k}">${esc(a.label)}</button>`).join('')}
            </div>`;
    }

    function answer(a) {
        const email = window.SITE.email;
        host.innerHTML = `
            <p class="ask-q">${esc(a.label)}</p>
            <p class="ask-line">${esc(a.line)}</p>
            <div class="ask-picks">
                ${a.picks.map((id) => byId[id]).filter(Boolean).map((p) => `
                    <button type="button" class="ask-pick tone-${p.tone || 'ink'}" data-project="${p.id}">
                        <span class="ask-pick-name">${esc(p.name)}</span>
                        <span class="ask-pick-hook">${esc(p.hook)}</span>
                    </button>`).join('')}
            </div>
            <div class="ask-actions">
                <a class="btn btn-blue" href="mailto:${email}">Email me</a>
                <a class="btn btn-glass" href="${window.SITE.resume}" download>Resume</a>
                <button type="button" class="btn btn-glass" data-again>Ask me differently</button>
            </div>`;
    }

    host.addEventListener('click', (e) => {
        const opt = e.target.closest('[data-k]');
        if (opt) { write(opt.dataset.k); answer(answers.find((a) => a.k === opt.dataset.k)); return; }
        if (e.target.closest('[data-again]')) { write(null); ask(); host.querySelector('.ask-opt').focus(); }
    });

    const saved = answers.find((a) => a.k === read());
    saved ? answer(saved) : ask();
})();
