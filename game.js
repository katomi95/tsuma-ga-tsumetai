/* 最近妻が冷たくてさあ — game.js
   依存ライブラリなし。クリックのみで進行。 */
(() => {
'use strict';

const IMG = 'assets/images/';

// 背景。画像が無い／読めない場合は fallback のグラデーションが見える。
// cams: 名前付きカメラ。s=拡大率, x/y=平行移動(%)
const SCENES = {
  title:   { img:'title.jpg', fx:65,
             fb:'linear-gradient(160deg,#c9cbc4 0%,#9fa7a3 45%,#6e7773 100%)',
             cams:{ base:{s:1.04,x:0,y:0} } },
  lunch:   { img:'office_lunch.jpg', fx:76,
             fb:'linear-gradient(170deg,#d6d6cc 0%,#a9b0a8 50%,#7e8781 100%)',
             cams:{ wide:{s:1.04,x:0,y:0}, him:{s:1.32,x:-11,y:8}, hands:{s:1.65,x:-18,y:6} } },
  vending: { img:'breakroom_evening.jpg', fx:74,
             fb:'linear-gradient(170deg,#d9c3a4 0%,#a58e76 55%,#5f564f 100%)',
             cams:{ wide:{s:1.04,x:0,y:0}, him:{s:1.32,x:-11,y:10}, can:{s:1.6,x:-16,y:12,fx:84} } },
  stairs:  { img:'stairs_noon.jpg', fx:30,
             fb:'linear-gradient(175deg,#cfd6d8 0%,#a4adae 50%,#6a7274 100%)',
             cams:{ wide:{s:1.04,x:0,y:0}, him:{s:1.32,x:11,y:9}, sky:{s:1.25,x:-10,y:6,fx:62} } },
  night:   { img:'office_night.jpg', fx:76,
             fb:'linear-gradient(170deg,#3e4a55 0%,#27313a 55%,#14191e 100%)',
             cams:{ far:{s:1.0,x:0,y:0}, wide:{s:1.06,x:-2,y:2}, him:{s:1.34,x:-11,y:8} } },
  empty:   { img:'office_empty.jpg', fx:62,
             fb:'linear-gradient(170deg,#d6d6cc 0%,#a9b0a8 50%,#7e8781 100%)',
             cams:{ wide:{s:1.04,x:0,y:0}, chair:{s:1.55,x:-12,y:-4,fx:60} } },
  phone:   { img:'phone_pov.jpg', fx:50,
             fb:'linear-gradient(180deg,#bfc2bb 0%,#8e948f 60%,#5b605c 100%)',
             cams:{ base:{s:1.04,x:0,y:0}, close:{s:1.3,x:-1,y:-2} } },
};

// ---------------- 台本 ----------------
// n:地の文  s:沢口  p:自分  v:その他  c:選択肢  cam:カメラ
const DAYS = [
  { bg:'lunch', cam:'wide', date:'10月5日', day:'月曜日', time:'12:20', steps:[
    {n:'昼休み。島に残っているのは、自分と沢口さんだけだった。'},
    {cam:'him'},
    {s:'最近、妻が冷たくてさあ'},
    {c:[
      {tag:'相槌', t:'「へえ」', r:[{p:'へえ'}]},
      {tag:'心配', t:'「喧嘩でもしたんですか」', r:[{p:'喧嘩でもしたんですか'}]},
      {tag:'冗談', t:'「うちは最初から冷たいですよ」', r:[{p:'うちなんか、最初から冷たいですよ'},{s:'はは'}]},
    ]},
    {s:'いや。別に'},
    {s:'喧嘩とかじゃないんだけど'},
    {cam:'hands'},
    {n:'沢口さんは、コンビニのおにぎりの包装を、ていねいに剥がした。'},
    {p:'あれ。今日、弁当じゃないんですね'},
    {s:'ああ。しばらくこれ'},
    {cam:'wide'},
    {p:'倦怠期ってやつですかね'},
    {s:'かもな'},
    {n:'始業のチャイムが鳴って、話はそれきりになった。'},
  ]},

  { bg:'vending', cam:'wide', date:'10月6日', day:'火曜日', time:'17:40', steps:[
    {n:'定時過ぎ。自販機の前で、沢口さんと一緒になった。'},
    {s:'昨日さ、話しかけてみたんだよ'},
    {p:'お。どうでした'},
    {cam:'him'},
    {s:'返事しないんだよね'},
    {c:[
      {tag:'相槌', t:'「そういう日もありますよ」', r:[{p:'まあ、そういう日もありますよ'}]},
      {tag:'心配', t:'「それ、結構怒ってません？」', r:[{p:'それ、結構怒ってません？'}]},
      {tag:'冗談', t:'「無視はきついっすね」', r:[{p:'無視はきついっすね。俺なら三日で泣きます'},{s:'泣かないよ。この歳で'}]},
    ]},
    {s:'怒ってる感じでもないんだよな'},
    {s:'こっちも見ないし'},
    {cam:'can'},
    {n:'沢口さんは、つめた〜いの缶コーヒーのボタンを押した。'},
    {cam:'him'},
    {s:'家、ずっと冷房つけてんだよ'},
    {p:'この時期にですか'},
    {s:'うん。あいつ、暑いの駄目だから'},
    {p:'優しいじゃないですか'},
    {cam:'wide'},
    {s:'そうかな'},
  ]},

  { bg:'stairs', cam:'wide', date:'10月7日', day:'水曜日', time:'12:35', steps:[
    {n:'ビル裏の非常階段。最近、沢口さんはここで昼を食べている。'},
    {n:'自分も、なんとなく缶コーヒーを持って隣に座った。'},
    {cam:'him'},
    {s:'飯も食わないんだよ'},
    {p:'奥さんがですか'},
    {s:'うん。置いといても、そのまま'},
    {c:[
      {tag:'相槌', t:'「ダイエットとか」', r:[{p:'ダイエットとかじゃないですか'},{s:'どうだろうな'}]},
      {tag:'心配', t:'「病院とか、行った方が」', r:[{p:'体調悪いんじゃないですか。病院とか'},{s:'……病院はなあ'},{s:'行かないと思うよ。あいつ'}]},
      {tag:'冗談', t:'「料理がまずいとか」', r:[{p:'沢口さんの料理がまずいとか'},{s:'コンビニのだよ。俺、作れないし'}]},
    ]},
    {cam:'sky'},
    {s:'ずっと同じとこにいるんだよな'},
    {s:'リビングの、ソファの横'},
    {p:'落ち込んでるんですかね'},
    {s:'さあ'},
    {cam:'him'},
    {p:'結婚して何年でしたっけ'},
    {s:'十五年。俺が二十七のとき'},
    {p:'十五年もいたら、そういう時期もありますって'},
    {p:'一回、ちゃんと話した方がいいですよ'},
    {s:'話はしてるよ。俺が'},
    {cam:'wide'},
    {n:'沢口さんはパンの袋を小さく畳んで、ポケットにしまった。'},
  ]},

  { bg:'night', cam:'far', date:'10月8日', day:'木曜日', time:'21:10', dark:true, steps:[
    {n:'残業。フロアの蛍光灯は、半分消えている。'},
    {n:'隣のキーボードの音が止まった。'},
    {cam:'him'},
    {s:'昨日の夜さ'},
    {s:'手、触ってみたんだよ'},
    {p:'はい'},
    {s:'冷たかった'},
    {c:[
      {tag:'相槌', t:'「冷え性なんですかね」', r:[{p:'冷え性なんですかね'},{s:'そうかもな'}]},
      {tag:'心配', t:'「仲直り、しようとしたんですね」', r:[{p:'仲直り、しようとしたんですね'},{s:'……うん。まあ'}]},
      {tag:'冗談', t:'「え、のろけですか」', r:[{p:'え、のろけですか'},{s:'どうかな'}]},
    ]},
    {s:'明日、休むわ'},
    {p:'有給ですか'},
    {s:'うん。いろいろ、片付けないと'},
    {cam:'wide'},
    {p:'帰り、東町の方でしたっけ。車なんで、送りますよ'},
    {s:'いや、いい。歩く'},
    {s:'おつかれ'},
    {n:'沢口さんは、椅子にカーディガンを掛けたまま帰っていった。'},
  ]},

  { bg:'empty', cam:'wide', date:'10月13日', day:'火曜日', time:'12:10', final:true, steps:[
    {n:'三連休が明けた。'},
    {n:'沢口さんは、来ていない。'},
    {v:'井上', s:'課長、沢口さん今日お休みですか？'},
    {v:'課長', s:'連絡ないんだよ。電話も出ないし'},
    {v:'井上', s:'珍しいですね'},
    {cam:'chair'},
    {n:'椅子には、グレーのカーディガンが掛かったままだった。'},
    {n:'昼休み。'},
    {phone:true},
  ]},
];

// ---------------- DOM ----------------
const $ = s => document.querySelector(s);
const stage = $('#stage');
const bgs = [$('#bgA'), $('#bgB')];
let bgFront = 0, curScene = null;
const L = {
  title:$('#title'), day:$('#daycard'), talk:$('#talk'), phone:$('#phone'),
  black:$('#blackout'), end:$('#end'), log:$('#log'),
};
const box = $('#box'), nameEl = $('#name'), textEl = $('#text'), nextEl = $('#next'), choicesEl = $('#choices');
const logBtn = $('#logBtn'), logList = $('#logList');

const wait = ms => new Promise(r => setTimeout(r, ms));
const on = (el, v=true) => el.classList.toggle('on', v);

// 画像プリロード
const loaded = {};
Object.values(SCENES).forEach(sc => {
  const im = new Image();
  im.onload = () => { loaded[sc.img] = true; };
  im.src = IMG + sc.img;
});

// 縦長画面では横移動をやめ、背景の横位置（fx）で人物を画面内に収める
const portrait = matchMedia('(max-aspect-ratio: 1/1)');
function camCss(c){
  if (portrait.matches) return `scale(${1 + (c.s - 1) * .35}) translate(0%, ${c.y * .35}%)`;
  return `scale(${c.s}) translate(${c.x}%, ${c.y}%)`;
}
function applyFocus(el, sc, c){
  el.querySelector('.pic').style.backgroundPosition =
    portrait.matches ? `${(c && c.fx != null) ? c.fx : sc.fx}% 50%` : 'center';
}

function showBg(key, camName, {instant=false, blur=0} = {}){
  const sc = SCENES[key];
  curScene = key;
  const next = instant ? bgFront : 1 - bgFront;
  const el = bgs[next];
  const pic = el.querySelector('.pic');
  const cam = el.querySelector('.cam');
  pic.style.backgroundImage = `url("${IMG}${sc.img}"), ${sc.fb}`;
  cam.style.transition = 'none';
  cam.style.transform = camCss(sc.cams[camName] || Object.values(sc.cams)[0]);
  cam.style.filter = blur ? `blur(${blur}px)` : 'none';
  applyFocus(el, sc, sc.cams[camName]);
  void cam.offsetWidth;
  cam.style.transition = '';
  if (!instant){
    bgs[bgFront].classList.remove('show');
    el.classList.add('show');
    bgFront = next;
  } else {
    el.classList.add('show');
  }
}
function setCam(name, {blur=null, dur=null} = {}){
  const cam = bgs[bgFront].querySelector('.cam');
  const c = SCENES[curScene].cams[name];
  if (dur != null) cam.style.transitionDuration = `${dur}s, 2.4s`;
  else cam.style.transitionDuration = '';
  if (c){ cam.style.transform = camCss(c); applyFocus(bgs[bgFront], SCENES[curScene], c); }
  if (blur != null) cam.style.filter = blur ? `blur(${blur}px)` : 'none';
}

// ---------------- クリック待ち ----------------
let clickResolver = null;
function waitClick(){ return new Promise(r => { clickResolver = r; }); }
L.talk.addEventListener('click', e => {
  if (e.target.closest('.choice')) return;
  if (clickResolver){ const r = clickResolver; clickResolver = null; r(); }
});

// ---------------- 履歴 ----------------
const history = [];
function logLine(who, text, kind){ history.push({who, text, kind}); }
function logDay(label){ history.push({day:label}); }
logBtn.addEventListener('click', e => {
  e.stopPropagation();
  logList.innerHTML = '';
  history.forEach(h => {
    const d = document.createElement('div');
    if (h.day){ d.className = 'day'; d.textContent = h.day; }
    else {
      d.className = 'ln' + (h.kind === 'n' ? ' n' : '');
      if (h.kind === 'n') d.textContent = h.text;
      else {
        const w = document.createElement('span'); w.className = 'who'; w.textContent = h.who;
        d.append(w, `「${h.text}」`);
      }
    }
    logList.appendChild(d);
  });
  on(L.log);
  logList.scrollTop = logList.scrollHeight;
});
$('#logClose').addEventListener('click', e => { e.stopPropagation(); on(L.log, false); });

// ---------------- 会話 ----------------
let typing = false, skipType = false;
async function say(who, text, kind){
  box.classList.remove('hidden');
  nameEl.textContent = who || '';
  textEl.className = kind === 'n' ? 'narr' : kind === 'p' ? 'me' : '';
  const shown = kind === 'n' ? text : `「${text}」`;
  logLine(who, text, kind);
  textEl.textContent = '';
  on(nextEl, false);
  typing = true; skipType = false;
  const speed = kind === 'n' ? 34 : 46;
  // タイプ中のクリックで全文表示
  const skipper = () => { skipType = true; };
  L.talk.addEventListener('click', skipper);
  for (let i = 0; i < shown.length; i++){
    if (skipType){ textEl.textContent = shown; break; }
    textEl.textContent = shown.slice(0, i + 1);
    const ch = shown[i];
    await wait(ch === '、' ? speed * 5 : ch === '。' || ch === '…' ? speed * 7 : speed);
  }
  L.talk.removeEventListener('click', skipper);
  typing = false;
  await wait(120);
  on(nextEl);
  await waitClick();
  on(nextEl, false);
}

function choose(opts){
  return new Promise(res => {
    choicesEl.innerHTML = '';
    opts.forEach((o, i) => {
      const b = document.createElement('button');
      b.className = 'choice';
      const tag = document.createElement('span'); tag.className = 'tag'; tag.textContent = o.tag;
      const t = document.createElement('span'); t.textContent = o.t;
      b.append(tag, t);
      b.addEventListener('click', e => {
        e.stopPropagation();
        on(choicesEl, false);
        res(o);
      });
      choicesEl.appendChild(b);
    });
    on(choicesEl);
  });
}

async function runSteps(steps){
  for (const st of steps){
    if (st.cam){ setCam(st.cam); continue; }
    if (st.c){
      box.classList.add('hidden');
      const o = await choose(st.c);
      await runSteps(o.r);
      continue;
    }
    if (st.phone){ await phoneSequence(); continue; }
    if (st.n)      await say('', st.n, 'n');
    else if (st.v) await say(st.v, st.s, 'v');
    else if (st.s) await say('沢口', st.s, 's');
    else if (st.p) await say('自分', st.p, 'p');
  }
}

async function dayCard(d){
  on(L.talk, false);
  logBtn.classList.remove('on');
  L.day.querySelector('.dc-date').textContent = d.date;
  L.day.querySelector('.dc-day').textContent = d.day;
  L.day.querySelector('.dc-time').textContent = d.time;
  on(L.day);
  await wait(30);
  L.day.classList.add('vis');
  await wait(1000);
  showBg(d.bg, d.cam, {instant:false});
  stage.classList.toggle('dark', !!d.dark);
  await wait(1500);
  L.day.classList.remove('vis');
  await wait(900);
  on(L.day, false);
  logDay(`${d.date}（${d.day.slice(0,1)}）`);
}

// ---------------- 最終：スマホ ----------------
async function phoneSequence(){
  box.classList.add('hidden');
  logBtn.classList.remove('on');
  showBg('phone', 'base');
  await wait(1400);
  await say('', 'なんとなく、スマホを開いた。', 'n');
  box.classList.add('hidden');
  setCam('close', {blur:6, dur:2.2});
  await wait(700);
  const list = $('#phList'), art = $('#phArticle'), target = $('#phTarget');
  list.classList.remove('off'); art.classList.remove('on');
  on(L.phone);
  L.phone.classList.remove('up');
  await wait(40);
  L.phone.classList.add('up');
  logLine('', '（ニュース）住宅で女性の遺体　同居の夫と連絡取れず', 'n');
  await new Promise(res => {
    target.addEventListener('click', function h(e){
      e.stopPropagation(); target.removeEventListener('click', h); res();
    });
  });
  list.classList.add('off');
  art.classList.add('on');
  // 読む時間。少し経ってからクリック受付
  await wait(2600);
  await new Promise(res => {
    const h = () => { L.phone.removeEventListener('click', h); res(); };
    L.phone.addEventListener('click', h);
  });
  // 黙る
  on(L.talk);
  box.classList.remove('hidden');
  nameEl.textContent = '';
  textEl.className = 'me';
  textEl.textContent = '';
  logLine('自分', '……', 'p');
  for (const ch of '……'){ await wait(900); textEl.textContent += ch; }
  await wait(3800);
  L.black.classList.add('on');
  await wait(3000);
}

// ---------------- 進行 ----------------
async function play(){
  history.length = 0;
  on(L.title, false);
  for (const d of DAYS){
    await dayCard(d);
    on(L.talk);
    logBtn.classList.add('on');
    await runSteps(d.steps);
  }
  // END
  on(L.talk, false); on(L.phone, false); logBtn.classList.remove('on');
  L.phone.classList.remove('up');
  on(L.end);
}

function toTitle(){
  on(L.end, false); on(L.phone, false); on(L.talk, false);
  L.black.classList.remove('on');
  stage.classList.remove('dark');
  showBg('title', 'base', {instant:true});
  bgs[1 - bgFront].classList.remove('show');
  on(L.title);
}

$('#startBtn').addEventListener('click', () => play());
$('#againBtn').addEventListener('click', () => toTitle());
document.querySelectorAll('.ph-item[data-dummy]').forEach(b =>
  b.addEventListener('click', e => e.stopPropagation()));

toTitle();
})();
