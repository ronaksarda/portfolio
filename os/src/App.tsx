import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { SITE, ART, asset, certSrc, type Project } from './site';
import { Icon, Astronaut, type IconName } from './icons';
import Wallpaper from './Wallpaper';
import { exec, BANNER, type Line } from './terminal';

const GITSPACE_DEMO = 'https://raw.githubusercontent.com/ronaksarda/GitSpace/main/readme_demo.gif';

const PLAIN_URL = 'plain.html';
const BAR = 32; // menubar height; windows never go above it

type Win = { key: string; kind: string; arg?: string; x: number; y: number; z: number };

const DESKTOP: { kind: string; label: string; icon: IconName }[] = [
  { kind: 'readme', label: 'readme.txt', icon: 'doc' },
  { kind: 'work', label: 'experience.txt', icon: 'doc' },
  { kind: 'projects', label: 'Projects', icon: 'folder' },
  { kind: 'trophies', label: 'Trophies', icon: 'trophy' },
  { kind: 'certs', label: 'Certificates', icon: 'folder' },
  { kind: 'resume', label: 'resume.pdf', icon: 'pdf' },
  { kind: 'terminal', label: 'Terminal', icon: 'terminal' },
  { kind: 'lab', label: 'Lab', icon: 'flask' },
  { kind: 'hangar', label: 'In progress', icon: 'hourglass' },
  { kind: 'contact', label: 'contact.card', icon: 'card' },
];

const SIZE: Record<string, [number, number]> = {
  readme: [470, 420], work: [580, 500], projects: [640, 460], project: [580, 560], trophies: [500, 480],
  certs: [640, 460], image: [700, 520], resume: [720, 600], terminal: [600, 380], lab: [480, 420],
  hangar: [460, 380], contact: [420, 360],
};

const project = (id?: string) => SITE.projects.find((p) => p.id === id);
const imgSrc = (p: Project) => p.img && (/^https?:/.test(p.img) ? p.img : asset(p.img));
const thumb = (p: Project) => p.img ? <img className="thumb" src={imgSrc(p)} alt="" loading="lazy" />
  : ART.has(p.id) ? <span className="thumb" dangerouslySetInnerHTML={{ __html: ART.cover(p.id, 'thumb-art') }} /> : undefined;
const cert = (id?: string) => SITE.certs.find((c) => c.id === id);

function title(w: Win) {
  if (w.kind === 'project') return project(w.arg)?.name ?? 'Project';
  if (w.kind === 'image') return `${cert(w.arg)?.title ?? 'Certificate'}.jpg`;
  return DESKTOP.find((d) => d.kind === w.kind)?.label ?? w.kind;
}

export default function App() {
  const [wins, setWins] = useState<Win[]>([]);
  const top = useRef(10);
  const opened = useRef(0);

  function open(kind: string, arg?: string) {
    if (kind === 'plain') { location.href = PLAIN_URL; return; }
    const key = arg ? `${kind}:${arg}` : kind;
    const z = ++top.current;
    setWins((ws) => {
      if (ws.some((w) => w.key === key)) return ws.map((w) => (w.key === key ? { ...w, z } : w));
      const [w, h] = SIZE[kind] ?? [480, 400];
      const n = opened.current++ % 8;
      const x = Math.max(8, Math.min(innerWidth - w - 8, 170 + n * 28));
      const y = Math.max(BAR + 8, Math.min(innerHeight - h - 8, BAR + 24 + n * 28));
      return [...ws, { key, kind, arg, x, y, z }];
    });
  }
  const close = (key: string) => setWins((ws) => ws.filter((w) => w.key !== key));
  const focus = (key: string) => setWins((ws) => ws.map((w) => (w.key === key ? { ...w, z: ++top.current } : w)));
  const move = (key: string, x: number, y: number) => setWins((ws) => ws.map((w) => (w.key === key ? { ...w, x, y } : w)));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setWins((ws) => { const t = ws.reduce<Win | null>((a, w) => (!a || w.z > a.z ? w : a), null); return t ? ws.filter((w) => w !== t) : ws; });
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, []);

  const topZ = Math.max(0, ...wins.map((w) => w.z));

  return (
    <div className="os">
      <MenuBar onLogo={() => open('readme')} />
      <main className="desktop">
        <Wallpaper />
        <button className="astro" onClick={() => open('readme')} aria-label="Astronaut. Open readme.txt"><Astronaut size={88} /></button>
        <nav className="icons" aria-label="Desktop">
          {DESKTOP.map((d) => (
            <DeskIcon key={d.kind} icon={d.icon} label={d.label} onOpen={() => open(d.kind)} />
          ))}
        </nav>
        <Stickers onOpen={() => open('trophies')} />
        {wins.map((w) => (
          <Window key={w.key} win={w} title={title(w)} active={w.z === topZ}
            onClose={() => close(w.key)} onFocus={() => focus(w.key)} onMove={(x, y) => move(w.key, x, y)}>
            <Content win={w} open={open} />
          </Window>
        ))}
      </main>
    </div>
  );
}

