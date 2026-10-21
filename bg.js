// Interactive background: a drifting node network that reacts to the cursor.
// Move to pull nodes in and link to them, click to send out a pulse. Pauses when the tab is hidden.
(() => {
    const cv = document.getElementById('bg');
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const root = document.documentElement;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let W = 0, H = 0, dpr = 1, nodes = [], pulses = [], raf = 0, last = 0;
    const mouse = { x: -9999, y: -9999, on: false };
    let ink = '120,120,112', accent = '255,106,61';

    const rgb = (v, fb) => {
        const m = String(v).trim().match(/^#([0-9a-f]{6})$/i);
        return m ? [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)).join(',') : fb;
    };
    const readColors = () => {
        const cs = getComputedStyle(root);
        ink = rgb(cs.getPropertyValue('--ink-3'), ink);
        accent = rgb(cs.getPropertyValue('--accent'), accent);
    };

    const LINK = 130, PULL = 170;
    const resize = () => {
        dpr = Math.min(devicePixelRatio || 1, 2);
        W = innerWidth; H = innerHeight;
        cv.width = W * dpr; cv.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const n = Math.min(90, Math.round((W * H) / 16000));
        while (nodes.length < n) nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, r: 1 + Math.random() * 1.4 });
        nodes.length = n;
        if (reduced.matches) frame(0);
    };

    function frame(t) {
        const dt = Math.min(32, t - last || 16) / 16; last = t;
        ctx.clearRect(0, 0, W, H);

        for (const p of nodes) {
            if (mouse.on) {
                const dx = mouse.x - p.x, dy = mouse.y - p.y, d = Math.hypot(dx, dy);
                if (d < PULL && d > 1) { const f = (1 - d / PULL) * .02; p.vx += dx / d * f; p.vy += dy / d * f; }
            }
            for (const u of pulses) {
                const dx = p.x - u.x, dy = p.y - u.y, d = Math.hypot(dx, dy);
                if (Math.abs(d - u.r) < 28 && d > 1) { p.vx += dx / d * .35; p.vy += dy / d * .35; }
            }
            p.vx *= .985; p.vy *= .985;
            // keep a gentle baseline drift so nodes never freeze
            const s = Math.hypot(p.vx, p.vy);
            if (s < .08) { p.vx += (Math.random() - .5) * .02; p.vy += (Math.random() - .5) * .02; }
            p.x += p.vx * dt; p.y += p.vy * dt;
            if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
            if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;
        }

        ctx.lineWidth = 1;
        for (let i = 0; i < nodes.length; i++) {
            const a = nodes[i];
            for (let j = i + 1; j < nodes.length; j++) {
                const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
                if (d < LINK) {
                    ctx.strokeStyle = `rgba(${ink},${(1 - d / LINK) * .28})`;
                    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
                }
            }
            if (mouse.on) {
                const d = Math.hypot(a.x - mouse.x, a.y - mouse.y);
                if (d < PULL) {
                    ctx.strokeStyle = `rgba(${accent},${(1 - d / PULL) * .6})`;
                    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
                }
            }
        }
        for (const p of nodes) {
            const near = mouse.on && Math.hypot(p.x - mouse.x, p.y - mouse.y) < PULL;
            ctx.fillStyle = `rgba(${near ? accent : ink},${near ? .9 : .55})`;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
        }
        for (const u of pulses) {
            u.r += 5 * dt; u.a -= .014 * dt;
            ctx.strokeStyle = `rgba(${accent},${Math.max(u.a, 0)})`;
            ctx.beginPath(); ctx.arc(u.x, u.y, u.r, 0, 6.2832); ctx.stroke();
        }
        pulses = pulses.filter((u) => u.a > 0);

        if (!reduced.matches) raf = requestAnimationFrame(frame);
    }

    const start = () => { cancelAnimationFrame(raf); if (!reduced.matches && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } };

    addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true; }, { passive: true });
    addEventListener('pointerup', (e) => { if (e.pointerType === 'touch') mouse.on = false; });
    document.addEventListener('mouseleave', () => { mouse.on = false; });
    addEventListener('pointerdown', (e) => {
        if (e.target.closest('button, a, input, dialog, .dock')) return;
        pulses.push({ x: e.clientX, y: e.clientY, r: 4, a: .7 });
    });
    addEventListener('resize', resize);
    document.addEventListener('visibilitychange', start);
    reduced.addEventListener('change', start);
    new MutationObserver(() => { readColors(); if (reduced.matches) frame(0); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => setTimeout(readColors, 0));

    readColors(); resize(); start();
})();
