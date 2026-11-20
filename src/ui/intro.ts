// オープニング（CLAUDE.md 3章）
import { colOf, drawMonster } from '../render/monster';
import { app, persist } from '../state';
import type { Kind, Pain, Skill } from '../types';
import { $, esc, kindTag, sk, uid } from '../util';
import { hud, toast } from './hud';

const intro = () => $('#intro');
const ib = () => $('#introBody');
const stage = (h: string) => {
  ib().innerHTML = h;
};

/** 誤タップ防止に 350ms 待ってからタップを受け付ける */
function waitTap(): Promise<void> {
  return new Promise((r) => {
    setTimeout(() => {
      const h = () => {
        intro().removeEventListener('click', h);
        r();
      };
      intro().addEventListener('click', h);
    }, 350);
  });
}

async function narr(t: string, big?: string): Promise<void> {
  stage(big || `<p class="iline">${esc(t)}</p><p class="tap">タップして次へ</p>`);
  await waitTap();
}

/** 質問を出して、[data-go] が押されたら get() の値で解決（null なら待ち続ける） */
function ask<T>(title: string, inner: string, get: (b: HTMLElement) => T | null, help?: string): Promise<T> {
  return new Promise((res) => {
    stage(`<p class="iq">${esc(title)}</p>${help ? `<p class="ihelp">${esc(help)}</p>` : ''}${inner}`);
    ib().onclick = (e) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>('[data-go]');
      if (!b) return;
      const v = get(b);
      if (v === null || v === undefined) return;
      ib().onclick = null;
      res(v);
    };
    const f = ib().querySelector<HTMLElement>('textarea,input');
    if (f) setTimeout(() => f.focus(), 400);
  });
}

/** 必須入力：空ならフォーカスして null */
const required = (id: string): string | null => {
  const el = $<HTMLInputElement>(id),
    v = el.value.trim();
  if (!v) {
    el.focus();
    return null;
  }
  return v;
};

export const shouldRunIntro = (): boolean => !app.S.packs.length && !app.S.introDone;

export async function runIntro(): Promise<void> {
  app.mode = 'intro';
  intro().classList.add('on');
  await narr('', `<h1 class="ititle">悩みモンスター</h1><p class="isub">心の中のモンスターと 向き合う場所</p><p class="tap">タップしてはじめる</p>`);
  await narr('だれの心の中にも、\n悩みモンスターが すんでいる。');
  await narr('追い出そうとしても、\nなかなか いなくなってはくれない。\nだから、うまく 付き合っていくしかない。');
  await narr('この世界は、\n悩みモンスターとの\n「向き合い方」を 考える場所。');
  await narr('まずは、あなたの心の中にいる\n悩みモンスターを\n教えてください。');

  const desc = await ask(
    `いま、どんなことに 悩んでいる？`,
    `<textarea id="iIn" rows="3" maxlength="80" placeholder="例：好きな人に振られてしまった"></textarea><button class="ibtn" data-go>つぎへ</button>`,
    () => required('#iIn'),
  );
  const name = await ask(
    'その悩みに 名前をつけるとしたら、\nどんなモンスター？',
    `<input id="iIn" maxlength="24" placeholder="例：フラレモン"><button class="ibtn" data-go>名前をつける</button>`,
    () => required('#iIn'),
    '見た目は、名前から生まれます',
  );

  stage(`<canvas class="ipreview" id="iMon" width="96" height="96"></canvas><p class="iline">${esc(name)}…\nこんな姿を しているみたい。</p><p class="tap">タップして次へ</p>`);
  drawMonster(name, colOf({ name }), $<HTMLCanvasElement>('#iMon'));
  await waitTap();

  const whispers = await ask(
    `${name}は、\nあなたに どんなことを ささやいてくる？`,
    `<textarea id="iIn" rows="4" placeholder="例：どうせ自分なんて&#10;もう誰にも好かれないよ"></textarea><button class="ibtn" data-go>つぎへ</button>`,
    () => $<HTMLTextAreaElement>('#iIn').value.split('\n').map((x) => x.trim()).filter(Boolean),
    '1行に1つ。思いつかなければ、空のままでも大丈夫',
  );
  const pain = await ask(
    'そのモンスターは、\nどれくらい手ごわい？',
    `<div class="istars">${[1, 2, 3, 4, 5].map((n) => `<button data-go data-v="${n}">${n}</button>`).join('')}</div><p class="ihelp" style="margin-top:12px">1：ちょっと気になる 〜 5：とてもつらい</p>`,
    (b) => +b.dataset.v! as Pain,
  );

  const skills = await new Promise<Skill[]>((res) => {
    const list: Skill[] = [];
    const render = () => {
      stage(`<p class="iq">${esc(name)}と、どう向き合う？\n言葉でも、工夫でも。</p>
      <p class="ihelp">心の支えになる言葉や、試してみたい対処法を書いてください。これがバトルの「わざ」になります。</p>
      ${list.length ? `<ul class="ilist">${list.map((s) => `<li>${kindTag(s)}${esc(s.name)}</li>`).join('')}</ul>` : ''}
      <textarea id="iIn" rows="2" maxlength="80" placeholder="例：信頼できる人に話を聞いてもらう"></textarea>
      <div class="irow"><select id="iKind"><option value="対処法">対処法</option><option value="言葉">言葉</option></select><button class="ibtn ghost" data-add style="margin-top:0">＋ 追加</button></div>
      <button class="ibtn" data-done ${list.length ? '' : 'disabled'}>${list.length ? `この ${list.length}つの わざで 会いに行く` : 'わざを1つ以上 追加してね'}</button>`);
      setTimeout(() => document.getElementById('iIn')?.focus(), 300);
    };
    ib().onclick = (e) => {
      const t = e.target as HTMLElement;
      if (t.closest('[data-add]')) {
        const v = $<HTMLTextAreaElement>('#iIn').value.trim();
        if (!v) {
          $('#iIn').focus();
          return;
        }
        list.push(sk(v, $<HTMLSelectElement>('#iKind').value as Kind, 2));
        render();
      } else if (t.closest('[data-done]') && list.length) {
        ib().onclick = null;
        res(list);
      }
    };
    render();
  });

  app.S.packs.push({ id: uid(), name, desc, pain, whispers, skills, defeated: 0 });
  app.S.introDone = true;
  persist();
  await narr(`${name}が、\n町の北にある「こころの小道」の\n草むらに あらわれるようになった。`);
  await narr('会いに行って、向き合ってみよう。\n\nモンスターは「ノート」から\nいつでも 増やせるよ。');
  intro().classList.remove('on');
  app.mode = 'field';
  hud();
  toast('北の草むらへ 行ってみよう');
}
