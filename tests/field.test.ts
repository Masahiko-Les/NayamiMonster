import { describe, expect, it } from 'vitest';
import { MAP, START } from '../src/data/map';
import { canAt, GrassCounter, step } from '../src/game/field';
import * as ref from './reference';
import { seeded } from './helpers';

describe('マップと移動は試作品と同じ', () => {
  it('マップ配列が一致する', () => {
    expect(MAP).toEqual(ref.REF_MAP);
    expect(MAP.length).toBe(36);
    for (const row of MAP) expect(row.length).toBe(20);
  });

  it('当たり判定 canAt が一致する（0.1 刻みで全域）', () => {
    for (let y = -0.5; y < 37; y += 0.1) for (let x = -0.5; x < 21; x += 0.1) expect(canAt(x, y)).toBe(ref.canAt(x, y));
  });

  it('スタート地点は歩ける場所', () => {
    expect(canAt(START.x, START.y)).toBe(true);
  });

  it('ランダムに歩いた軌跡が一致する（壁ずり込み）', () => {
    const r = seeded(7);
    const a = { x: START.x, y: START.y },
      b = { ...a };
    for (let i = 0; i < 5000; i++) {
      const ang = r() * Math.PI * 2,
        d = { x: Math.cos(ang), y: Math.sin(ang) },
        dt = r() * 0.05;
      for (let k = 0; k < 10; k++) expect(step(a, d, dt)).toEqual(ref.move(b, d, dt));
      expect(a).toEqual(b);
    }
  });

  it('草むらは 1.3 歩ごとに 17% で遭遇', () => {
    const always = new GrassCounter(() => 0.169);
    expect(always.walk(1.3)).toBe(false); // 1.3 ちょうどでは判定しない
    expect(always.walk(0.01)).toBe(true);
    expect(always.dist).toBe(0);
    const never = new GrassCounter(() => 0.17);
    expect(never.walk(2)).toBe(false);
  });
});
