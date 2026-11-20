// 移動・当たり判定・エンカウント（CLAUDE.md 4章）
import { SOLID, T, W, H } from '../data/map';
import type { Rng } from '../types';

export const SPEED = 3.6; // タイル/秒
export const RADIUS = 0.28; // 当たり判定の半径
export const ENCOUNTER_STEP = 1.3; // 草むらをこれだけ歩くごとに判定
export const ENCOUNTER_RATE = 0.17;

export const solid = (x: number, y: number): boolean => x < 0 || y < 0 || x >= W || y >= H || SOLID.has(T[y][x]);

export function canAt(x: number, y: number): boolean {
  const r = RADIUS;
  return (
    !solid(Math.floor(x - r), Math.floor(y - r)) &&
    !solid(Math.floor(x + r), Math.floor(y - r)) &&
    !solid(Math.floor(x - r), Math.floor(y + r)) &&
    !solid(Math.floor(x + r), Math.floor(y + r))
  );
}

export interface Vec {
  x: number;
  y: number;
}

/** 1フレーム分の移動。x→y の順に軸ごとに判定（壁ずり）。pos を書き換える */
export function step(pos: Vec, d: Vec, dt: number): { moved: number; blocked: boolean } {
  const sp = SPEED * dt,
    ox = pos.x,
    oy = pos.y;
  let blocked = false;
  if (canAt(pos.x + d.x * sp, pos.y)) pos.x += d.x * sp;
  else blocked = true;
  if (canAt(pos.x, pos.y + d.y * sp)) pos.y += d.y * sp;
  else blocked = true;
  return { moved: Math.hypot(pos.x - ox, pos.y - oy), blocked };
}

/** 草むらの歩数カウンタ。遭遇したら true */
export class GrassCounter {
  dist = 0;
  constructor(private rng: Rng = Math.random) {}
  /** 草むらタイル上で moved だけ歩いた */
  walk(moved: number): boolean {
    this.dist += moved;
    if (this.dist > ENCOUNTER_STEP) {
      this.dist = 0;
      return this.rng() < ENCOUNTER_RATE;
    }
    return false;
  }
}
