// ノート（わたしのモンスター／編集／きろく。CLAUDE.md 6章）
import { need } from '../game/battle';
import { colOf } from '../render/monster';
import { def } from '../storage';
import { app, persist } from '../state';
import type { Kind, Monster, Pain, Power } from '../types';
import { $, clone, esc, kindTag, short, sk, stars, uid } from '../util';
import { hud } from './hud';
import { stopWalking } from './input';

type NView = 'list' | 'edit' | 'rec';
let nView: NView = 'list';
let draft: Monster | null = null;

const note = () => $('#note');
const nb = () => $('#noteBody');
const val = (s: string) => $<HTMLInputElement>(s).value;

export function openNote(v: NView, id?: string): void {
  app.mode = 'note';
  stopWalking();
  nView = v;
  draft = null;
  if (v === 'edit') {
    const p = app.S.packs.find((x) => x.id === id);
    draft = p ? clone(p) : { id: '', name: '', desc: '', pain: 3, whispers: [], skills: [], defeated: 0 };
  }
  renderNote();
  note().classList.add('on');
  note().scrollTop = 0;
}

export function closeNote(): void {
  note().classList.remove('on');
  app.mode = 'field';
  persist();
  hud();
}

function head(): string {
  const t = (k: NView, l: string) =>
    `<button class="tab ${nView === k || (k === 'list' && nView === 'edit') ? 'on' : ''}" data-a="view" data-v="${k}">${l}</button>`;
  return `<div class="nhead"><div class="tabs">${t('list', 'わたしのモンスター')}${t('rec', 'きろく')}</div><button class="x" data-a="close">×</button></div>`;
}

function packCard(p: Monster): string {
  return `<div class="pack" style="border-left-color:${colOf(p)}" data-a="edit" data-id="${p.id}">
  <h3>${esc(p.name)}</h3>${p.desc ? `<div class="meta" style="margin-bottom:4px;color:var(--ink)">${esc(p.desc)}</div>` : ''}<div class="meta">つらさ ${stars(p.pain)}　ささやき ${p.whispers.length}　わざ ${p.skills.length}　てなずけた ${p.defeated || 0}回</div>
  <ul>${p.skills.slice(0, 3).map((s) => `<li>${kindTag(s)}${esc(s.name)}</li>`).join('')}${p.skills.length > 3 ? `<li style="color:var(--sub)">ほか ${p.skills.length - 3}件</li>` : ''}</ul></div>`;
}

function renderNote(): void {
  const S = app.S;
  const P = S.player;
  let h = head();
  if (nView === 'list') {
    h += `<p class="lead">あなたの心の中にいる、悩みモンスターたち。ひとつのモンスターに、それ専用の「ささやき」と「向き合い方（言葉・対処法）」をまとめておくと、バトルでそのわざが使えます。</p>
    <button class="add" data-a="new">＋ 新しいなやみを書き出す</button>`;
    h += S.packs.length ? S.packs.map(packCard).join('') : '<div class="empty">まだ なやみは ありません。</div>';
  } else if (nView === 'edit') {
    const d = draft!;
    h += `<div class="card"><h4>${d.id ? 'なやみを編集' : '新しいなやみ'}</h4>
    <label>どんな悩み？</label><textarea id="eDesc" rows="2" maxlength="80" placeholder="例：好きな人に振られてしまった">${esc(d.desc || '')}</textarea>
    <label>モンスターの名前</label><input id="eName" maxlength="24" placeholder="例：フラレモン" value="${esc(d.name)}">
    <div class="row"><div><label>つらさ</label><select id="ePain">${[1, 2, 3, 4, 5].map((n) => `<option value="${n}" ${d.pain === n ? 'selected' : ''}>${stars(n)}</option>`).join('')}</select></div></div>
    <label>あくまの ささやき（1行に1つ）</label><textarea id="eWh" rows="3" placeholder="例：どうせ自分なんて">${esc(d.whispers.join('\n'))}</textarea></div>
    <div class="card"><h4>このなやみの わざ</h4>
    ${d.skills.length ? d.skills.map((s, i) => `<div class="skillItem"><div class="t">${kindTag(s)}${esc(s.name)}<br><small>ききめ ${stars(s.power)}　つかった ${s.uses}回${s.from ? '　みんなから おぼえた' : ''}</small></div><button class="mini" data-a="delSkill" data-i="${i}">けす</button></div>`).join('') : '<div class="empty">まだ ありません。下から追加しよう。</div>'}
    <label>言葉・対処法を追加</label><textarea id="sName" rows="2" maxlength="80" placeholder="例：信頼できる人に話を聞いてもらう"></textarea>
    <div class="row"><select id="sKind"><option value="言葉">言葉</option><option value="対処法">対処法</option></select><select id="sPow"><option value="1">ききめ ★</option><option value="2" selected>ききめ ★★</option><option value="3">ききめ ★★★</option></select></div>
    <button class="btn sub" data-a="addSkill" style="width:100%">＋ わざを追加</button></div>
    <div class="row"><button class="btn" data-a="savePack">保存する</button><button class="btn sub" data-a="view" data-v="list">もどる</button></div>
    ${d.id ? '<button class="btn danger" data-a="delPack" style="width:100%">このなやみを けす</button>' : ''}`;
  } else {
    const sks = S.packs
      .flatMap((p) => p.skills.map((s) => ({ ...s, pn: p.name })))
      .filter((s) => s.uses > 0)
      .sort((a, b) => b.uses - a.uses);
    h += `<div class="card"><h4>あなた</h4>
    <div class="stat"><span>レベル</span><b>${P.lv}</b></div><div class="stat"><span>次のレベルまで</span><b>${need(P.lv) - P.exp}</b></div>
    <div class="stat"><span>てなずけた なやみ</span><b>${S.wins || 0}回</b></div></div>
    <div class="card"><h4>よく使ったわざ ＝ あなたの力</h4>${sks.length ? sks.slice(0, 8).map((s, i) => `<div class="stat"><span>${i + 1}. ${esc(short(s.name, 20))}<br><small style="color:var(--sub)">${esc(s.pn)}</small></span><b>${s.uses}回</b></div>`).join('') : '<div class="empty">戦うとたまっていきます。</div>'}</div>
    <button class="btn danger" data-a="reset" style="width:100%">最初からやりなおす</button>`;
  }
  nb().innerHTML = h;
}