function MenuBar({ onLogo }: { onLogo: () => void }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 15000); return () => clearInterval(t); }, []);
  return (
    <header className="bar">
      <button className="bar-logo" onClick={onLogo} aria-label="Open readme.txt"><Astronaut size={24} /></button>
      <span className="bar-name">Ronak Sarda</span>
      <span className="bar-gap" />
      <a className="bar-btn" href={PLAIN_URL}>Plain view</a>
      <time className="bar-clock">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
    </header>
  );
}

// one click opens: visitors on the web expect links, not desktop double-clicks
function DeskIcon({ icon, label, onOpen, thumb }: { icon: IconName; label: string; onOpen: () => void; thumb?: ReactNode }) {
  return (
    <button className="dicon" onClick={onOpen}>
      <span className="dicon-img">{thumb ?? <Icon name={icon} />}</span>
      <span className="dicon-label">{label}</span>
    </button>
  );
}

// picked by the trophy's big label so reordering data.js does not swap stickers
const STICKERS = [
  { big: '#329', rot: -7, x: 74, y: 10, color: '#F2B134' },
  { big: 'Top 7', rot: 5, x: 86, y: 26, color: '#F28AB8' },
  { big: 'Top 15', rot: -4, x: 72, y: 42, color: '#C9B6F2' },
  { big: '#138', rot: 6, x: 86, y: 58, color: '#8FE3C0' },
  { big: 'Top 10', rot: -2, x: 74, y: 72, color: '#9CC8F5' },
];

function Stickers({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="stickers">
      {STICKERS.map((s) => {
        const t = SITE.trophies.find((x) => x.big === s.big);
        if (!t) return null;
        return (
          <button key={t.title} className="sticker" onClick={onOpen} aria-label={`${t.big}, ${t.title}. Open Trophies`}
            style={{ left: `${s.x}%`, top: `${s.y}%`, rotate: `${s.rot}deg`, background: s.color }}>
            <b>{t.big}</b><span>{t.title}</span>
          </button>
        );
      })}
    </div>
  );
}

function Window({ win, title, active, children, onClose, onFocus, onMove }: {
  win: Win; title: string; active: boolean; children: ReactNode; onClose: () => void; onFocus: () => void; onMove: (x: number, y: number) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const [w, h] = SIZE[win.kind] ?? [480, 400];
  // focus the new window unless something inside it (terminal input) already took focus
  useEffect(() => { if (!ref.current?.contains(document.activeElement)) ref.current?.focus(); }, []);

  function drag(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest('button')) return;
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    const dx = e.clientX - win.x, dy = e.clientY - win.y;
    const mv = (ev: PointerEvent) => onMove(
      Math.max(-w + 80, Math.min(innerWidth - 80, ev.clientX - dx)),
      Math.max(BAR, Math.min(innerHeight - 40, ev.clientY - dy)));
    const up = () => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); };
    el.addEventListener('pointermove', mv);
    el.addEventListener('pointerup', up);
  }

  return (
    <section ref={ref} tabIndex={-1} role="dialog" aria-label={title} className={`win${active ? ' is-active' : ''}`}
      style={{ left: win.x, top: win.y, width: w, height: h, zIndex: win.z }} onPointerDown={onFocus}>
      <div className="win-title" onPointerDown={drag}>
        <span>{title}</span>
        <button className="win-x" onClick={onClose} aria-label={`Close ${title}`}>×</button>
      </div>
      <div className="win-body">{children}</div>
    </section>
  );
}

