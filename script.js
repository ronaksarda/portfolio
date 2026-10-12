// Chat-first portfolio. Every answer is assembled from window.SITE (data.js).
// No model and no network calls, except the live GitHub / LeetCode numbers.
(() => {
    const S = window.SITE;
    const $ = (s, el = document) => el.querySelector(s);
    const body = document.body;
    const root = document.documentElement;
    const thread = $('#thread');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
    const ext = (href, label, solid) => `<a class="btn${solid ? ' btn-solid' : ''}" href="${href}" target="_blank" rel="noopener">${label}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg></a>`;

    /* ---------- icons for the quick-question chips ---------- */
    const ico = {
        me: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
        projects: '<path d="M3 7h7l2 2h9v10H3z"/><path d="M3 7V5h6"/>',
        experience: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V4h6v3M3 13h18"/>',
        skills: '<path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
        wins: '<path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H3c0 3 2 5 4 5M17 6h4c0 3-2 5-4 5M12 14v4M8 21h8"/>',
        contact: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
        more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
        resume: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 13h6M9 17h6"/>',
        stats: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
        education: '<path d="m2 9 10-5 10 5-10 5z"/><path d="M6 11v5c3 2 9 2 12 0v-5"/>'
    };
    const svg = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ico[k]}</svg>`;

    /* ---------- intents ---------- */
    const P = S.projects;
    const projById = Object.fromEntries(P.map((p) => [p.id, p]));

    const intents = {
        me: {
            label: 'Me', q: 'Who are you?',
            re: /\b(who|about you|yourself|introduce|ronak|hi|hello|hey|sup)\b/,
            text: () => `I'm Ronak, a second-year IT student at CBIT Hyderabad and the founding AI engineering intern at **FschoolAI**.\nMost of my work is AI agents and RAG pipelines, plus C++ when something has to be fast: ranking 100,000 candidates on one CPU, holding 60 FPS without WebGL, keeping a vision LLM honest.`,
            widget: renderMe,
            follow: ['experience', 'projects', 'wins']
        },
        projects: {
            label: 'Projects', q: 'What have you built?',
            re: /\b(projects?|built|build|repos?|made|portfolio|working on|side)\b/,
            text: () => `Here's what I've shipped. Own repos only, no forks. Tap a card and I'll walk you through it.`,
            widget: renderProjects,
            follow: ['skills', 'wins', 'contact']
        },
        experience: {
            label: 'Experience', q: 'Where have you worked?',
            re: /\b(experience|intern(ship)?|fschool(ai)?|job|company|clubs?|hicon|aws|gdg|organi[sz]er|work(ed)? at)\b/,
            text: () => `Right now I'm the founding AI engineering intern at **FschoolAI**, a San Francisco startup building an AI study platform. Before that, and alongside it: running hackathons for thousands of students at CBIT.`,
            widget: renderJourney,
            follow: ['projects', 'skills', 'resume']
        },
        skills: {
            label: 'Skills', q: 'What is your stack?',
            re: /\b(skills?|stack|tech|languages?|frameworks?|tools?|know)\b/,
            text: () => `Day to day it's TypeScript and React at work, Python for AI pipelines, and C or C++ for anything performance-bound.`,
            widget: renderSkills,
            follow: ['projects', 'stats']
        },
        wins: {
            label: 'Wins', q: 'Any wins or rankings?',
            re: /\b(wins?|awards?|hackathons?|achiev\w*|ranks?|ranking|certific\w*|certs?|troph\w*|prizes?|citadel)\b/,
            text: () => `A few I'm proud of. The highlighted ones are global or national rankings. Certificates sit underneath; tap one to open it.`,
            widget: renderWins,
            follow: ['projects', 'contact']
        },
        contact: {
            label: 'Contact', q: 'How do I reach you?',
            re: /\b(contact|e-?mail|mail|reach|phone|linkedin|discord|hire|call|talk)\b/,
            text: () => `I'm open to internships from **January 2027**, hackathon teams, and good systems conversations. Email is fastest.`,
            widget: renderContact,
            follow: ['resume', 'experience']
        },
        resume: {
            label: 'Resume', q: 'Can I see your resume?',
            re: /\b(resume|résumé|cv|pdf)\b/,
            text: () => `One page, current as of this month.`,
            widget: renderResume,
            follow: ['contact', 'projects']
        },
        stats: {
            label: 'GitHub & LeetCode', q: 'Show me your GitHub and LeetCode.',
            re: /\b(github|leetcode|stats?|contributions?|dsa|commits?)\b/,
            text: () => `Live numbers, pulled when you asked.`,
            widget: renderStats,
            follow: ['projects', 'skills']
        },
        education: {
            label: 'Education', q: 'Where do you study?',
            re: /\b(educat\w*|college|cbit|cgpa|gpa|degree|school|eapcet|study|studying|university)\b/,
            text: () => `B.E. in Information Technology at CBIT, Hyderabad, class of 2029. First-year CGPA **8.68**, TS EAPCET 2025 state rank **3007**. I also finished Harvard's CS50x on the side.`,
            widget: () => `<div class="facts" style="margin-top:0">${S.facts.map((f) => `<div><dt>${esc(f.big)}</dt><dd>${esc(f.label)}</dd></div>`).join('')}</div>`,
            follow: ['experience', 'wins']
        }
    };
    const PRIMARY = ['me', 'projects', 'experience', 'skills', 'wins', 'contact'];
    const MORE = ['resume', 'stats', 'education'];

    /* ---------- resolving free text ---------- */
    const tagIndex = (() => {
        const m = new Map();
        P.forEach((p) => p.tags.forEach((t) => {
            const k = t.toLowerCase().replace(/\s*\(.*\)/, '');
            // "C++17" should also answer a question about "C++"
            for (const key of new Set([k, k.replace(/\d+$/, '')])) {
                if (key.length < 2) continue;
                if (!m.has(key)) m.set(key, { label: key === k ? t : t.replace(/\d+$/, ''), ids: [] });
                if (!m.get(key).ids.includes(p.id)) m.get(key).ids.push(p.id);
            }
        }));
        return m;
    })();
    const bound = (k) => new RegExp(`(^|[^a-z0-9+#])${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^a-z0-9+#])`);

    function resolve(raw) {
        const q = raw.toLowerCase().trim();
        const proj = P.find((p) => q.includes(p.name.toLowerCase()) || q.includes(p.id));
        if (proj) return projectAnswer(proj);

        for (const k of ['contact', 'resume']) if (intents[k].re.test(q)) return { id: k, ...intents[k] };

        for (const [k, v] of tagIndex) {
            if (bound(k).test(q)) {
                const list = v.ids.map((id) => projById[id]);
                return {
                    id: null,
                    text: () => `Yes. ${v.label} shows up in ${list.length === 1 ? 'one of my projects' : `${list.length} of my projects`}:`,
                    widget: () => rail(list),
                    follow: ['skills', 'projects']
                };
            }
        }

        for (const k of ['experience', 'education', 'wins', 'stats', 'skills', 'projects', 'me']) {
            if (intents[k].re.test(q)) return { id: k, ...intents[k] };
        }

        return {
            id: null,
            text: () => `That one isn't in my notes yet, and I'd rather not make something up. These I can answer properly, or email me and I'll reply myself.`,
            widget: () => `<div class="follow" style="margin-top:0">${[...PRIMARY, ...MORE].map((k) => `<button type="button" data-ask="${k}">${esc(intents[k].q)}</button>`).join('')}</div>`,
            follow: []
        };
    }

    function projectAnswer(p) {
        return {
            id: `p-${p.id}`,
            text: () => p.hook,
            widget: () => renderProject(p),
            follow: []
        };
    }

    /* ---------- widgets ---------- */
    function renderMe() {
        return `
        <div class="me">
            <img src="assets/me.jpg" alt="Ronak Sarda" width="180" height="180" loading="lazy">
            <div>
                <h3>Ronak Sarda</h3>
                <p class="me-role">Hyderabad, India · IST</p>
                <p>Technical member of the HICON and AWS clubs at CBIT and a member of GDG Hyderabad. CS50x graduate, HackerRank Gold in C and C++.</p>
                <p>I reached the second interview round at Citadel Securities as a first-year, which still surprises me.</p>
            </div>
        </div>
        <dl class="facts">${S.facts.map((f) => `<div><dt>${esc(f.big)}</dt><dd>${esc(f.label)}</dd></div>`).join('')}</dl>`;
    }

    function cardFoot(p) {
        const flags = [];
        if (p.wip) flags.push('Building');
        if (p.live) flags.push('Live');
        if (p.badge) flags.push(p.badge);
        else if (p.team) flags.push('Team');
        return `<span class="pc-foot">${flags.map((f) => `<span class="flag">${esc(f)}</span>`).join('')}${p.tags.slice(0, 3).map((t) => `<span>${esc(t)}</span>`).join('')}</span>`;
    }

    function rail(list) {
        const id = 'r' + Math.random().toString(36).slice(2, 7);
        return `
        <div class="rail-wrap">
            <div class="rail" id="${id}" tabindex="0" aria-label="Projects, scroll sideways">
                ${list.map((p) => `
                <button class="pcard tone-${p.tone || 'ink'}" type="button" data-project="${p.id}">
                    <span class="pc-kicker">${esc(p.kicker)}</span>
                    <span class="pc-name">${esc(p.name)}</span>
                    ${p.viz === 'gif' ? `<img class="pc-media" src="https://raw.githubusercontent.com/ronaksarda/GitSpace/main/readme_demo.gif" alt="" loading="lazy">` : ''}
                    <span class="pc-hook">${esc(p.hook)}</span>
                    ${cardFoot(p)}
                </button>`).join('')}
            </div>
            ${list.length > 2 ? `<div class="rail-nav">
                <button type="button" data-rail="${id}" data-dir="-1" aria-label="Previous projects"><svg viewBox="0 0 24 24"><path d="m15 6-6 6 6 6"/></svg></button>
                <button type="button" data-rail="${id}" data-dir="1" aria-label="Next projects"><svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg></button>
            </div>` : ''}
        </div>`;
    }

    function renderProjects() {
        return `${rail(P)}
        <h4 class="w-sub">Building right now</h4>
        <ul class="mini-list">${S.hangar.map((h) => `<li>
            ${h.repo ? `<a class="ml-name" href="${h.repo}" target="_blank" rel="noopener">${esc(h.name)}</a>` : `<span class="ml-name">${esc(h.name)}</span>`}
            <span class="ml-note">${esc(h.desc)}</span>
            <span class="bar" role="img" aria-label="${h.progress}% done"><i style="width:${h.progress}%"></i></span>
        </li>`).join('')}</ul>
        <h4 class="w-sub">Smaller things</h4>
        <ul class="mini-list">${S.lab.map((l) => `<li><a class="ml-name" href="${l.repo}" target="_blank" rel="noopener">${esc(l.name)}</a><span class="ml-note">${esc(l.note)}</span></li>`).join('')}</ul>`;
    }

    function renderProject(p) {
        const others = P.filter((x) => x.id !== p.id && x.cat.some((c) => p.cat.includes(c))).slice(0, 3);
        return `
        <article class="detail">
            ${p.viz === 'gif' ? `<img class="detail-media" src="https://raw.githubusercontent.com/ronaksarda/GitSpace/main/readme_demo.gif" alt="GitSpace demo: flying a ship between developer islands" loading="lazy">` : ''}
            <div class="detail-body">
                <p class="detail-kicker">${esc(p.kicker)}${p.badge ? ` · ${esc(p.badge)}` : ''}${p.team ? ' · team build' : ''}${p.wip ? ' · in progress' : ''}</p>
                <h3>${esc(p.name)}</h3>
                <p class="detail-desc">${esc(p.desc)}</p>
                <ul>${p.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
                <div class="tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
                <div class="links">
                    ${p.live ? ext(p.live, 'Open live site', true) : ''}
                    ${ext(p.repo, 'Source on GitHub', !p.live)}
                </div>
            </div>
        </article>
        ${others.length ? `<div class="follow">${others.map((o) => `<button type="button" data-project="${o.id}">What about ${esc(o.name)}?</button>`).join('')}<button type="button" data-ask="projects">All projects</button></div>` : ''}`;
    }

    function renderJourney() {
        return `<ol class="journey">${S.journey.map((j) => `
            <li class="${j.current ? 'now' : ''}">
                <span class="j-when">${esc(j.when)}${j.current ? ' · current' : ''}</span>
                <h4>${esc(j.title)} · ${esc(j.org)}</h4>
                ${j.where ? `<p class="j-where">${esc(j.where)}</p>` : ''}
                <ul>${j.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
            </li>`).join('')}</ol>`;
    }

    function renderSkills() {
        return `<dl class="skills">${S.stack.map(([head, ...items]) => `
            <div><dt>${esc(head)}</dt><dd class="tags">${items.map((t) => `<span>${esc(t)}</span>`).join('')}</dd></div>`).join('')}</dl>`;
    }

    function renderWins() {
        const certById = Object.fromEntries(S.certs.map((c) => [c.id, c]));
        return `
        <ul class="wins">${S.trophies.map((t) => `<li>
            <span class="big">${esc(t.big)}</span>
            <div><h4>${esc(t.title)}</h4><p>${esc(t.text)}</p></div>
            ${t.cert && certById[t.cert] ? `<button class="linkish" type="button" data-cert="${t.cert}">Certificate</button>` : '<span></span>'}
        </li>`).join('')}</ul>
        <h4 class="w-sub">Certificates</h4>
        <div class="certs">${S.certs.map((c) => `
            <button class="cert" type="button" data-cert="${c.id}">
                <img src="assets/certs/${c.id}.jpg" alt="" loading="lazy">
                <b>${esc(c.title)}</b><span>${esc(c.by)}</span>
            </button>`).join('')}</div>`;
    }

    function renderContact() {
        return `
        <button class="mail" type="button" data-copy="${S.email}"><b>${esc(S.email)}</b><span>Copy</span></button>
        <ul class="rows">
            <li><a href="mailto:${S.email}"><span class="k">Email</span><span class="v">Write to me</span><span class="go">mailto</span></a></li>
            <li><a href="tel:${S.phone.replace(/\s/g, '')}"><span class="k">Phone</span><span class="v">${esc(S.phone)}</span><span class="go">call</span></a></li>
            ${S.links.map((l) => `<li><a href="${l.href}" target="_blank" rel="noopener"><span class="k">${esc(l.k)}</span><span class="v">${esc(l.v)}</span><span class="go">open</span></a></li>`).join('')}
            <li><button type="button" data-copy="${S.discord}"><span class="k">Discord</span><span class="v">${esc(S.discord)}</span><span class="go">copy</span></button></li>
        </ul>`;
    }

    function renderResume() {
        return `
        <div class="file">
            <span class="file-ico">PDF</span>
            <div><div class="file-name">Ronak_Sarda_Resume.pdf</div><div class="file-meta">AI engineering · C++ · full-stack</div></div>
            <div class="links">
                <a class="btn" href="${S.resume}" target="_blank" rel="noopener">View</a>
                <a class="btn btn-solid" href="${S.resume}" download>Download</a>
            </div>
        </div>`;
    }

    function renderStats() {
        queueMicrotask(loadStats);
        return `
        <div class="stats">
            <div class="panel">
                <div class="panel-head"><span>GitHub</span><a href="https://github.com/ronaksarda" target="_blank" rel="noopener">@ronaksarda</a></div>
                <div class="nums">
                    <div><b data-gh="repos">55</b><span>public repos</span></div>
                    <div><b data-gh="stars">15</b><span>stars</span></div>
                    <div><b data-gh="followers">7</b><span>followers</span></div>
                </div>
            </div>
            <div class="panel">
                <div class="panel-head"><span>LeetCode</span><a href="https://leetcode.com/u/ronnie0524/" target="_blank" rel="noopener">ronnie0524</a></div>
                <div class="nums">
                    <div><b data-lc="total">334</b><span>solved</span></div>
                    <div><b>18%</b><span>top globally</span></div>
                </div>
                <div class="lc-split" data-lc="split"><i style="flex:167"></i><i style="flex:138"></i><i style="flex:29"></i></div>
                <div class="lc-legend" data-lc="legend"><span>Easy 167</span><span>Medium 138</span><span>Hard 29</span></div>
            </div>
            <div class="panel panel-wide">
                <div class="panel-head"><span>Contributions, last 12 months</span></div>
                <div class="contrib"><img src="https://ghchart.rshah.org/ff4f1a/ronaksarda" alt="GitHub contribution chart for ronaksarda" loading="lazy"></div>
            </div>
        </div>
        <p class="stamp" data-stamp>Showing last saved numbers while live ones load.</p>`;
    }

    function loadStats() {
        const scope = [...thread.querySelectorAll('.stats')].pop()?.parentElement;
        if (!scope) return;
        const set = (sel, v) => scope.querySelectorAll(sel).forEach((el) => (el.textContent = v));
        const stamp = scope.querySelector('[data-stamp]');
        let live = 0;
        const done = () => { if (stamp) stamp.textContent = live ? `Live as of ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.` : 'Live numbers did not load, so these are the last saved ones.'; };

        Promise.allSettled([
            fetch('https://api.github.com/users/ronaksarda/repos?per_page=100').then((r) => r.ok ? r.json() : Promise.reject()).then((repos) => {
                const own = repos.filter((r) => !r.fork);
                set('[data-gh="repos"]', repos.length);
                set('[data-gh="stars"]', own.reduce((a, r) => a + r.stargazers_count, 0));
                live++;
            }),
            fetch('https://api.github.com/users/ronaksarda').then((r) => r.ok ? r.json() : Promise.reject()).then((u) => { set('[data-gh="followers"]', u.followers); live++; }),
            fetch('https://leetcode-api-faisalshohag.vercel.app/ronnie0524').then((r) => r.ok ? r.json() : Promise.reject()).then((d) => {
                if (!d || !d.totalSolved) return;
                set('[data-lc="total"]', d.totalSolved);
                const split = scope.querySelector('[data-lc="split"]');
                if (split) split.innerHTML = `<i style="flex:${d.easySolved}"></i><i style="flex:${d.mediumSolved}"></i><i style="flex:${d.hardSolved}"></i>`;
                const leg = scope.querySelector('[data-lc="legend"]');
                if (leg) leg.innerHTML = `<span>Easy ${d.easySolved}</span><span>Medium ${d.mediumSolved}</span><span>Hard ${d.hardSolved}</span>`;
                live++;
            })
        ]).then(done);
    }

    /* ---------- chat flow ---------- */
    let busy = false;
    const queue = [];

    function md(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); }

    function enterChat() {
        if (body.classList.contains('chatting')) return;
        body.classList.add('chatting');
        window.scrollTo(0, 0);
    }

    function ask(question, answer) {
        if (busy) { queue.push([question, answer]); return; }
        busy = true;
        enterChat();

        const u = document.createElement('div');
        u.className = 'msg msg-user';
        u.innerHTML = `<p>${esc(question)}</p>`;
        thread.appendChild(u);

        const b = document.createElement('div');
        b.className = 'msg msg-bot';
        b.innerHTML = `<img src="assets/me.jpg" alt="" width="32" height="32"><div><p class="bot-text"><span class="typing" aria-label="Typing"><i></i><i></i><i></i></span></p><div class="widget"></div></div>`;
        thread.appendChild(b);
        u.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });

        if (answer.id && !answer.id.startsWith('p-')) history.replaceState(null, '', '#' + answer.id);
        else if (answer.id) history.replaceState(null, '', '#' + answer.id.slice(2));

        const textEl = $('.bot-text', b);
        const html = md(answer.text());
        const finish = () => {
            const w = $('.widget', b);
            w.innerHTML = answer.widget ? answer.widget() : '';
            if (answer.follow && answer.follow.length) {
                w.insertAdjacentHTML('beforeend', `<div class="follow">${answer.follow.map((k) => `<button type="button" data-ask="${k}">${esc(intents[k].q)}</button>`).join('')}</div>`);
            }
            busy = false;
            if (queue.length) ask(...queue.shift());
        };

        setTimeout(() => {
            if (reduced) { textEl.innerHTML = html; finish(); return; }
            // reveal word by word so the answer reads like a reply arriving
            const words = html.split(/(\s+)/);
            let i = 0;
            textEl.innerHTML = '';
            const tick = () => {
                i += 2;
                textEl.innerHTML = words.slice(0, i).join('');
                if (i < words.length) setTimeout(tick, 22);
                else finish();
            };
            tick();
        }, reduced ? 0 : 380);
    }

    const askIntent = (k) => ask(intents[k].q, { id: k, ...intents[k] });
    const askProject = (id) => { const p = projById[id]; if (p) ask(`Tell me about ${p.name}.`, projectAnswer(p)); };
    const askText = (t) => { const v = t.trim(); if (v) ask(v, resolve(v)); };

    /* ---------- chips ---------- */
    function chipsHTML() {
        return PRIMARY.map((k) => `<button class="chip" type="button" data-ask="${k}">${svg(k)}<span>${intents[k].label}</span></button>`).join('') +
            `<button class="chip" type="button" data-more aria-expanded="false" aria-label="More questions">${svg('more')}<span>More</span></button>` +
            `<span class="more-chips" hidden>${MORE.map((k) => `<button class="chip" type="button" data-ask="${k}">${svg(k)}<span>${intents[k].label}</span></button>`).join('')}</span>`;
    }
    $('#hero-chips').innerHTML = chipsHTML();
    $('#dock-chips').innerHTML = chipsHTML();

    /* ---------- events ---------- */
    document.addEventListener('click', (e) => {
        const t = e.target.closest('[data-ask],[data-project],[data-cert],[data-copy],[data-rail],[data-more]');
        if (!t) return;
        if (t.dataset.ask) return askIntent(t.dataset.ask);
        if (t.dataset.project) return askProject(t.dataset.project);
        if (t.dataset.cert) return openCert(t.dataset.cert);
        if (t.dataset.copy) return copy(t);
        if (t.dataset.rail) {
            const r = document.getElementById(t.dataset.rail);
            r.scrollBy({ left: Number(t.dataset.dir) * r.clientWidth * 0.8, behavior: reduced ? 'auto' : 'smooth' });
            return;
        }
        if ('more' in t.dataset) {
            const open = t.getAttribute('aria-expanded') !== 'true';
            t.setAttribute('aria-expanded', open);
            t.nextElementSibling.hidden = !open;
        }
    });

    for (const f of [$('#hero-form'), $('#dock-form')]) {
        f.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = f.querySelector('input');
            askText(input.value);
            input.value = '';
            if (f.id === 'hero-form') setTimeout(() => $('#dock-input').focus({ preventScroll: true }), 0);
        });
    }

    $('#home').addEventListener('click', () => {
        body.classList.remove('chatting');
        thread.innerHTML = '';
        queue.length = 0;
        busy = false;
        history.replaceState(null, '', location.pathname);
        window.scrollTo(0, 0);
    });

    const dockToggle = $('#dock-toggle');
    const setDock = (open) => {
        dockToggle.setAttribute('aria-expanded', open);
        $('#dock-chips').hidden = !open;
        dockToggle.querySelector('span').textContent = open ? 'Hide quick questions' : 'Show quick questions';
    };
    dockToggle.addEventListener('click', () => setDock(dockToggle.getAttribute('aria-expanded') !== 'true'));
    // on short screens the chips would cover most of the answer, so start them folded
    if (innerHeight < 640) setDock(false);

    async function copy(el) {
        const v = el.dataset.copy;
        const label = el.querySelector('.go') || el.querySelector('span:last-child');
        const old = label.textContent;
        try { await navigator.clipboard.writeText(v); label.textContent = 'Copied'; }
        catch { label.textContent = 'Copy failed, select it instead'; }
        setTimeout(() => (label.textContent = old), 1800);
    }

    const lb = $('#lightbox');
    function openCert(id) {
        const c = S.certs.find((x) => x.id === id);
        if (!c) return;
        $('#lb-img').src = `assets/certs/${c.id}.jpg`;
        $('#lb-img').alt = `${c.title} certificate`;
        $('#lb-cap').textContent = `${c.title} · ${c.by}`;
        lb.showModal();
    }
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });

    /* ---------- theme ---------- */
    const themeBtn = $('#theme');
    const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    const syncThemeLabel = () => themeBtn.setAttribute('aria-label', isDark() ? 'Switch to light theme' : 'Switch to dark theme');
    themeBtn.addEventListener('click', () => {
        root.dataset.theme = isDark() ? 'light' : 'dark';
        try { localStorage.setItem('theme', root.dataset.theme); } catch (e) { }
        syncThemeLabel();
    });
    syncThemeLabel();

    /* ---------- deep links: #projects, #contact, #gitspace ---------- */
    const fromHash = () => {
        const h = location.hash.slice(1);
        if (intents[h]) askIntent(h);
        else if (projById[h]) askProject(h);
    };
    window.addEventListener('hashchange', fromHash);
    fromHash();
})();