/** 入力欄の内容を draft に写す */
function syncDraft(): void {
  if (nView !== 'edit' || !draft) return;
  draft.name = val('#eName');
  draft.desc = val('#eDesc').trim();
  draft.pain = +val('#ePain') as Pain;
  draft.whispers = val('#eWh').split('\n').map((s) => s.trim()).filter(Boolean);
}

/** 2回押しで確定 */
function confirmBtn(b: HTMLElement, l = '本当に？'): boolean {
  if (b.dataset.ok !== '1') {
    b.dataset.ok = '1';
    b.textContent = l;
    return false;
  }
  return true;
}

export function initNote(): void {
  $('#noteBtn').onclick = () => {
    if (app.mode === 'field') openNote('list');
  };
  nb().addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-a]');
    if (!b) return;
    const a = b.dataset.a;
    const S = app.S;
    if (a === 'close') return closeNote();
    if (a === 'view') {
      nView = b.dataset.v as NView;
      draft = null;
      renderNote();
      note().scrollTop = 0;
      return;
    }
    if (a === 'new') return openNote('edit');
    if (a === 'edit') return openNote('edit', b.dataset.id);
    if (a === 'addSkill') {
      syncDraft();
      const n = val('#sName').trim();
      if (!n) {
        $('#sName').focus();
        return;
      }
      draft!.skills.push(sk(n, val('#sKind') as Kind, +val('#sPow') as Power));
      renderNote();
      return;
    }
    if (a === 'delSkill') {
      syncDraft();
      draft!.skills.splice(+b.dataset.i!, 1);
      renderNote();
      return;
    }
    if (a === 'savePack') {
      syncDraft();
      const d = draft!;
      const n = d.name.trim();
      if (!n) {
        $('#eName').focus();
        return;
      }
      d.name = n;
      if (d.id) {
        const i = S.packs.findIndex((p) => p.id === d.id);
        S.packs[i] = d;
      } else {
        d.id = uid();
        S.packs.push(d);
      }
      persist();
      nView = 'list';
      draft = null;
      renderNote();
      note().scrollTop = 0;
      return;
    }
    if (a === 'delPack') {
      if (!confirmBtn(b, '本当に けす？')) return;
      S.packs = S.packs.filter((p) => p.id !== draft!.id);
      persist();
      nView = 'list';
      draft = null;
      renderNote();
      return;
    }
    if (a === 'reset') {
      if (!confirmBtn(b, '全部消えます。本当に？')) return;
      app.S = def();
      persist();
      location.reload();
    }
  });
}
