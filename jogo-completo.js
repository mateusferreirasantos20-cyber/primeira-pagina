// ===== Teclas - Jogo de Ritmo: tudo em JavaScript =====
// Este arquivo cria o CSS e o HTML da pagina e roda o jogo.
(function(){
  document.documentElement.lang="pt-BR";
  document.title="Teclas - Jogo de Ritmo";
  var m=document.createElement("meta");
  m.name="viewport";m.content="width=device-width, initial-scale=1, viewport-fit=cover";
  document.head.appendChild(m);
  var st=document.createElement("style");
  st.textContent=":root{--bg:#f1ede4;--panel:#fffdf8;--ink:#1d1a24;--mute:#6f6a78;--lane:#e4ddcf;--line:#c9bfa9;--accent:#b4263f;--tile:#1d1a24;--key:#fffdf8;--keyshadow:#cfc6b4;color-scheme:light}\n@media (prefers-color-scheme:dark){:root:not([data-theme=\"light\"]){--bg:#0f1117;--panel:#181b25;--ink:#f3eee3;--mute:#9a96a6;--lane:#171a24;--line:#2a2e3d;--accent:#f0a93b;--tile:#f3eee3;--key:#f3eee3;--keyshadow:#8d8878;color-scheme:dark}}\n:root[data-theme=\"dark\"]{--bg:#0f1117;--panel:#181b25;--ink:#f3eee3;--mute:#9a96a6;--lane:#171a24;--line:#2a2e3d;--accent:#f0a93b;--tile:#f3eee3;--key:#f3eee3;--keyshadow:#8d8878;color-scheme:dark}\n*{box-sizing:border-box;margin:0}\nhtml,body{height:100%}\n:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}\nhtml{scroll-padding-top:env(safe-area-inset-top,0px)}\nbody{background:var(--bg);color:var(--ink);font-family:Georgia,\"Times New Roman\",serif;display:flex;justify-content:center;overflow:hidden;touch-action:manipulation;user-select:none;-webkit-user-select:none}\n#app{position:relative;width:100%;max-width:460px;height:100%;display:flex;flex-direction:column}\n#hud{display:flex;justify-content:space-between;align-items:flex-end;padding:10px 14px 6px;font-variant-numeric:tabular-nums}\n#score{font-size:34px;font-weight:700;line-height:1}\n#combo{font-size:15px;color:var(--mute);text-align:right}\n#combo b{color:var(--accent);font-size:20px}\n#hp{height:5px;background:var(--line);margin:0 14px 8px;border-radius:3px;overflow:hidden}\n#hpf{height:100%;width:100%;background:var(--accent);transition:width .15s}\n#wrap{position:relative;flex:1;min-height:0}\ncanvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none}\n.ov{position:absolute;inset:0;background:color-mix(in srgb,var(--bg) 92%,transparent);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;text-align:center;z-index:5}\n.ov.hide{display:none}\nh1{font-size:44px;letter-spacing:-.02em;line-height:1}\nh2{font-size:30px}\np{color:var(--mute);font-size:15px;line-height:1.45;max-width:34ch}\n.row{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}\nbutton{font:inherit;font-size:16px;color:var(--ink);background:var(--panel);border:1.5px solid var(--line);padding:10px 16px;border-radius:8px;cursor:pointer;min-height:44px}\nbutton.on{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent);font-weight:700}\nbutton.go{background:var(--accent);color:var(--bg);border-color:var(--accent);font-weight:700;padding:12px 34px;font-size:18px}\nbutton:focus-visible{outline:3px solid var(--accent);outline-offset:2px}\n.lbl{font-size:14px;color:var(--mute)}\n.stats{font-size:18px;line-height:1.7}\n#pauseb{position:absolute;top:6px;right:6px;z-index:3;min-height:32px;padding:2px 10px;font-size:13px;opacity:.8}\n";
  document.head.appendChild(st);
  document.body.insertAdjacentHTML("afterbegin","<div id=\"app\">\n  <div id=\"hud\"><div id=\"score\">0</div><div id=\"combo\"><b id=\"cn\">0</b> combo</div></div>\n  <div id=\"hp\"><div id=\"hpf\"></div></div>\n  <div id=\"wrap\">\n    <canvas id=\"c\"></canvas>\n    <button id=\"pauseb\">Pausar</button>\n\n    <div class=\"ov\" id=\"menu\">\n      <h1>Teclas</h1>\n      <p>Toque as teclas no momento em que as notas chegarem à linha. Cada acerto toca a melodia.</p>\n      <div class=\"lbl\">Música</div>\n      <div class=\"row\" id=\"songs\"></div>\n      <div class=\"lbl\">Dificuldade</div>\n      <div class=\"row\" id=\"diffs\"></div>\n      <button class=\"go\" id=\"start\">Jogar</button>\n      <p>Teclado: D F J K · Celular: toque nas colunas · Esc pausa</p>\n      <div class=\"lbl\" id=\"best\"></div>\n      <button id=\"exit\">Sair</button>\n    </div>\n\n    <div class=\"ov hide\" id=\"pause\">\n      <h2>Pausado</h2>\n      <button class=\"go\" id=\"resume\">Continuar</button>\n      <button id=\"tomenu1\">Voltar ao menu</button>\n      <button id=\"quit1\">Sair do jogo</button>\n    </div>\n\n    <div class=\"ov hide\" id=\"end\">\n      <h2 id=\"etitle\"></h2>\n      <div class=\"stats\" id=\"estats\"></div>\n      <button class=\"go\" id=\"again\">Jogar de novo</button>\n      <button id=\"tomenu2\">Voltar ao menu</button>\n      <button id=\"quit2\">Sair do jogo</button>\n    </div>\n\n    <div class=\"ov hide\" id=\"bye\">\n      <h2>Até logo!</h2>\n      <p>Obrigado por jogar. Você já pode fechar esta aba.</p>\n      <button class=\"go\" id=\"back\">Voltar ao jogo</button>\n    </div>\n  </div>\n</div>");
})();
 
