// 保存・読み込み（localStorage。失敗しても動くように try/catch）
import { maxHp } from './game/battle';
import type { SaveData } from './types';

export const KEY = 'nayami-monster-v3';

export function def(): SaveData {
  return {
    player: { lv: 1, exp: 0, hp: maxHp(1), x: 14.5, y: 11.5 },
    packs: [],
    introDone: false,
    wins: 0,
  };
}

export function load(): SaveData {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) as string);
    if (s && s.player && s.packs) return s;
  } catch {
    /* 読めなければ初期データ */
  }
  return def();
}

export function save(S: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(S));
  } catch {
    /* 保存できなくても続行 */
  }
}
