// ヘッダー（Lv・HP・EXP）とトースト
import { maxHp, need } from '../game/battle';
import { P } from '../state';
import { $ } from '../util';

export function hud(): void {
  const p = P();
  $('#lv').textContent = 'Lv' + p.lv;
  $('#hpBar').style.width = Math.max(0, (p.hp / maxHp(p.lv)) * 100) + '%';
  $('#expBar').style.width = (p.exp / need(p.lv)) * 100 + '%';
}

let toastT: ReturnType<typeof setTimeout> | undefined;
export function toast(t: string): void {
  const el = $('#toast');
  el.textContent = t;
  el.classList.add('on');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove('on'), 2200);
}
