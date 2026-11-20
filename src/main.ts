// 起動
import './style.css';
import { app } from './state';
import { hud, toast } from './ui/hud';
import { initExplore } from './ui/explore';
import { runIntro, shouldRunIntro } from './ui/intro';
import { initMessage } from './ui/message';
import { initNote } from './ui/note';

initMessage();
initNote();
initExplore();
hud();
if (shouldRunIntro()) runIntro();
else setTimeout(() => toast(app.S.packs.length ? '北の草むらへ 行ってみよう' : '研究所で モンスターを書き出そう'), 600);
