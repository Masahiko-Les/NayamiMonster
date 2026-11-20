// マップ描画（試作品の draw と同じ見た目）
import { BUILDINGS, H, T, TOWN_Y, TS, W } from '../data/map';
import type { Vec } from '../game/field';

export interface View {
  VW: number;
  VH: number;
  player: Vec;
  face: Vec;
  target: Vec | null; // 押した位置（画面座標）
  moving: boolean;
  packCount: number;
}

/** カメラ（プレイヤー追従・端でクランプ） */
export function cam(VW: number, VH: number, p: Vec): { cx: number; cy: number } {
  let cx = p.x * TS - VW / 2,
    cy = p.y * TS - VH / 2;
  cx = Math.max(0, Math.min(cx, W * TS - VW));
  cy = Math.max(0, Math.min(cy, H * TS - VH));
  if (W * TS < VW) cx = (W * TS - VW) / 2;
  return { cx, cy };
}

export function drawMap(ctx: CanvasRenderingContext2D, v: View): void {
  const { VW, VH } = v;
  const circ = (x: number, y: number, r: number, c: string) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 7);
    ctx.fill();
  };
  const rr = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };
  const pillText = (t: string, x: number, y: number, bg: string, fg: string) => {
    ctx.font = '700 12px "M PLUS Rounded 1c",sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const w = ctx.measureText(t).width + 18;
    ctx.fillStyle = bg;
    rr(x - w / 2, y - 11, w, 22, 11);
    ctx.fill();
    ctx.fillStyle = fg;
    ctx.fillText(t, x, y + 1);
  };

  const { cx, cy } = cam(VW, VH, v.player);
  ctx.fillStyle = '#f1ecdc';
  ctx.fillRect(0, 0, VW, VH);
  const x0 = Math.max(0, Math.floor(cx / TS)),
    y0 = Math.max(0, Math.floor(cy / TS)),
    x1 = Math.min(W - 1, Math.ceil((cx + VW) / TS)),
    y1 = Math.min(H - 1, Math.ceil((cy + VH) / TS));

  // タイル
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const sx = x * TS - cx,
        sy = y * TS - cy,
        t = T[y][x];
      if (t === '.' && (x * 7 + y * 13) % 5 === 0) circ(sx + TS * 0.3, sy + TS * 0.6, 2, '#e2d9c4');
      if (t === 'g') {
        ctx.fillStyle = '#a8d48f';
        ctx.fillRect(sx, sy, TS + 0.5, TS + 0.5);
        ctx.strokeStyle = '#5f9a4f';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        [[0.25, 0.4], [0.7, 0.32], [0.45, 0.8], [0.85, 0.82]].forEach(([a, b], k) => {
          if ((x + y + k) % 3 === 2) return;
          const px = sx + a * TS,
            py = sy + b * TS;
          ctx.beginPath();
          ctx.moveTo(px - 5, py - 6);
          ctx.lineTo(px - 1, py);
          ctx.lineTo(px + 1, py - 9);
          ctx.lineTo(px + 2, py);
          ctx.lineTo(px + 6, py - 5);
          ctx.stroke();
        });
      }
      if (t === 'f') {
        ['#ef7b5c', '#f2b84b', '#e5738f', '#ffffff'].forEach((c, k) => {
          const fx = sx + TS * (0.25 + (k % 2) * 0.5),
            fy = sy + TS * (0.3 + Math.floor(k / 2) * 0.45);
          circ(fx, fy, 4.5, c);
          circ(fx, fy, 1.8, '#f2b84b');
        });
      }
      if (t === 'T') {
        ctx.fillStyle = 'rgba(0,0,0,.08)';
        ctx.beginPath();
        ctx.ellipse(sx + TS / 2, sy + TS * 0.86, TS * 0.34, TS * 0.1, 0, 0, 7);
        ctx.fill();
        ctx.fillStyle = '#8a6a4f';
        ctx.fillRect(sx + TS * 0.44, sy + TS * 0.55, TS * 0.12, TS * 0.3);
        circ(sx + TS / 2, sy + TS * 0.42, TS * 0.34, '#5f9a6c');
        circ(sx + TS * 0.42, sy + TS * 0.34, TS * 0.14, '#7cb486');
      }
      if (t === '#') {
        ctx.fillStyle = '#c9a77c';
        ctx.fillRect(sx, sy + TS * 0.45, TS + 0.5, 5);
        ctx.fillRect(sx, sy + TS * 0.65, TS + 0.5, 5);
        ctx.fillStyle = '#a8845a';
        ctx.fillRect(sx + TS * 0.2, sy + TS * 0.3, 6, TS * 0.5);
        ctx.fillRect(sx + TS * 0.7, sy + TS * 0.3, 6, TS * 0.5);
      }
      if (t === 'w') {
        ctx.fillStyle = '#86bfe0';
        ctx.fillRect(sx, sy, TS + 0.5, TS + 0.5);
        ctx.fillStyle = 'rgba(255,255,255,.55)';
        const o = (performance.now() / 400 + x) % 6;
        ctx.fillRect(sx + 6 + o, sy + 12, 12, 2);
        ctx.fillRect(sx + 22 - o, sy + 30, 12, 2);
      }
      if (t === 's') {
        ctx.fillStyle = '#8a6a4f';
        ctx.fillRect(sx + TS * 0.46, sy + TS * 0.45, 5, TS * 0.45);
        ctx.fillStyle = '#d9b98a';
        rr(sx + TS * 0.18, sy + TS * 0.2, TS * 0.64, TS * 0.34, 5);
        ctx.fill();
        ctx.fillStyle = '#8a6a4f';
        ctx.fillRect(sx + TS * 0.28, sy + TS * 0.32, TS * 0.44, 2);
        ctx.fillRect(sx + TS * 0.28, sy + TS * 0.42, TS * 0.3, 2);
      }
    }

  // 建物
  BUILDINGS.forEach((b) => {
    const sx = b.x * TS - cx,
      sy = b.y * TS - cy,
      w = b.w * TS,
      h = b.h * TS;
    if (sx > VW || sy > VH || sx + w < 0 || sy + h < 0) return;
    ctx.fillStyle = 'rgba(0,0,0,.1)';
    ctx.beginPath();
    ctx.ellipse(sx + w / 2, sy + h - 2, w * 0.52, 10, 0, 0, 7);
    ctx.fill();
    ctx.fillStyle = '#fffdf7';
    ctx.fillRect(sx + 6, sy + h * 0.4, w - 12, h * 0.6 - 4);
    ctx.fillStyle = b.roof;
    ctx.beginPath();
    ctx.moveTo(sx, sy + h * 0.46);
    ctx.lineTo(sx + w * 0.16, sy + 6);
    ctx.lineTo(sx + w * 0.84, sy + 6);
    ctx.lineTo(sx + w, sy + h * 0.46);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.18)';
    ctx.fillRect(sx + w * 0.16, sy + 6, w * 0.68, 6);
    for (let i = 0; i < b.w; i++) {
      const tx = b.x + i,
        t = T[b.y + b.h - 1][tx],
        dx = tx * TS - cx;
      if ('hnl'.includes(t)) {
        ctx.fillStyle = '#8a6a4f';
        rr(dx + TS * 0.3, sy + h - TS * 0.62, TS * 0.4, TS * 0.58, 6);
        ctx.fill();
        circ(dx + TS * 0.6, sy + h - TS * 0.32, 2, '#f2b84b');
      } else if (i % 2 === 0 || b.w === 3) {
        ctx.fillStyle = '#bfe0f0';
        rr(dx + TS * 0.28, sy + h - TS * 0.66, TS * 0.44, TS * 0.3, 4);
        ctx.fill();
      }
    }
    if (b.label) pillText(b.label, sx + w / 2, sy - 6, 'rgba(255,255,255,.92)', '#2b2d42');
  });

  // 北出口の案内
  const n = v.packCount;
  pillText(
    n ? `↑ こころの小道（草むらに ${n}体）` : '↑ こころの小道',
    10 * TS - cx,
    (TOWN_Y - 0.4) * TS - cy,
    n ? '#5f9a4f' : 'rgba(255,255,255,.92)',
    n ? '#fff' : '#5f9a4f',
  );

  // 押した位置
  if (v.target) {
    ctx.strokeStyle = 'rgba(239,123,92,.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(v.target.x, v.target.y, 14, 0, 7);
    ctx.stroke();
  }

  // プレイヤー
  const P = v.player;
  const px = P.x * TS - cx,
    py = P.y * TS - cy,
    bob = v.moving ? Math.sin(performance.now() / 90) * 1.5 : 0;
  ctx.fillStyle = 'rgba(0,0,0,.15)';
  ctx.beginPath();
  ctx.ellipse(px, py + TS * 0.3, TS * 0.24, TS * 0.08, 0, 0, 7);
  ctx.fill();
  circ(px, py + bob, TS * 0.27, '#2b2d42');
  circ(px, py - TS * 0.18 + bob, TS * 0.1, '#ef7b5c');
  const ex = v.face.x * 4,
    ey = v.face.y * 3;
  [-5, 5].forEach((o) => circ(px + o + ex, py + bob + ey, 3, '#fff'));
  if (T[Math.floor(P.y)][Math.floor(P.x)] === 'g') {
    ctx.strokeStyle = '#5f9a4f';
    ctx.lineWidth = 2;
    [-8, 0, 8].forEach((o) => {
      ctx.beginPath();
      ctx.moveTo(px + o - 4, py + TS * 0.3 - 5);
      ctx.lineTo(px + o, py + TS * 0.3 + 2);
      ctx.lineTo(px + o + 4, py + TS * 0.3 - 5);
      ctx.stroke();
    });
  }
}
