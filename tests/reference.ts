// @ts-nocheck
// prototype.html から「そのまま」写した比較用コード。編集しないこと。
// （DOM 部分だけ、記録用の偽キャンバスに置き換えている）

export const PAL=['#e5738f','#7f8fd6','#e39a45','#45a39b','#9a72c9','#5d93bf','#d0694f','#6aa36f'];
export const colOf=p=>PAL[hash(p.name)%PAL.length];
export const maxHp=lv=>30+lv*8, need=lv=>lv*15+10, monHp=p=>20+p.pain*12;
export const rint=(a,b)=>a+Math.floor(Math.random()*(b-a+1));

export function srng(seed){return()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
export function hash(s){let h=2166136261;for(const ch of s){h^=ch.codePointAt(0);h=Math.imul(h,16777619)>>>0}return h}
export function lighten(hex,a){const n=parseInt(hex.slice(1),16);const f=v=>Math.round(v+(255-v)*a);return`rgb(${f(n>>16)},${f(n>>8&255)},${f(n&255)})`}

/** 偽キャンバス：fillRect を 12×12 の配列に記録する */
export function fakeCanvas(){
  const grid=Array.from({length:12},()=>Array(12).fill(null));
  const c={fillStyle:'',clearRect(){},fillRect(x,y){grid[y/8][x/8]=c.fillStyle}};
  return{grid,getContext:()=>c};
}

export function drawMonster(name,col,cvs){
  const c=(cvs).getContext('2d');c.clearRect(0,0,96,96);
  const r=srng(hash(name)),N=12,g=[],spot=[];
  for(let y=0;y<N;y++){g[y]=[];spot[y]=[];for(let x=0;x<6;x++){const dx=(x-5.5)/(3.6+r()*1.4),dy=(y-6)/(4.6+r()*1.2);g[y][x]=dx*dx+dy*dy<1?r()<.93:(r()<.18&&y>1);spot[y][x]=r()<.2}}
  for(let y=3;y<=8;y++)for(let x=3;x<6;x++)g[y][x]=true;
  const f=(x,y)=>y>=0&&y<N&&x>=0&&x<N&&g[y][x<6?x:11-x];
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(!f(x,y))continue;const edge=!f(x-1,y)||!f(x+1,y)||!f(x,y-1)||!f(x,y+1);
    c.fillStyle=edge?'#2b2d42':(spot[y][x<6?x:11-x]?lighten(col,.45):col);c.fillRect(x*8,y*8,8,8)}
  [[3,4,'#fff'],[4,4,'#2b2d42'],[8,4,'#fff'],[7,4,'#2b2d42'],[3,5,'#fff'],[8,5,'#fff'],[4,7,'#2b2d42'],[5,8,'#2b2d42'],[6,8,'#2b2d42'],[7,7,'#2b2d42']].forEach(([x,y,k])=>{c.fillStyle=k;c.fillRect(x*8,y*8,8,8)});
}

/** useSkill のダメージ部分 */
export function damage(s,P){
  let dmg=s.power*8+rint(0,6)+P.lv*2+Math.floor(s.uses/3);
  const crit=Math.random()<(s.power===3?.3:.12);if(crit)dmg=Math.round(dmg*1.6);
  return{dmg,crit};
}
/** 反撃ダメージ */
export const counter=p=>p.pain*2+rint(1,5);

/** win の経験値〜レベルアップ部分 */
export function gainExp(P,p){
  const gain=p.pain*8+6;P.exp+=gain;const lvs=[];
  while(P.exp>=need(P.lv)){P.exp-=need(P.lv);P.lv++;P.hp=maxHp(P.lv);lvs.push(P.lv)}
  return{gain,lvs};
}

/** 移動（update の一部） */
const MAP=[
"TTTTTTTTTTTTTTTTTTTT","TTTTTTTTs..TTTTTTTTT","TTggggg.....ggggggTT","TTggggg.....ggggggTT","TTggggg..TT.ggggggTT","TT.......TT.......TT","TT####.....########T","TT..........gggggTTT","TTggggggg...gggggTTT","TTggggggg...gggggTTT","TTggggggg.....TT..TT","TT............TT..TT","TT...gggggg.......TT","TT...gggggg..gggg.TT","TT...gggggg..gggg.TT","TT###########..###TT","TT.ggggg.......gggTT","TT.ggggg..TT...gggTT","TT.ggggg..TT...gggTT","TT.............gggTT","TTTTTTT......TTTTTTT","TTTTTTTT....TTTTTTTT","TTTTTTTT....TTTTTTTT","T..................T","T..BBB......BBB....T","T..BBB......BBB....T","T..BhB.s....BnB....T","T..................T","T.ffff....BBBBB....T","T.ffff....BBBBB....T","T.........BBlBB....T","T..................T","T..####....wwwww...T","T..ffff....wwwww...T","T..........wwwww...T","TTTTTTTTTTTTTTTTTTTT"];
export const REF_MAP=MAP;
const W=20,H=MAP.length;const T=MAP.map(r=>[...r]);
const SOLID=new Set(['T','B','#','w','s','n']);
const solid=(x,y)=>x<0||y<0||x>=W||y>=H||SOLID.has(T[y][x]);
export function canAt(x,y){const r=.28;return!solid(Math.floor(x-r),Math.floor(y-r))&&!solid(Math.floor(x+r),Math.floor(y-r))&&!solid(Math.floor(x-r),Math.floor(y+r))&&!solid(Math.floor(x+r),Math.floor(y+r))}
export function move(P,d,dt){
  const sp=3.6*dt,ox=P.x,oy=P.y;
  let blocked=false;if(canAt(P.x+d.x*sp,P.y))P.x+=d.x*sp;else blocked=true;if(canAt(P.x,P.y+d.y*sp))P.y+=d.y*sp;else blocked=true;
  return{moved:Math.hypot(P.x-ox,P.y-oy),blocked};
}
