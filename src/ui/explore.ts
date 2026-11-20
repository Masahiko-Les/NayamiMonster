// マップ上の操作：押した方向へ歩く・矢印キー・タイルのイベント（CLAUDE.md 4章）
import { maxHp } from '../game/battle';
import { GrassCounter, step, type Vec } from '../game/field';
import { T, TOWN_Y, TS } from '../data/map';
import { cam, drawMap } from '../render/map';
import { app, P, persist } from '../state';
import { $ } from '../util';
import { encounter } from './battle';
import { advance } from './message';
import { hud, toast } from './hud';
import { input } from './input';
import { openNote } from './note';

let cv: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let VW = 0,
  VH = 0;
let face: Vec = { x: 0, y: 1 };
let moving = false;
let lastTile = '';
let lastRoute = false;
let bumpT = 0;
let saveT = 0;
const grass = new GrassCounter();

function resize(): void {
  const dpr = window.devicePixelRatio || 1;
  VW = cv.clientWidth;
  VH = cv.clientHeight;
  cv.width = VW * dpr;
  cv.height = VH * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/** 押した位置からプレイヤーへの向きを求める */
function pointerDir(e: PointerEvent): void {
  const r = cv.getBoundingClientRect(),
    p = P(),
    { cx, cy } = cam(VW, VH, p);
  const mx = e.clientX - r.left,
    my = e.clientY - r.top;
  const dx = mx - (p.x * TS - cx),
    dy = my - (p.y * TS - cy),
    d = Math.hypot(dx, dy);
  input.target = { x: mx, y: my };
  input.dir = d < 10 ? null : { x: dx / d, y: dy / d };
}

function update(dt: number): void {
  const k = input.keys;
  let d = input.dir;
  const kx = (k.ArrowRight ? 1 : 0) - (k.ArrowLeft ? 1 : 0),
    ky = (k.ArrowDown ? 1 : 0) - (k.ArrowUp ? 1 : 0);
  if (kx || ky) {
    const n = Math.hypot(kx, ky);
    d = { x: kx / n, y: ky / n };
  }
  moving = false;
  if (app.mode !== 'field' || !d) return;
  face = d;
  const p = P();
  const { moved, blocked } = step(p, d, dt);
  if (blocked) bump(d);
  moving = moved > 0;
  const tx = Math.floor(p.x),
    ty = Math.floor(p.y),
    key = tx + ',' + ty;
  if (key !== lastTile) {
    lastTile = key;
    onTile(tx, ty);
  }
  if (T[ty][tx] === 'g' && grass.walk(moved)) encounter();
  saveT += dt;
  if (saveT > 1) {
    saveT = 0;
    persist();
  }
}

function onTile(x: number, y: number): void {
  const t = T[y][x],
    inRoute = y < TOWN_Y,
    p = P();
  if (inRoute !== lastRoute) {
    lastRoute = inRoute;
    toast(
      inRoute
        ? app.S.packs.length
          ? 'こころの小道。草むらに 悩みモンスターが ひそんでいる'
          : 'こころの小道。まだ モンスターは いないみたい'
        : 'はじまりの町にもどってきた',
    );
  }
  if (t === 'h') {
    p.hp = maxHp(p.lv);
    hud();
    toast('おうちで ひとやすみ。こころのHPが回復した');
    persist();
  }
  if (t === 'l') {
    p.y += 0.8;
    lastTile = '';
    openNote('list');
  }
}

/** 看板・となりの家にぶつかったときの一言（2.5秒に1回まで） */
function bump(d: Vec): void {
  const now = performance.now();
  if (now - bumpT < 2500) return;
  const p = P();
  const tx = Math.floor(p.x + d.x * 0.5),
    ty = Math.floor(p.y + d.y * 0.5),
    t = T[ty] && T[ty][tx];
  if (t === 's') {
    bumpT = now;
    toast(ty < TOWN_Y ? '看板：この先は まだ 道が つづいていない' : '看板：はじまりの町 ― 悩みモンスターと 向き合う人たちの町');
  }
  if (t === 'n') {
    bumpT = now;
    toast('となりの家。いまは 留守のようだ');
  }
}

function draw(): void {
  drawMap(ctx, { VW, VH, player: P(), face, target: input.target, moving, packCount: app.S.packs.length });
}

export function initExplore(): void {
  cv = $<HTMLCanvasElement>('#map');
  ctx = cv.getContext('2d')!;
  lastRoute = P().y < TOWN_Y;
  addEventListener('resize', resize);

  cv.addEventListener('pointerdown', (e) => {
    if (app.mode !== 'field') return;
    cv.setPointerCapture(e.pointerId);
    pointerDir(e);
    $('#hint').style.opacity = '0';
  });
  cv.addEventListener('pointermove', (e) => {
    if (input.target) pointerDir(e);
  });
  (['pointerup', 'pointercancel'] as const).forEach((ev) =>
    cv.addEventListener(ev, () => {
      input.dir = null;
      input.target = null;
    }),
  );
  addEventListener('keydown', (e) => {
    if ($('#note').classList.contains('on')) return;
    input.keys[e.key] = 1;
    if (e.key.startsWith('Arrow')) e.preventDefault();
    if ((e.key === 'Enter' || e.key === ' ') && app.mode === 'battle') {
      e.preventDefault();
      advance();
    }
  });
  addEventListener('keyup', (e) => {
    input.keys[e.key] = 0;
  });

  resize();
  let last = performance.now();
  const loop = (t: number) => {
    const dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
