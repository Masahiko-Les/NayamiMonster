import type { Kind, Power, Rng, Skill } from './types';

export const $ = <T extends HTMLElement = HTMLElement>(s: string): T => document.querySelector(s) as T;
export const esc = (s: unknown): string =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
export const uid = (): string => Math.random().toString(36).slice(2, 9);
export const rint = (a: number, b: number, rng: Rng = Math.random): number => a + Math.floor(rng() * (b - a + 1));
export const pick = <T>(a: T[], rng: Rng = Math.random): T => a[Math.floor(rng() * a.length)];
export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
export const clone = <T>(o: T): T => JSON.parse(JSON.stringify(o));
export const short = (t: string, n = 16): string => ([...t].length > n ? [...t].slice(0, n).join('') + '…' : t);
export const stars = (n: number): string => '★'.repeat(n);
export const sk = (name: string, kind: Kind, power: Power): Skill => ({ id: uid(), name, kind, power, uses: 0 });
export const kindTag = (s: { kind: Kind }): string =>
  `<span class="kind ${s.kind === '対処法' ? 'cope' : ''}">${s.kind}</span>`;
