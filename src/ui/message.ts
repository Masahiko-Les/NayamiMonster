// バトルのメッセージ欄（文字送り）と行動ボタン
import { $ } from '../util';

let nextFn: (() => void) | null = null;
let finFn: (() => void) | null = null;

/** 2文字ずつ表示。wait=true ならタップ待ち */
export function say(text: string, wait = true): Promise<void> {
  const msgEl = $('#msg');
  return new Promise((res) => {
    msgEl.innerHTML = '';
    const sp = document.createElement('span');
    msgEl.appendChild(sp);
    const ch = [...text];
    let i = 0,
      done = false;
    const fin = () => {
      if (done) return;
      done = true;
      clearInterval(t);
      sp.textContent = text;
      finFn = null;
      if (wait) {
        const m = document.createElement('span');
        m.className = 'more';
        m.textContent = 'タップで次へ ▼';
        msgEl.appendChild(m);
        nextFn = () => {
          nextFn = null;
          res();
        };
      } else res();
    };
    finFn = fin;
    const t = setInterval(() => {
      i += 2;
      sp.textContent = ch.slice(0, i).join('');
      if (i >= ch.length) fin();
    }, 28);
  });
}

/** タップ：表示途中なら全部出す、出ていれば次へ */
export function advance(): void {
  if (finFn) return finFn();
  if (nextFn) nextFn();
}

export interface ActItem {
  html: string;
  main?: boolean;
  fn: () => void;
}
export interface ActGroup {
  label?: string;
  grid?: boolean;
  items: ActItem[];
}

/** 行動ボタンを並べる。どれか1つ押したらロック */
export function setActs(groups: ActGroup[]): void {
  const acts = $('#acts');
  acts.innerHTML = '';
  let locked = false;
  groups.forEach((g) => {
    if (g.label) {
      const l = document.createElement('div');
      l.className = 'sectionLabel';
      l.textContent = g.label;
      acts.appendChild(l);
    }
    const box = document.createElement('div');
    if (g.grid) box.className = 'grid';
    else {
      box.style.display = 'flex';
      box.style.flexDirection = 'column';
      box.style.gap = '8px';
    }
    g.items.forEach((it) => {
      const b = document.createElement('button');
      b.className = 'act' + (it.main ? ' main' : '');
      b.innerHTML = it.html;
      b.onclick = () => {
        if (locked) return;
        locked = true;
        it.fn();
      };
      box.appendChild(b);
    });
    acts.appendChild(box);
  });
}

export const clearActs = (): void => {
  $('#acts').innerHTML = '';
};

export function initMessage(): void {
  $('#msg').addEventListener('click', advance);
}
