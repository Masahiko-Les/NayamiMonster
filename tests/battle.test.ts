import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  calcDamage, counterDamage, critChance, expGain, isFamiliar, levelUpOnce, maxHp, monHp, need,
} from '../src/game/battle';
import type { Pain, Player, Power } from '../src/types';
import * as ref from './reference';
import { seeded } from './helpers';

/** 試作品のコードは Math.random を使うので、同じ乱数列に差し替えて動かす */
function withRandom<T>(seed: number, fn: () => T): T {
  const r = seeded(seed);
  const spy = vi.spyOn(Math, 'random').mockImplementation(r);
  try {
    return fn();
  } finally {
    spy.mockRestore();
  }
}
afterEach(() => vi.restoreAllMocks());

describe('基本の式', () => {
  it('最大HP = 30 + Lv×8／次のLvまで = Lv×15 + 10', () => {
    for (let lv = 1; lv <= 99; lv++) {
      expect(maxHp(lv)).toBe(ref.maxHp(lv));
      expect(need(lv)).toBe(ref.need(lv));
    }
    expect(maxHp(1)).toBe(38);
    expect(need(1)).toBe(25);
  });

  it('モンスターHP = 20 + つらさ×12／経験値 = つらさ×8 + 6', () => {
    for (const pain of [1, 2, 3, 4, 5] as Pain[]) {
      expect(monHp({ pain })).toBe(ref.monHp({ pain }));
      expect(expGain({ pain })).toBe(pain * 8 + 6);
    }
  });

  it('会心率：ききめ3は30%、それ以外12%', () => {
    expect(critChance(3)).toBe(0.3);
    expect(critChance(2)).toBe(0.12);
    expect(critChance(1)).toBe(0.12);
  });

  it('5回ごとに「手になじんできた」', () => {
    expect([1, 4, 5, 6, 10, 15].map(isFamiliar)).toEqual([false, false, true, false, true, true]);
  });
});

describe('乱数を使う計算が試作品と一致する', () => {
  it('与ダメージ（会心込み）', () => {
    let crits = 0;
    for (let seed = 1; seed <= 3000; seed++) {
      const power = ((seed % 3) + 1) as Power;
      const uses = seed % 23;
      const lv = (seed % 17) + 1;
      const expected = withRandom(seed, () => ref.damage({ power, uses }, { lv }));
      const actual = calcDamage({ power, uses }, lv, seeded(seed));
      expect(actual).toEqual(expected);
      if (actual.crit) crits++;
    }
    expect(crits).toBeGreaterThan(0); // 会心の分岐も通っていること
  });

  it('ダメージの範囲（会心なし）', () => {
    // rng=0 → 乱数0・会心あり / rng≒1 → 乱数6・会心なし
    expect(calcDamage({ power: 2, uses: 6 }, 3, () => 0.999)).toEqual({ dmg: 16 + 6 + 6 + 2, crit: false });
    expect(calcDamage({ power: 2, uses: 6 }, 3, () => 0)).toEqual({ dmg: Math.round((16 + 0 + 6 + 2) * 1.6), crit: true });
  });

  it('反撃ダメージ = つらさ×2 + 乱数(1〜5)', () => {
    for (let seed = 1; seed <= 500; seed++) {
      const pain = ((seed % 5) + 1) as Pain;
      const expected = withRandom(seed, () => ref.counter({ pain }));
      expect(counterDamage({ pain }, seeded(seed))).toBe(expected);
    }
  });

  it('経験値とレベルアップ（複数段のレベルアップ含む）', () => {
    for (let lv = 1; lv <= 10; lv++)
      for (let exp = 0; exp < need(lv); exp += 3)
        for (const pain of [1, 2, 3, 4, 5] as Pain[]) {
          const a: Player = { lv, exp, hp: 1, x: 0, y: 0 };
          const b = { ...a };
          const r = ref.gainExp(b, { pain });
          a.exp += expGain({ pain });
          const lvs: number[] = [];
          while (levelUpOnce(a)) lvs.push(a.lv);
          expect(lvs).toEqual(r.lvs);
          expect(a).toEqual(b);
        }
  });
});
