// モンスターの姿（名前から生成。CLAUDE.md 5章）
// 同じ名前なら必ず同じ姿・同じ色になる。

export const PAL = ['#e5738f', '#7f8fd6', '#e39a45', '#45a39b', '#9a72c9', '#5d93bf', '#d0694f', '#6aa36f'];
export const OUTLINE = '#2b2d42';
export const N = 12; // 12×12 ドット
export const DOT = 8; // 1ドットのピクセル数（96px キャンバス）

/** FNV-1a（コードポイント単位） */
export function hash(s: string): number {
  let h = 2166136261;
  for (const ch of s) {
    h ^= ch.codePointAt(0)!;
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

/** シード付き乱数（線形合同法） */
export function srng(seed: number): () => number {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

export function lighten(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(v + (255 - v) * a);
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
}

export const colOf = (p: { name: string }): string => PAL[hash(p.name) % PAL.length];

/** 目と口 [x, y, 色] */
const FACE: [number, number, string][] = [
  [3, 4, '#fff'], [4, 4, OUTLINE], [8, 4, '#fff'], [7, 4, OUTLINE], [3, 5, '#fff'],
  [8, 5, '#fff'], [4, 7, OUTLINE], [5, 8, OUTLINE], [6, 8, OUTLINE], [7, 7, OUTLINE],
];

/**
 * 12×12 のドット配列を作る。[y][x] = 色（塗らないところは null）
 * 乱数の消費順は試作品の drawMonster と同じにすること。
 */
export function monsterPixels(name: string, col: string): (string | null)[][] {
  const r = srng(hash(name));
  const g: boolean[][] = [],
    spot: boolean[][] = [];
  for (let y = 0; y < N; y++) {
    g[y] = [];
    spot[y] = [];
    for (let x = 0; x < 6; x++) {
      const dx = (x - 5.5) / (3.6 + r() * 1.4),
        dy = (y - 6) / (4.6 + r() * 1.2);
      g[y][x] = dx * dx + dy * dy < 1 ? r() < 0.93 : r() < 0.18 && y > 1;
      spot[y][x] = r() < 0.2;
    }
  }
  for (let y = 3; y <= 8; y++) for (let x = 3; x < 6; x++) g[y][x] = true;
  // 左半分を作って左右対称にする
  const f = (x: number, y: number) => y >= 0 && y < N && x >= 0 && x < N && g[y][x < 6 ? x : 11 - x];
  const light = lighten(col, 0.45);
  const out: (string | null)[][] = [];
  for (let y = 0; y < N; y++) {
    out[y] = [];
    for (let x = 0; x < N; x++) {
      if (!f(x, y)) {
        out[y][x] = null;
        continue;
      }
      const edge = !f(x - 1, y) || !f(x + 1, y) || !f(x, y - 1) || !f(x, y + 1);
      out[y][x] = edge ? OUTLINE : spot[y][x < 6 ? x : 11 - x] ? light : col;
    }
  }
  for (const [x, y, k] of FACE) out[y][x] = k;
  return out;
}

/** 96×96 のキャンバスに描く */
export function drawMonster(name: string, col: string, cvs: HTMLCanvasElement): void {
  const c = cvs.getContext('2d')!;
  c.clearRect(0, 0, 96, 96);
  const px = monsterPixels(name, col);
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const k = px[y][x];
      if (!k) continue;
      c.fillStyle = k;
      c.fillRect(x * DOT, y * DOT, DOT, DOT);
    }
}
