import { describe, expect, it } from 'vitest';
import { colOf, hash, lighten, monsterPixels, PAL, srng } from '../src/render/monster';
import * as ref from './reference';
import { NAMES } from './helpers';

describe('モンスター生成は試作品と同じ', () => {
  it('hash が一致する', () => {
    for (const n of NAMES) expect(hash(n)).toBe(ref.hash(n));
  });

  it('srng の乱数列が一致する', () => {
    for (const seed of [0, 1, 42, 2166136261, 4294967295]) {
      const a = srng(seed),
        b = ref.srng(seed);
      for (let i = 0; i < 50; i++) expect(a()).toBe(b());
    }
  });

  it('lighten が一致する', () => {
    for (const c of PAL) expect(lighten(c, 0.45)).toBe(ref.lighten(c, 0.45));
  });

  it('色（パレット）が名前から同じに決まる', () => {
    for (const n of NAMES) expect(colOf({ name: n })).toBe(ref.colOf({ name: n }));
  });

  it(`12×12 のドット絵が全ピクセル一致する（${NAMES.length}件）`, () => {
    for (const n of NAMES) {
      const col = colOf({ name: n });
      const cvs = ref.fakeCanvas();
      ref.drawMonster(n, col, cvs);
      expect(monsterPixels(n, col), n).toEqual(cvs.grid);
    }
  });

  it('同じ名前なら何度作っても同じ姿', () => {
    const a = monsterPixels('フラレモン', colOf({ name: 'フラレモン' }));
    const b = monsterPixels('フラレモン', colOf({ name: 'フラレモン' }));
    expect(a).toEqual(b);
  });

  it('左右対称（目と口を除く）', () => {
    for (const n of NAMES.slice(0, 50)) {
      const px = monsterPixels(n, colOf({ name: n }));
      for (const y of [0, 1, 2, 9, 10, 11]) for (let x = 0; x < 6; x++) expect(px[y][x]).toBe(px[y][11 - x]);
    }
  });
});