(function(){
"use strict";
// semitons a partir do Dó central (C4)
var SONGS=[
 {name:"Ode à Alegria",notes:[4,4,5,7,7,5,4,2,0,0,2,4,4,2,2,4,4,5,7,7,5,4,2,0,0,2,4,2,0,0,2,2,4,0,2,4,5,4,0,2,4,5,4,2,0,2,-5,4,4,5,7,7,5,4,2,0,0,2,4,2,0,0]},
 {name:"Brilha, Brilha",notes:[0,0,7,7,9,9,7,5,5,4,4,2,2,0,7,7,5,5,4,4,2,7,7,5,5,4,4,2,0,0,7,7,9,9,7,5,5,4,4,2,2,0]},
 {name:"Para Elisa",notes:[16,15,16,15,16,11,14,12,9,0,4,9,11,4,8,11,12,4,16,15,16,15,16,11,14,12,9,0,4,9,11,4,12,11,9]}
];
var DIFFS=[{n:"Fácil",gap:.62},{n:"Médio",gap:.46},{n:"Difícil",gap:.34}];
var KEYS={d:0,f:1,j:2,k:3};
var LEAD=2.2, WIN_G=.2, WIN_P=.08;
var $=function(i){return document.getElementById(i)};
var cv=$("c"),ctx=cv.getContext("2d");
var W=0,H=0,dpr=1;
var songI=0,diffI=1,state="menu";
var tiles=[],floats=[],flash=[0,0,0,0],press=[0,0,0,0];
var t0=0,score=0,combo=0,maxCombo=0,hp=100,hits=0,perfects=0,misses=0,pauseAt=0,rafId=0;
var cs={};
 
function load(k){try{return +localStorage.getItem(k)||0}catch(e){return 0}}
function save(k,v){try{localStorage.setItem(k,v)}catch(e){}}
 
// ---------- áudio ----------
var AC=null;
function audio(){
  if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}
  if(AC&&AC.state==="suspended")AC.resume();
  return AC;
}
function note(semi,vol){
  var a=audio();if(!a)return;
  var f=261.63*Math.pow(2,semi/12),n=a.currentTime;
  var g=a.createGain();g.connect(a.destination);
  g.gain.setValueAtTime(0,n);
  g.gain.linearRampToValueAtTime(vol||.3,n+.008);
  g.gain.exponentialRampToValueAtTime(.0008,n+1.1);
  [[1,"triangle",1],[2,"sine",.35],[3,"sine",.12]].forEach(function(p){
    var o=a.createOscillator(),pg=a.createGain();
    o.type=p[1];o.frequency.value=f*p[0];pg.gain.value=p[2];
    o.connect(pg);pg.connect(g);o.start(n);o.stop(n+1.2);
  });
}
function thud(){
  var a=audio();if(!a)return;var n=a.currentTime;
  var o=a.createOscillator(),g=a.createGain();
  o.type="sawtooth";o.frequency.setValueAtTime(110,n);o.frequency.exponentialRampToValueAtTime(55,n+.2);
  g.gain.setValueAtTime(.12,n);g.gain.exponentialRampToValueAtTime(.001,n+.22);
  o.connect(g);g.connect(a.destination);o.start(n);o.stop(n+.25);
}
 
// ---------- layout ----------
function css(){
  var s=getComputedStyle(document.documentElement);
  ["bg","lane","line","accent","tile","key","keyshadow","ink","mute"].forEach(function(k){cs[k]=s.getPropertyValue("--"+k).trim()});
}
function resize(){
  dpr=Math.min(window.devicePixelRatio||1,2);
  var r=cv.getBoundingClientRect();
  W=r.width;H=r.height;
  cv.width=W*dpr;cv.height=H*dpr;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  css();
}
function hitY(){return H-Math.min(H*.2,120)-28}
function speed(){return (hitY()+60)/LEAD}
function keyTop(){return H-Math.min(H*.2,120)}
 
// ---------- jogo ----------
function build(){
  var s=SONGS[songI],gap=DIFFS[diffI].gap,last=-1,seed=songI*7+diffI*3+1;
  tiles=[];
  s.notes.forEach(function(semi,i){
    seed=(seed*1103515245+12345)&0x7fffffff;
    var lane=seed%4;
    if(lane===last)lane=(lane+1+(seed>>4)%3)%4;
    last=lane;
    tiles.push({lane:lane,semi:semi,t:LEAD+1+i*gap,done:false,state:0});
  });
}
function begin(){
  audio();build();
  score=0;combo=0;maxCombo=0;hp=100;hits=0;perfects=0;misses=0;floats=[];
  t0=performance.now()/1000;
  state="play";
  ["menu","pause","end"].forEach(function(i){$(i).classList.add("hide")});
  $("pauseb").style.display="block";
  hud();cancelAnimationFrame(rafId);rafId=requestAnimationFrame(loop);
}
function now(){return performance.now()/1000-t0}
function hud(){
  $("score").textContent=score;
  $("cn").textContent=combo;
  $("hpf").style.width=Math.max(0,hp)+"%";
}
function say(txt,lane,col){floats.push({txt:txt,lane:lane,age:0,col:col})}
function hit(tl,dt){
  tl.done=true;tl.state=1;
  var perf=Math.abs(dt)<=WIN_P;
  hits++;if(perf)perfects++;
  combo++;if(combo>maxCombo)maxCombo=combo;
  var mult=1+Math.floor(combo/10)*.5;
  score+=Math.round((perf?100:60)*mult);
  hp=Math.min(100,hp+2);
  note(tl.semi,.32);
  flash[tl.lane]=1;
  say(perf?"Perfeito":"Bom",tl.lane,perf?cs.accent:cs.mute);
  hud();
}
function miss(lane,tl){
  misses++;combo=0;hp-=12;thud();
  if(tl){tl.state=2;tl.done=true}
  say("Errou",lane,cs.mute);hud();
  if(hp<=0)finish(false);
}
function tap(lane){
  if(state!=="play")return;
  press[lane]=1;
  var t=now(),best=null,bd=9;
  tiles.forEach(function(tl){
    if(!tl.done&&tl.lane===lane){var d=Math.abs(t-tl.t);if(d<bd){bd=d;best=tl}}
  });
  if(best&&bd<=WIN_G){hit(best,t-best.t)}
  else{combo=0;hp-=5;thud();say("Errou",lane,cs.mute);hud();if(hp<=0)finish(false)}
}
function finish(win){
  if(state==="over")return;
  state="over";
  $("pauseb").style.display="none";
  var total=SONGS[songI].notes.length;
  var acc=total?Math.round(hits/total*100):0;
  var key="best"+songI+"-"+diffI,b=load(key),rec=score>b;
  if(rec)save(key,score);
  $("etitle").textContent=win?"Música completa":"Fim de jogo";
  $("estats").innerHTML="Pontos: <b>"+score+"</b>"+(rec?" (novo recorde)":"")+"<br>Precisão: "+acc+"% · Perfeitos: "+perfects+"<br>Maior combo: "+maxCombo;
  $("end").classList.remove("hide");
}
function pause(){
  if(state!=="play")return;
  state="pause";pauseAt=performance.now()/1000;
  $("pause").classList.remove("hide");
}
function resume(){
  if(state!=="pause")return;
  t0+=performance.now()/1000-pauseAt;
  state="play";$("pause").classList.add("hide");
  rafId=requestAnimationFrame(loop);
}
function toMenu(){
  state="menu";
  ["pause","end"].forEach(function(i){$(i).classList.add("hide")});
  $("menu").classList.remove("hide");$("pauseb").style.display="none";
  tiles=[];refreshBest();draw(0);
}
function refreshBest(){
  var b=load("best"+songI+"-"+diffI);
  $("best").textContent=b?"Seu recorde: "+b:"Sem recorde ainda";
}
 
// ---------- loop ----------
var lastF=0;
function loop(ts){
  if(state!=="play")return;
  var t=now(),dt=Math.min(.05,(ts-lastF)/1000||.016);lastF=ts;
  tiles.forEach(function(tl){
    if(!tl.done&&t-tl.t>WIN_G){miss(tl.lane,tl)}
  });
  for(var i=0;i<4;i++){flash[i]=Math.max(0,flash[i]-dt*4);press[i]=Math.max(0,press[i]-dt*7)}
  floats.forEach(function(f){f.age+=dt});
  floats=floats.filter(function(f){return f.age<.7});
  if(state==="play"&&tiles.length&&tiles.every(function(x){return x.done}))finish(true);
  draw(t);
  if(state==="play")rafId=requestAnimationFrame(loop);
}
 
function draw(t){
  if(!W)return;
  ctx.clearRect(0,0,W,H);
  var lw=W/4,hy=hitY(),kt=keyTop(),sp=speed(),th=Math.min(H*.17,110);
  // colunas
  for(var i=0;i<4;i++){
    ctx.fillStyle=cs.lane;ctx.fillRect(i*lw,0,lw,H);
    if(flash[i]>0){ctx.globalAlpha=flash[i]*.22;ctx.fillStyle=cs.accent;ctx.fillRect(i*lw,0,lw,kt);ctx.globalAlpha=1}
    if(i>0){ctx.fillStyle=cs.line;ctx.fillRect(i*lw-.5,0,1,H)}
  }
  // linha de acerto
  ctx.fillStyle=cs.accent;ctx.globalAlpha=.55;ctx.fillRect(0,hy-1,W,2);ctx.globalAlpha=1;
  // notas
  tiles.forEach(function(tl){
    if(tl.state===1)return;
    var y=hy-(tl.t-t)*sp;
    if(y<-th||y>H+th)return;
    var x=tl.lane*lw+4;
    ctx.globalAlpha=tl.state===2?.25:1;
    ctx.fillStyle=cs.tile;
    rr(x,y-th/2,lw-8,th,8);ctx.fill();
    ctx.globalAlpha=1;
  });
  // teclas de piano
  for(var k=0;k<4;k++){
    var kx=k*lw+2,d=press[k]*6;
    ctx.fillStyle=cs.keyshadow;rr(kx,kt+d+3,lw-4,H-kt-d,6);ctx.fill();
    ctx.fillStyle=cs.key;rr(kx,kt+d,lw-4,H-kt-8,6);ctx.fill();
    if(flash[k]>0){ctx.globalAlpha=flash[k]*.6;ctx.fillStyle=cs.accent;rr(kx,kt+d,lw-4,H-kt-8,6);ctx.fill();ctx.globalAlpha=1}
    ctx.fillStyle=cs.mute;ctx.font="700 16px Georgia,serif";ctx.textAlign="center";
    ctx.fillText("DFJK"[k],k*lw+lw/2,H-18);
  }
  // textos flutuantes
  ctx.font="700 17px Georgia,serif";ctx.textAlign="center";
  floats.forEach(function(f){
    ctx.globalAlpha=1-f.age/.7;ctx.fillStyle=f.col;
    ctx.fillText(f.txt,f.lane*lw+lw/2,hy-30-f.age*50);
  });
  ctx.globalAlpha=1;
  // contagem
  if(state==="play"){
    var rem=LEAD-t;
    if(rem>0){
      ctx.fillStyle=cs.ink;ctx.font="700 72px Georgia,serif";ctx.globalAlpha=.8;
      ctx.fillText(String(Math.ceil(rem*1.3/LEAD*1.5)>3?3:Math.max(1,Math.ceil(rem/(LEAD/3)))),W/2,H*.4);ctx.globalAlpha=1;
    }
  }
}
function rr(x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();
}
 
// ---------- UI ----------
function opts(id,list,get,set){
  var el=$(id);el.innerHTML="";
  list.forEach(function(it,i){
    var b=document.createElement("button");
    b.textContent=it.name||it.n;
    if(get()===i)b.className="on";
    b.onclick=function(){set(i);opts(id,list,get,set);refreshBest()};
    el.appendChild(b);
  });
}
opts("songs",SONGS,function(){return songI},function(i){songI=i});
opts("diffs",DIFFS,function(){return diffI},function(i){diffI=i});
$("start").onclick=begin;$("again").onclick=begin;
$("resume").onclick=resume;$("pauseb").onclick=pause;
$("tomenu1").onclick=toMenu;$("tomenu2").onclick=toMenu;
function quit(){
  state="bye";
  ["menu","pause","end"].forEach(function(i){$(i).classList.add("hide")});
  $("pauseb").style.display="none";
  $("bye").classList.remove("hide");
  try{window.close()}catch(e){}
}
$("exit").onclick=quit;$("quit1").onclick=quit;$("quit2").onclick=quit;
$("back").onclick=function(){$("bye").classList.add("hide");toMenu()};
 
window.addEventListener("keydown",function(e){
  if(e.repeat)return;
  var k=e.key.toLowerCase();
  if(k==="escape"||k==="p"){state==="play"?pause():resume();return}
  if(k in KEYS){e.preventDefault();tap(KEYS[k])}
  if(k==="enter"&&state==="menu")begin();
});
cv.addEventListener("pointerdown",function(e){
  e.preventDefault();
  var r=cv.getBoundingClientRect();
  tap(Math.max(0,Math.min(3,Math.floor((e.clientX-r.left)/r.width*4))));
});
window.addEventListener("resize",function(){resize();draw(state==="play"?now():0)});
window.addEventListener("blur",pause);
document.addEventListener("visibilitychange",function(){if(document.hidden)pause()});
if(window.matchMedia)matchMedia("(prefers-color-scheme: dark)").addEventListener("change",function(){css()});
 
$("pauseb").style.display="none";
resize();refreshBest();draw(0);
})();
 