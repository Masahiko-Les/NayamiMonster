// はじまりの町 と こころの小道（CLAUDE.md 4章）
export const MAP: readonly string[] = [
  'TTTTTTTTTTTTTTTTTTTT',
  'TTTTTTTTs..TTTTTTTTT',
  'TTggggg.....ggggggTT',
  'TTggggg.....ggggggTT',
  'TTggggg..TT.ggggggTT',
  'TT.......TT.......TT',
  'TT####.....########T',
  'TT..........gggggTTT',
  'TTggggggg...gggggTTT',
  'TTggggggg...gggggTTT',
  'TTggggggg.....TT..TT',
  'TT............TT..TT',
  'TT...gggggg.......TT',
  'TT...gggggg..gggg.TT',
  'TT...gggggg..gggg.TT',
  'TT###########..###TT',
  'TT.ggggg.......gggTT',
  'TT.ggggg..TT...gggTT',
  'TT.ggggg..TT...gggTT',
  'TT.............gggTT',
  'TTTTTTT......TTTTTTT',
  'TTTTTTTT....TTTTTTTT',
  'TTTTTTTT....TTTTTTTT',
  'T..................T',
  'T..BBB......BBB....T',
  'T..BBB......BBB....T',
  'T..BhB.s....BnB....T',
  'T..................T',
  'T.ffff....BBBBB....T',
  'T.ffff....BBBBB....T',
  'T.........BBlBB....T',
  'T..................T',
  'T..####....wwwww...T',
  'T..ffff....wwwww...T',
  'T..........wwwww...T',
  'TTTTTTTTTTTTTTTTTTTT',
];

export const W = 20;
export const H = MAP.length;
/** 1タイルのピクセル数 */
export const TS = 46;
/** この行より上が「こころの小道」 */
export const TOWN_Y = 22;
export const START = { x: 4.5, y: 27.5 } as const;
/** マップ版数。変わったら位置をリセット */
export const MAP_VERSION = 3;

/** T[y][x] でタイル記号を引く */
export const T: readonly string[][] = MAP.map((r) => [...r]);

export interface Building {
  x: number;
  y: number;
  w: number;
  h: number;
  roof: string;
  label: string;
}

export const BUILDINGS: readonly Building[] = [
  { x: 3, y: 24, w: 3, h: 3, roof: '#ef7b5c', label: 'おうち（休める）' },
  { x: 12, y: 24, w: 3, h: 3, roof: '#5d93bf', label: 'となりの家' },
  { x: 10, y: 28, w: 5, h: 3, roof: '#45a39b', label: '研究所（ノート）' },
];

/** 通れないタイル */
export const SOLID = new Set(['T', 'B', '#', 'w', 's', 'n']);
