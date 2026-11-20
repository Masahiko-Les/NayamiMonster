// 歩く方向の入力状態（ポインタ）。バトル・ノートを開くときにリセットする。
import type { Vec } from '../game/field';

export const input: { dir: Vec | null; target: Vec | null; keys: Record<string, number> } = {
  dir: null,
  target: null,
  keys: {},
};

export function stopWalking(): void {
  input.dir = null;
  input.target = null;
}
