// 16x16 pixel icons, drawn as rows of palette letters. "." is transparent.
const PAL: Record<string, string> = {
  k: '#000', y: '#F2B134', Y: '#F8D27A', w: '#FFFDF4', g: '#8A8090', r: '#D9483B', p: '#3B2A4A',
  d: '#140D04', a: '#FFB33F', b: '#4A2F1D', s: '#F1C27D', G: '#5FD08A', S: '#9CC8F5',
};

const doc = (band = 'g') => [
  '..kkkkkkkkk.....', '..kwwwwwwwkk....', '..kwwwwwwwkwk...', '..kwgggggwkkkk..', '..kwwwwwwwwwwk..',
  '..kwggggggggwk..', '..kwwwwwwwwwwk..', band === 'r' ? '..krrrrrrrrrrk..' : '..kwggggggggwk..',
  band === 'r' ? '..krrrrrrrrrrk..' : '..kwwwwwwwwwwk..', '..kwgggggggwwk..', '..kwwwwwwwwwwk..',
  '..kwggggggggwk..', '..kwwwwwwwwwwk..', '..kkkkkkkkkkkk..',
];

export const ICONS = {
  folder: ['', '..kkkkk.........', '.kYYYYYk........', 'kYYYYYYYkkkkkkk.', 'kYYYYYYYYYYYYYYk',
    ...Array(8).fill('kyyyyyyyyyyyyyyk'), '.kkkkkkkkkkkkkk.'],
  doc: doc(),
  pdf: doc('r'),
  terminal: ['kkkkkkkkkkkkkkkk', 'kppppppppppppppk', 'kkkkkkkkkkkkkkkk', 'kddddddddddddddk', 'kdaddddddddddddk',
    'kddadddddddddddk', 'kdddaddddddddddk', 'kddadddddddddddk', 'kdaddaaaaddddddk', 'kddddddddddddddk',
    'kkkkkkkkkkkkkkkk', '....kkkkkkkk....', '...kwwwwwwwwk...', '...kkkkkkkkkk...'],
  trophy: ['..kkkkkkkkkkkk..', 'kkkyyyyyyyyyykkk', 'kYkyyyyyyyyyykYk', 'kYkyYyyyyyyyykYk', '.kkyYyyyyyyyykk.',
    '...kyyyyyyyyk...', '....kyyyyyyk....', '.....kyyyyk.....', '......kyyk......', '......kyyk......',
    '.....kkyykk.....', '....kppppppk....', '....kppppppk....', '....kkkkkkkk....'],
  card: ['', '', 'kkkkkkkkkkkkkkkk', 'kwwwwwwwwwwwwwwk', 'kwbbbwwgggggggwk', 'kwbsbwwwwwwwwwwk', 'kwbbbwwggggggwwk',
    'kwpppwwwwwwwwwwk', 'kwpppwwgggggwwwk', 'kwwwwwwwwwwwwwwk', 'kkkkkkkkkkkkkkkk'],
  flask: ['......kkkk......', '......kwwk......', '......kwwk......', '......kwwk......', '.....kwwwwk.....',
    '....kwwwwwwk....', '...kwwwwwwwwk...', '..kGGGGGGGGGGk..', '..kGGgGGGGgGGk..', '.kGGGGGGGGGGGGk.',
    '.kGGGgGGGGGGGGk.', '.kkkkkkkkkkkkkk.'],
  hourglass: ['..kkkkkkkkkkkk..', '..kppppppppppk..', '...kwwwwwwwwk...', '...kwyyyyyywk...', '....kwyyyywk....',
    '.....kwyywk.....', '......kwwk......', '......kyyk......', '.....kwyywk.....', '....kwwyywwk....',
    '...kwwyyyywwk...', '...kwyyyyyywk...', '..kppppppppppk..', '..kkkkkkkkkkkk..'],
  image: ['', '', 'kkkkkkkkkkkkkkkk', 'kwwwwwwwwwwwwwwk', 'kwSSSSSSSSSSSSwk', 'kwSSSSSSyySSSSwk', 'kwSSSSSSyySSSSwk',
    'kwSSSGSSSSSSSSwk', 'kwSSGGGSSSSSSSwk', 'kwSGGGGGSSGSSSwk', 'kwGGGGGGGGGGGGwk', 'kwwwwwwwwwwwwwwk', 'kkkkkkkkkkkkkkkk'],
};
export type IconName = keyof typeof ICONS;

// self-check: a typo in a row shifts every pixel after it
if (import.meta.env.DEV) for (const [n, rows] of Object.entries(ICONS)) rows.forEach((r, i) => console.assert(r === '' || r.length === 16, `icon ${n} row ${i}`));

// The owner of this computer: a pixel astronaut. 20x22, same palette letters plus suit shades.
const ASTRO_PAL: Record<string, string> = {
  k: '#000', w: '#F4F1E8', g: '#B9B2C4', v: '#1B1530', h: '#FFE2A8', V: '#F2B134', o: '#E8743B', r: '#D9483B', b: '#8C7F94',
};
const ASTRO = [
  '......kkkkkkk.......', '....kkwwwwwwwkk.....', '...kwwwwwwwwwwwk....', '..kwwkkkkkkkkkwwk...',
  '..kwkvvvvvvvvvkwk...', '.kwwkvhhvvvvvvkwwk..', '.kwwkvhvvvvvVVkwwk..', '.kwwkvvvvvvVVVkwwk..',
  '.kgwkkvvvvvvvkkwgk..', '..kgwwkkkkkkkwwgk...', '..kkgggwwwwwgggkk...', '.kbkwwwwwwwwwwwkbk..',
  'kwbkwwoorwwwwwwkbwk.', 'kwwkwwoowwwwgwwkwwk.', 'kwwkwwwwwwwwgwwkwwk.', 'kgk.kwwwwwwwwwk.kgk.',
  '.k..kwwwwgwwwwk..k..', '....kwwwwkwwwwk.....', '....kwwwk.kwwwk.....', '....kgggk.kgggk.....',
  '...kkkkkk.kkkkkk....',
];
if (import.meta.env.DEV) ASTRO.forEach((r, i) => console.assert(r.length === 20, `astro row ${i}`));

export function Astronaut({ size = 24 }: { size?: number }) {
  const rects: React.ReactNode[] = [];
  ASTRO.forEach((row, y) => [...row].forEach((ch, x) => {
    if (ASTRO_PAL[ch]) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={ASTRO_PAL[ch]} />);
  }));
  return <svg height={size} viewBox={`0 0 20 ${ASTRO.length}`} shapeRendering="crispEdges" aria-hidden="true">{rects}</svg>;
}

export function Icon({ name, size = 40 }: { name: IconName; size?: number }) {
  const rects: React.ReactNode[] = [];
  ICONS[name].forEach((row, y) => [...row].forEach((ch, x) => {
    if (PAL[ch]) rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={PAL[ch]} />);
  }));
  return <svg width={size} height={size} viewBox="0 0 16 16" shapeRendering="crispEdges" aria-hidden="true">{rects}</svg>;
}
