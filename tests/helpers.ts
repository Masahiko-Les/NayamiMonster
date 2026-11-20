import { srng } from '../src/render/monster';

/** 同じ乱数列を2回つくれるように、シードから乱数関数を作る */
export const seeded = (seed: number) => srng(seed);

/** テスト用の名前（ひらがな・カタカナ・漢字・英数字・絵文字・空白など） */
export const NAMES: string[] = [
  'フラレモン', 'シゴトオワラン', 'ねむれナイト', 'どうせジブン', '比較おばけ', 'SNSドラゴン',
  'ア', 'あ', 'a', 'Z', '1', ' ', '😢モン', 'くよくよ👻', 'ﾊﾝｶｸ', 'まだ　おわらない', '𠮷野家こわい',
  'ながーーーーーーーーーーいなまえのモンスター', '!!??', '<script>',
];
// ランダムな名前も足す（固定シードなので毎回同じ）
{
  const r = srng(12345);
  const chars = 'あいうえおかきくけこさしすせそアイウエオカキクケコ悩不安夢心ABCxyz0129';
  for (let i = 0; i < 300; i++) {
    const len = 1 + Math.floor(r() * 12);
    let s = '';
    for (let j = 0; j < len; j++) s += chars[Math.floor(r() * chars.length)];
    NAMES.push(s);
  }
}
