// データモデル（CLAUDE.md 7章）
export type Kind = '言葉' | '対処法';
export type Pain = 1 | 2 | 3 | 4 | 5;
export type Power = 1 | 2 | 3;

export interface Skill {
  id: string;
  name: string; // 言葉・対処法の本文（80字まで）
  kind: Kind;
  power: Power; // ききめ（本人の予想）
  uses: number; // 使用回数
  from?: string; // 将来：みんなから おぼえた わざ
}

/** 試作品では pack と呼んでいる */
export interface Monster {
  id: string;
  name: string; // モンスター名（24字まで）
  desc: string; // どんな悩みか（80字まで）
  pain: Pain; // つらさ
  whispers: string[]; // 悪魔のささやき
  skills: Skill[]; // このモンスター専用のわざ
  defeated: number; // てなずけた回数
}

export interface Player {
  lv: number;
  exp: number;
  hp: number;
  x: number;
  y: number;
}

export interface SaveData {
  player: Player;
  packs: Monster[];
  introDone: boolean;
  wins: number;
  mapV?: number; // マップ版数（変わったら位置をリセット）
}

export type Mode = 'field' | 'battle' | 'note' | 'intro';

/** 0以上1未満を返す乱数（Math.random と同じ形） */
export type Rng = () => number;