type Open = (kind: string, arg?: string) => void;

function Content({ win, open }: { win: Win; open: Open }) {
  switch (win.kind) {
    case 'readme': return (
      <article className="paper">
        <h1>Hi, I'm Ronak Sarda.</h1>
        <p>Second-year IT student at CBIT Hyderabad, and Founding Head of Engineering (intern) at FschoolAI, where I lead an 8-person team shipping an AI study platform.</p>
        <p>I build AI agents with hard limits, and reach for C++ when speed matters. Open to internships from January 2027.</p>
        <h2>Using this computer</h2>
        <ul>
          <li>Click any icon on the left.</li>
          <li>Type <code>help</code> in Terminal.</li>
          <li>In a hurry? <a href={PLAIN_URL}>Plain view</a>, top right, has everything on one page.</li>
        </ul>
      </article>
    );
    case 'work': return (
      <article className="paper">
        {SITE.journey.map((j) => (
          <section key={j.title}>
            <h2>{j.title}, {j.org}</h2>
            <p className="meta">{j.when}{j.where ? `. ${j.where}` : ''}</p>
            <ul>{j.points.map((t) => <li key={t}>{t}</li>)}</ul>
          </section>
        ))}
      </article>
    );
    case 'projects': return (
      <div className="folder">
        {SITE.projects.map((p) => (
          <DeskIcon key={p.id} icon="doc" label={p.name} onOpen={() => open('project', p.id)} thumb={thumb(p)} />
        ))}
      </div>
    );
    case 'project': { const p = project(win.arg); return p ? <ProjectDoc p={p} /> : null; }
    case 'trophies': return (
      <ul className="paper trophies">
        {SITE.trophies.map((t) => (
          <li key={t.title}>
            <b className="big">{t.big}</b>
            <div>
              <h2>{t.title}</h2>
              <p>{t.text}</p>
              {t.cert && <button className="btn" onClick={() => open('image', t.cert)}>Open certificate</button>}
            </div>
          </li>
        ))}
      </ul>
    );
    case 'certs': return (
      <div className="prints">
        {SITE.certs.map((c) => (
          <button key={c.id} className="print" onClick={() => open('image', c.id)}>
            <img src={certSrc(c.id)} alt="" loading="lazy" />
            <b>{c.title}</b>
            <span>{c.by}</span>
          </button>
        ))}
      </div>
    );
    case 'image': { const c = cert(win.arg); return c ? (
      <figure className="viewer">
        <img src={certSrc(c.id)} alt={`${c.title} certificate`} />
        <figcaption>{c.title}. {c.by}</figcaption>
      </figure>) : null; }
    case 'resume': return (
      <div className="resume">
        <div className="toolbar"><a className="btn" href={asset(SITE.resume)} download>Download resume.pdf</a></div>
        <iframe src={asset(SITE.resume)} title="Ronak Sarda resume" />
      </div>
    );
    case 'terminal': return <Terminal open={open} />;
    case 'lab': return (
      <div className="listing-wrap">
        <table className="listing">
          <caption>{SITE.lab.length} small tools and experiments. Each name opens its code.</caption>
          <thead><tr><th scope="col">Name</th><th scope="col">What it does</th></tr></thead>
          <tbody>
            {SITE.lab.map((l) => (
              <tr key={l.name}>
                <td><a href={l.repo} target="_blank" rel="noreferrer"><Icon name="flask" size={16} />{l.name}</a></td>
                <td>{l.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    case 'hangar': return (
      <article className="paper">
        {SITE.hangar.map((h) => (
          <section key={h.name}>
            <h2>{h.name}</h2>
            <p>{h.desc}</p>
            <div className="progress" role="progressbar" aria-valuenow={h.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${h.name} progress`}>
              <span style={{ width: `${h.progress}%` }} />
            </div>
            <p className="meta">{h.progress}% done. {h.tags}</p>
          </section>
        ))}
      </article>
    );
    case 'contact': return (
      <article className="paper">
        <h1>Ronak Sarda</h1>
        <dl className="card">
          <dt>Email</dt><dd><a href={`mailto:${SITE.email}`}>{SITE.email}</a></dd>
          <dt>Discord</dt><dd>{SITE.discord}</dd>
          {SITE.links.map((l) => <Fragment key={l.k}><dt>{l.k}</dt><dd><a href={l.href} target="_blank" rel="noreferrer">{l.v}</a></dd></Fragment>)}
        </dl>
      </article>
    );
  }
  return null;
}

function ProjectDoc({ p }: { p: Project }) {
  const art = p.viz === 'gif' ? <img src={GITSPACE_DEMO} alt={`${p.name} demo`} />
    : p.img ? <img src={imgSrc(p)} alt={`${p.name} screenshot`} /> : ART.has(p.id) ? <span dangerouslySetInnerHTML={{ __html: ART.cover(p.id, 'cover-art') }} /> : null;
  return (
    <article className="paper project">
      {art && <div className="cover">{art}</div>}
      <h1>{p.name}</h1>
      <p className="meta">{p.kicker}</p>
      <p className="hook">{p.hook}</p>
      <p>{p.desc}</p>
      <ul>{p.points.map((t) => <li key={t}>{t}</li>)}</ul>
      <p className="meta">{p.tags.join(', ')}</p>
      <div className="links">
        {p.live && <a className="btn" href={p.live} target="_blank" rel="noreferrer">Open live site</a>}
        {p.video && <a className="btn" href={`https://youtu.be/${p.video}`} target="_blank" rel="noreferrer">Watch demo</a>}
        {p.repo && <a className="btn" href={p.repo} target="_blank" rel="noreferrer">View code</a>}
      </div>
    </article>
  );
}

const Prompt = () => <><span className="t-user">ronak@cbit</span><span className="t-dim">:~$</span></>;

function TermLine({ l }: { l: Line }) {
  if (typeof l === 'string') return <div>{l || ' '}</div>;
  if (l[0]?.[1] === 'prompt') return <div><Prompt /> {l[0][0]}</div>;
  return <div>{l.map(([t, tone], i) => t.endsWith(' ') && tone === 'hi'
    // padded key column: Pixelon is proportional, so spaces can't line up the values; size the cell instead
    ? <span key={i} className="t-hi" style={{ display: 'inline-block', minWidth: `${t.length}ch`, paddingRight: '1ch' }}>{t.trimEnd()}</span>
    : <span key={i} className={tone ? `t-${tone}` : undefined}>{t}</span>)}</div>;
}

function Terminal({ open }: { open: Open }) {
  const [lines, setLines] = useState<Line[]>(BANNER);
  const [input, setInput] = useState('');
  const inRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [lines]);

  function run(e: React.FormEvent) {
    e.preventDefault();
    const r = exec(input);
    setInput('');
    if (r.action === 'clear') { setLines([]); return; }
    setLines((l) => [...l, [[input, 'prompt']], ...r.out]);
    if (r.action) open(r.action.kind, r.action.arg);
  }

  return (
    <div className="term" onClick={() => inRef.current?.focus()}>
      {lines.map((l, i) => <TermLine key={i} l={l} />)}
      <form onSubmit={run} className="term-row">
        <label htmlFor="term-in"><Prompt /></label>
        <input id="term-in" ref={inRef} value={input} onChange={(e) => setInput(e.target.value)} autoComplete="off" spellCheck={false} autoFocus />
      </form>
      <div ref={endRef} />
    </div>
  );
}
