import { SITE } from './site';

export type Action = { kind: string; arg?: string } | 'clear';
// A line is plain text, or segments of [text, tone] so names and headers can glow brighter than the rest.
export type Tone = 'hi' | 'dim' | 'err' | 'head' | 'prompt';
export type Seg = [string, Tone?];
export type Line = string | Seg[];
export type Result = { out: Line[]; action?: Action };

// Folders and files the terminal knows by name, mapped to the window they open.
const FILES: Record<string, string> = {
  'readme.txt': 'readme', 'experience.txt': 'work', 'projects': 'projects', 'trophies': 'trophies',
  'certificates': 'certs', 'lab': 'lab', 'in-progress': 'hangar', 'resume.pdf': 'resume', 'contact.card': 'contact',
};

const COMMANDS: [string, string][] = [
  ['ls', 'list files and folders'],
  ['ls projects', 'every project, one line each'],
  ['ls trophies', 'wins and ranks'],
  ['open <name>', 'open a file, folder or project'],
  ['cat <file>', 'print readme.txt or experience.txt here'],
  ['whoami', 'who owns this computer'],
  ['stack', 'languages and tools'],
  ['contact', 'how to reach me'],
  ['plain', 'switch to the plain one-page site'],
  ['clear', 'clear the screen'],
];

const findProject = (q: string) =>
  SITE.projects.find((p) => p.id === q || p.name.toLowerCase().replace(/[^a-z0-9]/g, '') === q.replace(/[^a-z0-9]/g, ''));

const head = (t: string): Line => [[t, 'head']];
const row = (k: string, w: number, v: string): Line => [[k.padEnd(w), 'hi'], [v]];

export const BANNER: Line[] = [
  head("ronak's computer"),
  [[`${SITE.projects.length} projects, ${SITE.trophies.length} trophies, ${SITE.certs.length} certificates.`, 'dim']],
  [['Type '], ['help', 'hi'], [' to see commands, or try '], ['open gitspace', 'hi'], ['.']],
  '',
];

export function exec(line: string): Result {
  const [cmd = '', ...rest] = line.trim().split(/\s+/);
  const arg = rest.join(' ').toLowerCase().replace(/\/$/, '');
  switch (cmd.toLowerCase()) {
    case '': return { out: [] };
    case 'help': return { out: [head('Commands'), ...COMMANDS.map(([k, v]) => row(k, 16, v))] };
    case 'ls':
      if (arg === 'projects') return { out: [head(`${SITE.projects.length} projects`), ...SITE.projects.map((p) => row(p.id, 15, p.kicker)), '', [['open <name>', 'hi'], [' to read one.', 'dim']]] };
      if (arg === 'trophies') return { out: [head('Trophies'), ...SITE.trophies.map((t) => row(t.big, 8, t.title))] };
      return { out: [Object.keys(FILES).flatMap((f, i): Seg[] => [[(i ? '  ' : '') + (f.includes('.') ? f : f + '/'), f.includes('.') ? undefined : 'hi']])] };
    case 'open': case 'cd': {
      if (FILES[arg]) return { out: [], action: { kind: FILES[arg] } };
      const p = findProject(arg);
      if (p) return { out: [[['opening ', 'dim'], [p.name, 'hi']]], action: { kind: 'project', arg: p.id } };
      return { out: [[[`open: ${arg || '(nothing)'}: no such file. Type ls or ls projects.`, 'err']]] };
    }
    case 'cat':
      if (arg === 'experience.txt') return { out: SITE.journey.flatMap((j): Line[] => [head(`${j.title}, ${j.org}`), [[j.when, 'dim']], ...j.points.map((t) => '  ' + t), '']) };
      if (arg === 'readme.txt') return { out: [head('Ronak Sarda'), 'Second-year IT at CBIT Hyderabad.', 'Founding Head of Engineering (intern) at FschoolAI.', 'Open to internships from January 2027.'] };
      return { out: [[[`cat: ${arg || '(nothing)'}: try readme.txt or experience.txt`, 'err']]] };
    case 'whoami': return { out: [head('ronak sarda'), row('role', 8, 'founding head of engineering (intern), fschoolai'), row('school', 8, 'b.e. information technology, cbit hyderabad, class of 2029')] };
    case 'stack': case 'neofetch': return { out: SITE.stack.flatMap(([k, ...v]): Line[] => [head(k), '  ' + v.join(', ')]) };
    case 'contact': return { out: [row('email', 10, SITE.email), row('discord', 10, SITE.discord), ...SITE.links.map((l) => row(l.k.toLowerCase(), 10, l.href))] };
    case 'plain': return { out: [[['switching to plain view', 'dim']]], action: { kind: 'plain' } };
    case 'clear': return { out: [], action: 'clear' };
    case 'sudo': return { out: [[['ronak is not in the sudoers file. This incident will be reported to ronak.', 'err']]] };
    default: return { out: [[[`${cmd}: command not found. Type help.`, 'err']]] };
  }
}

// self-check, dev only
if (import.meta.env.DEV) {
  console.assert((exec('open gitspace').action as { arg: string })?.arg === 'gitspace', 'open project');
  console.assert((exec('open Mr. Couch').action as { arg: string })?.arg === 'couch', 'open by name');
  console.assert((exec('cd projects/').action as { kind: string })?.kind === 'projects', 'open folder');
  console.assert(JSON.stringify(exec('nope').out).includes('not found'), 'unknown command');
}
