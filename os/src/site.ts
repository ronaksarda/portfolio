// data.js and art.js are plain scripts shared with the plain site. They set window.SITE and window.ART.
import '../../data.js';
import '../../art.js';

export type Project = {
  id: string; name: string; kicker: string; hook: string; desc: string;
  tags: string[]; points: string[]; repo?: string; live?: string; video?: string; img?: string; viz?: string;
};
export type Site = {
  email: string; discord: string; phone: string; resume: string;
  links: { k: string; v: string; href: string }[];
  journey: { when: string; title: string; org: string; where?: string; current?: boolean; points: string[] }[];
  projects: Project[];
  hangar: { name: string; desc: string; tags: string; progress: number; repo?: string }[];
  lab: { name: string; note: string; repo: string }[];
  trophies: { big: string; title: string; text: string; cert?: string }[];
  certs: { id: string; title: string; by: string }[];
  stack: string[][];
};
type Art = { cover(id: string, cls?: string, fit?: string): string; has(id: string): boolean; logo(cls?: string): string };

declare global { interface Window { SITE: Site; ART: Art } }

export const SITE = window.SITE;
export const ART = window.ART;
// Root data.js paths start with "assets/"; Vite serves that folder as the public root.
export const asset = (p: string) => import.meta.env.BASE_URL + p.replace(/^assets\//, '');
export const certSrc = (id: string) => asset(`certs/${id}.jpg`);
