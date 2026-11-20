// バトルの計算式（CLAUDE.md 5章／試作品と同じ）
// 乱数は rng で差し替えられるようにして、テストで試作品と突き合わせる。
import type { Monster, Player, Rng, Skill } from '../types';
import { rint } from '../util';

/** 自分の最大HP */
export const maxHp = (lv: number): number => 30 + lv * 8;
/** 次のLvまでの経験値 */
export const need = (lv: number): number => lv * 15 + 10;
/** モンスターHP */
export const monHp = (p: Pick<Monster, 'pain'>): number => 20 + p.pain * 12;
/** 勝利時の経験値 */
export const expGain = (p: Pick<Monster, 'pain'>): number => p.pain * 8 + 6;
/** 会心の確率 */
export const critChance = (power: number): number => (power === 3 ? 0.3 : 0.12);

export interface Hit {
  dmg: number;
  crit: boolean;
}

/**
 * わざのダメージ（使用回数を増やす前の uses で計算する）
 * 乱数の消費順：rint(0,6) → 会心判定
 */
export function calcDamage(s: Pick<Skill, 'power' | 'uses'>, lv: number, rng: Rng = Math.random): Hit {
  let dmg = s.power * 8 + rint(0, 6, rng) + lv * 2 + Math.floor(s.uses / 3);
  const crit = rng() < critChance(s.power);
  if (crit) dmg = Math.round(dmg * 1.6);
  return { dmg, crit };
}

/** 同じわざを5回使うごとに「手になじんできた！」（uses は加算後の値） */
export const isFamiliar = (usesAfter: number): boolean => usesAfter % 5 === 0;

/** モンスターの反撃ダメージ */
export const counterDamage = (p: Pick<Monster, 'pain'>, rng: Rng = Math.random): number => p.pain * 2 + rint(1, 5, rng);

/**
 * 経験値が足りていれば1レベル上げてHP全回復。上がったら true。
 * 試作品では while で1段ずつメッセージを出すので、1段ずつの関数にしている。
 */
export function levelUpOnce(P: Player): boolean {
  if (P.exp < need(P.lv)) return false;
  P.exp -= need(P.lv);
  P.lv++;
  P.hp = maxHp(P.lv);
  return true;
}
