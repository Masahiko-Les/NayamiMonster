// バトル画面（CLAUDE.md 5章）
import { calcDamage, counterDamage, expGain, isFamiliar, levelUpOnce, maxHp, monHp } from '../game/battle';
import { START } from '../data/map';
import { colOf, drawMonster } from '../render/monster';
import { app, P, persist } from '../state';
import type { Monster, Skill } from '../types';
import { $, esc, kindTag, pick, short, sleep, stars } from '../util';
import { hud } from './hud';
import { stopWalking } from './input';
import { clearActs, say, setActs } from './message';
import { openNote } from './note';

interface BattleState {
  p: Monster;
  hp: number;
  max: number;
  last: Skill | null; // 決め手のわざ
}
let B: BattleState | null = null;

/** 出現するのは自分が登録したモンスターだけ */
const candidates = (): Monster[] => app.S.packs;

function bRender(): void {
  const p = P();
  $('#bHp').style.width = Math.max(0, (B!.hp / B!.max) * 100) + '%';
  $('#bMyHp').style.width = Math.max(0, (p.hp / maxHp(p.lv)) * 100) + '%';
  $('#bMyTxt').textContent = `${Math.max(0, p.hp)}/${maxHp(p.lv)}`;
  hud();
}

const shake = (el: HTMLElement) => {
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
};

export async function encounter(): Promise<void> {
  const list = candidates();
  if (!list.length) return;
  const p = pick(list);
  app.mode = 'battle';
  stopWalking();
  B = { p, hp: monHp(p), max: monHp(p), last: null };
  const col = colOf(p);
  $('#bCat').textContent = '悩みモンスター';
  $('#bCat').style.background = col;
  $('#bOwner').textContent = p.desc ? short(p.desc, 18) : 'あなたの悩みモンスター';
  $('#bName').textContent = p.name;
  drawMonster(p.name, col, $<HTMLCanvasElement>('#mon'));
  $('#mon').classList.remove('vanish');
  bRender();
  clearActs();
  $('#battle').classList.add('on');
  await say(`${p.name}が あらわれた！`);
  if (p.whispers.length) await say(`「${pick(p.whispers)}」`);
  menu();
}

function menu(): void {
  say('どうする？', false);
  setActs([
    {
      grid: true,
      items: [
        { main: true, html: 'むきあう<small>このなやみの わざで</small>', fn: skillMenu },
        { html: 'にげる<small>今日はここまで</small>', fn: runAway },
      ],
    },
  ]);
}

function skillMenu(): void {
  const sks = B!.p.skills;
  if (!sks.length) {
    const pid = B!.p.id;
    (async () => {
      clearActs();
      await say('このなやみの わざが まだ ない！\nノートで、このなやみ専用の言葉や対処法を書き足そう。');
      setActs([
        {
          grid: true,
          items: [
            {
              main: true,
              html: 'ノートを開く<small>わざを書き足す</small>',
              fn: () => {
                endBattle();
                openNote('edit', pid);
              },
            },
            { html: 'にげる', fn: runAway },
          ],
        },
      ]);
    })();
    return;
  }
  say('どの わざを つかう？', false);
  setActs([
    {
      label: 'このモンスターへの わざ',
      items: sks.map((s) => ({
        html: `${kindTag(s)}${esc(s.name)}<small>ききめ ${stars(s.power)}　つかった回数 ${s.uses}</small>`,
        fn: () => useSkill(s),
      })),
    },
    { items: [{ html: 'もどる', fn: menu }] },
  ]);
}

async function useSkill(s: Skill): Promise<void> {
  const b = B!;
  const p = P();
  clearActs();
  await say(s.kind === '言葉' ? `じぶんに いいきかせた。\n「${s.name}」` : `${s.name}\nを やってみた！`);
  const { dmg, crit } = calcDamage(s, p.lv);
  s.uses++;
  b.last = s;
  shake($('#mon'));
  b.hp -= dmg;
  bRender();
  await sleep(450);
  if (crit) await say('こうかは ばつぐんだ！');
  if (isFamiliar(s.uses)) await say(`「${short(s.name)}」が手になじんできた！\nいりょくが あがった。`);
  persist();
  if (b.hp <= 0) return win();
  // 反撃
  const w = b.p.whispers.length ? pick(b.p.whispers) : '……';
  await say(`${b.p.name}の ささやき！\n「${w}」`);
  p.hp -= counterDamage(b.p);
  shake($('.mine'));
  bRender();
  await sleep(400);
  persist();
  if (p.hp <= 0) return lose();
  menu();
}

async function win(): Promise<void> {
  const b = B!;
  const p = P();
  $('#mon').classList.add('vanish');
  await say(`${b.p.name}は\nおとなしくなった。`);
  await say('すこし なかよく なれた気がする。');
  b.p.defeated = (b.p.defeated || 0) + 1;
  app.S.wins = (app.S.wins || 0) + 1;
  if (b.last) await say(`きめての わざ：\n「${short(b.last.name, 22)}」`);
  const gain = expGain(b.p);
  p.exp += gain;
  await say(`${gain} けいけんちを てにいれた！`);
  while (levelUpOnce(p)) {
    bRender();
    await say(`レベル${p.lv}に あがった！\nこころのHPが ${maxHp(p.lv)}に ふえた。`);
  }
  persist();
  bRender();
  endBattle();
}

async function lose(): Promise<void> {
  const p = P();
  await say('こころが つかれてしまった…');
  await say('むりは しないで。\nおうちに もどって 休もう。');
  p.x = START.x;
  p.y = START.y;
  p.hp = maxHp(p.lv);
  persist();
  endBattle();
}

async function runAway(): Promise<void> {
  clearActs();
  await say('うまく にげきれた！\nにげるのも りっぱな たいしょほう。');
  endBattle();
}

function endBattle(): void {
  $('#battle').classList.remove('on');
  B = null;
  app.mode = 'field';
  hud();
}
