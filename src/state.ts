// アプリ全体で共有する状態
import { canAt } from './game/field';
import { MAP_VERSION, START } from './data/map';
import { load, save } from './storage';
import type { Mode, Player, SaveData } from './types';

export const app: { S: SaveData; mode: Mode } = { S: load(), mode: 'field' };

/** プレイヤー（S.player の別名） */
export const P = (): Player => app.S.player;

export const persist = (): void => save(app.S);

// マップ版数が変わった・壁の中にいる → スタート地点へ
{
  const p = app.S.player;
  if (app.S.mapV !== MAP_VERSION || !canAt(p.x, p.y)) {
    p.x = START.x;
    p.y = START.y;
    app.S.mapV = MAP_VERSION;
  }
}
