
(function () {
  "use strict";

  var host = document.getElementById("jogo");
  if (!host) return;

  host.innerHTML =
    '<div id="app">' +
    '  <div id="hud"><div id="score">0</div><div id="combo"><b id="cn">0</b> combo</div></div>' +
    '  <div id="hp"><div id="hpf"></div></div>' +
    '  <div id="wrap">' +
    '    <canvas id="c"></canvas>' +
    '    <button id="pauseb">Pausar</button>' +
    '    <div class="ov" id="menu">' +
    '      <h1>Teclas</h1>' +
    '      <p>Toque as teclas no momento em que as notas chegarem à linha. Cada acerto toca a melodia.</p>' +
    '      <div class="lbl">Música</div>' +
    '      <div class="row" id="songs"></div>' +
    '      <div class="lbl">Dificuldade</div>' +
    '      <div class="row" id="diffs"></div>' +
    '      <button class="go" id="start">Jogar</button>' +
    '      <p class="dica">Teclado: D F J K · Celular: toque nas colunas · Esc pausa</p>' +
    '      <div class="lbl" id="best"></div>' +
    '      <button id="exit">Sair</button>' +
    '    </div>' +
    '    <div class="ov hide" id="pause">' +
    '      <h2>Pausado</h2>' +
    '      <button class="go" id="resume">Continuar</button>' +
    '      <button id="tomenu1">Voltar ao menu</button>' +
    '      <button id="quit1">Sair do jogo</button>' +
    '    </div>' +
    '    <div class="ov hide" id="end">' +
    '      <h2 id="etitle"></h2>' +
    '      <div class="stats" id="estats"></div>' +
    '      <button class="go" id="again">Jogar de novo</button>' +
    '      <button id="tomenu2">Voltar ao menu</button>' +
    '      <button id="quit2">Sair do jogo</button>' +
    '    </div>' +
    '    <div class="ov hide" id="bye">' +
    '      <h2>Até logo!</h2>' +
    '      <p>Obrigado por jogar.</p>' +
    '      <button class="go" id="back">Voltar ao jogo</button>' +
    '    </div>' +
    '  </div>' +
    '</div>';


  var SONGS = [
    { name: "Ode à Alegria", notes: [4,4,5,7,7,5,4,2,0,0,2,4,4,2,2,4,4,5,7,7,5,4,2,0,0,2,4,2,0,0,2,2,4,0,2,4,5,4,0,2,4,5,4,2,0,2,-5,4,4,5,7,7,5,4,2,0,0,2,4,2,0,0] },
    { name: "Brilha, Brilha", notes: [0,0,7,7,9,9,7,5,5,4,4,2,2,0,7,7,5,5,4,4,2,7,7,5,5,4,4,2,0,0,7,7,9,9,7,5,5,4,4,2,2,0] },
    { name: "Para Elisa", notes: [16,15,16,15,16,11,14,12,9,0,4,9,11,4,8,11,12,4,16,15,16,15,16,11,14,12,9,0,4,9,11,4,12,11,9] }
  ];
  var DIFFS = [{ n: "Fácil", gap: 0.62 }, { n: "Médio", gap: 0.46 }, { n: "Difícil", gap: 0.34 }];
  var KEYS = { d: 0, f: 1, j: 2, k: 3 };
  var LEAD = 2.2, WIN_G = 0.2, WIN_P = 0.08;

  var $ = function (i) { return document.getElementById(i); };
  var cv = $("c"), ctx = cv.getContext("2d");
  var W = 0, H = 0, dpr = 1;
  var songI = 0, diffI = 1, state = "menu";
  var tiles = [], floats = [], flash = [0, 0, 0, 0], press = [0, 0, 0, 0];
  var t0 = 0, score = 0, combo = 0, maxCombo = 0, hp = 100, hits = 0, perfects = 0, misses = 0, pauseAt = 0, rafId = 0;
  var cs = {};

  function load(k) { try { return +localStorage.getItem(k) || 0; } catch (e) { return 0; } }
  function save(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // ---------- áudio ----------
  var AC = null;
  function audio() {
    if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
    if (AC && AC.state === "suspended") AC.resume();
    return AC;
  }
  function note(semi, vol) {
    var a = audio(); if (!a) return;
    var f = 261.63 * Math.pow(2, semi / 12), n = a.currentTime;
    var g = a.createGain(); g.connect(a.destination);
    g.gain.setValueAtTime(0, n);
    g.gain.linearRampToValueAtTime(vol || 0.3, n + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0008, n + 1.1);
    [[1, "triangle", 1], [2, "sine", 0.35], [3, "sine", 0.12]].forEach(function (p) {
      var o = a.createOscillator(), pg = a.createGain();
      o.type = p[1]; o.frequency.value = f * p[0]; pg.gain.value = p[2];
      o.connect(pg); pg.connect(g); o.start(n); o.stop(n + 1.2);
    });
  }
  function thud() {
    var a = audio(); if (!a) return; var n = a.currentTime;
    var o = a.createOscillator(), g = a.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(110, n);
    o.frequency.exponentialRampToValueAtTime(55, n + 0.2);
    g.gain.setValueAtTime(0.12, n);
    g.gain.exponentialRampToValueAtTime(0.001, n + 0.22);
    o.connect(g); g.connect(a.destination); o.start(n); o.stop(n + 0.25);
  }

  // ---------- layout ----------
  function css() {
    var s = getComputedStyle(host);
    ["bg", "lane", "line", "accent", "tile", "key", "keyshadow", "ink", "mute"].forEach(function (k) {
      cs[k] = s.getPropertyValue("--" + k).trim();
    });
  }
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = cv.getBoundingClientRect();
    W = r.width; H = r.height;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    css();
  }
  function hitY() { return H - Math.min(H * 0.2, 120) - 28; }
  function speed() { return (hitY() + 60) / LEAD; }
  function keyTop() { return H - Math.min(H * 0.2, 120); }

  // ---------- jogo ----------
  function build() {
    var s = SONGS[songI], gap = DIFFS[diffI].gap, last = -1, seed = songI * 7 + diffI * 3 + 1;
    tiles = [];
    s.notes.forEach(function (semi, i) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      var lane = seed % 4;
      if (lane === last) lane = (lane + 1 + (seed >> 4) % 3) % 4;
      last = lane;
      tiles.push({ lane: lane, semi: semi, t: LEAD + 1 + i * gap, done: false, state: 0 });
    });
  }
  function begin() {
    audio(); build();
    score = 0; combo = 0; maxCombo = 0; hp = 100; hits = 0; perfects = 0; misses = 0; floats = [];
    t0 = performance.now() / 1000;
    state = "play";
    ["menu", "pause", "end"].forEach(function (i) { $(i).classList.add("hide"); });
    $("pauseb").style.display = "block";
    hud(); cancelAnimationFrame(rafId); rafId = requestAnimationFrame(loop);
  }
  function now() { return performance.now() / 1000 - t0; }
  function curT() { return state === "play" ? now() : state === "pause" ? pauseAt - t0 : 0; }
  function hud() {
    $("score").textContent = score;
    $("cn").textContent = combo;
    $("hpf").style.width = Math.max(0, hp) + "%";
  }
  function say(txt, lane, col) { floats.push({ txt: txt, lane: lane, age: 0, col: col }); }
  function hit(tl, dt) {
    tl.done = true; tl.state = 1;
    var perf = Math.abs(dt) <= WIN_P;
    hits++; if (perf) perfects++;
    combo++; if (combo > maxCombo) maxCombo = combo;
    var mult = 1 + Math.floor(combo / 10) * 0.5;
    score += Math.round((perf ? 100 : 60) * mult);
    hp = Math.min(100, hp + 2);
    note(tl.semi, 0.32);
    flash[tl.lane] = 1;
    say(perf ? "Perfeito" : "Bom", tl.lane, perf ? cs.accent : cs.mute);
    hud();
  }
  function miss(lane, tl) {
    misses++; combo = 0; hp -= 12; thud();
    if (tl) { tl.state = 2; tl.done = true; }
    say("Errou", lane, cs.mute); hud();
    if (hp <= 0) finish(false);
  }
  function tap(lane) {
    if (state !== "play") return;
    press[lane] = 1;
    var t = now(), best = null, bd = 9;
    tiles.forEach(function (tl) {
      if (!tl.done && tl.lane === lane) {
        var d = Math.abs(t - tl.t);
        if (d < bd) { bd = d; best = tl; }
      }
    });
    if (best && bd <= WIN_G) { hit(best, t - best.t); }
    else {
      combo = 0; hp -= 5; thud(); say("Errou", lane, cs.mute); hud();
      if (hp <= 0) finish(false);
    }
  }
  function finish(win) {
    if (state === "over") return;
    state = "over";
    $("pauseb").style.display = "none";
    var total = SONGS[songI].notes.length;
    var acc = total ? Math.round(hits / total * 100) : 0;
    var key = "best" + songI + "-" + diffI, b = load(key), rec = score > b;
    if (rec) save(key, score);
    $("etitle").textContent = win ? "Música completa" : "Fim de jogo";
    $("estats").innerHTML = "Pontos: <b>" + score + "</b>" + (rec ? " (novo recorde)" : "") +
      "<br>Precisão: " + acc + "% · Perfeitos: " + perfects + "<br>Maior combo: " + maxCombo;
    $("end").classList.remove("hide");
  }
  function pause() {
    if (state !== "play") return;
    state = "pause"; pauseAt = performance.now() / 1000;
    $("pause").classList.remove("hide");
  }
  function resume() {
    if (state !== "pause") return;
    t0 += performance.now() / 1000 - pauseAt;
    state = "play"; $("pause").classList.add("hide");
    rafId = requestAnimationFrame(loop);
  }
  function toMenu() {
    cancelAnimationFrame(rafId);
    state = "menu";
    ["pause", "end", "bye"].forEach(function (i) { $(i).classList.add("hide"); });
    $("menu").classList.remove("hide"); $("pauseb").style.display = "none";
    tiles = []; floats = []; refreshBest(); draw(0);
  }
  function refreshBest() {
    var b = load("best" + songI + "-" + diffI);
    $("best").textContent = b ? "Seu recorde: " + b : "Sem recorde ainda";
  }

  // ---------- loop ----------
  var lastF = 0;
  function loop(ts) {
    if (state !== "play") return;
    var t = now(), dt = Math.min(0.05, (ts - lastF) / 1000 || 0.016); lastF = ts;
    tiles.forEach(function (tl) {
      if (state === "play" && !tl.done && t - tl.t > WIN_G) miss(tl.lane, tl);
    });
    for (var i = 0; i < 4; i++) {
      flash[i] = Math.max(0, flash[i] - dt * 4);
      press[i] = Math.max(0, press[i] - dt * 7);
    }
    floats.forEach(function (f) { f.age += dt; });
    floats = floats.filter(function (f) { return f.age < 0.7; });
    if (state === "play" && tiles.length && tiles.every(function (x) { return x.done; })) finish(true);
    draw(t);
    if (state === "play") rafId = requestAnimationFrame(loop);
  }

  function draw(t) {
    if (!W) return;
    ctx.clearRect(0, 0, W, H);
    var lw = W / 4, hy = hitY(), kt = keyTop(), sp = speed(), th = Math.min(H * 0.17, 110);
    // colunas
    for (var i = 0; i < 4; i++) {
      ctx.fillStyle = cs.lane; ctx.fillRect(i * lw, 0, lw, H);
      if (flash[i] > 0) {
        ctx.globalAlpha = flash[i] * 0.22; ctx.fillStyle = cs.accent;
        ctx.fillRect(i * lw, 0, lw, kt); ctx.globalAlpha = 1;
      }
      if (i > 0) { ctx.fillStyle = cs.line; ctx.fillRect(i * lw - 0.5, 0, 1, H); }
    }
    // linha de acerto
    ctx.fillStyle = cs.accent; ctx.globalAlpha = 0.55; ctx.fillRect(0, hy - 1, W, 2); ctx.globalAlpha = 1;
    // notas
    tiles.forEach(function (tl) {
      if (tl.state === 1) return;
      var y = hy - (tl.t - t) * sp;
      if (y < -th || y > H + th) return;
      var x = tl.lane * lw + 4;
      ctx.globalAlpha = tl.state === 2 ? 0.25 : 1;
      ctx.fillStyle = cs.tile;
      rr(x, y - th / 2, lw - 8, th, 8); ctx.fill();
      ctx.globalAlpha = 1;
    });
    // teclas de piano
    for (var k = 0; k < 4; k++) {
      var kx = k * lw + 2, d = press[k] * 6;
      ctx.fillStyle = cs.keyshadow; rr(kx, kt + d + 3, lw - 4, H - kt - d, 6); ctx.fill();
      ctx.fillStyle = cs.key; rr(kx, kt + d, lw - 4, H - kt - 8, 6); ctx.fill();
      if (flash[k] > 0) {
        ctx.globalAlpha = flash[k] * 0.6; ctx.fillStyle = cs.accent;
        rr(kx, kt + d, lw - 4, H - kt - 8, 6); ctx.fill(); ctx.globalAlpha = 1;
      }
      ctx.fillStyle = cs.mute; ctx.font = "600 16px Poppins, Helvetica, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("DFJK"[k], k * lw + lw / 2, H - 18);
    }
    // textos flutuantes
    ctx.font = "600 16px Poppins, Helvetica, sans-serif"; ctx.textAlign = "center";
    floats.forEach(function (f) {
      ctx.globalAlpha = 1 - f.age / 0.7; ctx.fillStyle = f.col;
      ctx.fillText(f.txt, f.lane * lw + lw / 2, hy - 30 - f.age * 50);
    });
    ctx.globalAlpha = 1;
    // contagem regressiva
    if (state === "play") {
      var rem = LEAD - t;
      if (rem > 0) {
        ctx.fillStyle = cs.ink; ctx.font = "700 72px Poppins, Helvetica, sans-serif"; ctx.globalAlpha = 0.8;
        ctx.fillText(String(Math.max(1, Math.ceil(rem / (LEAD / 3)))), W / 2, H * 0.4);
        ctx.globalAlpha = 1;
      }
    }
  }
  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // ---------- UI ----------
  function opts(id, list, get, set) {
    var el = $(id); el.innerHTML = "";
    list.forEach(function (it, i) {
      var b = document.createElement("button");
      b.textContent = it.name || it.n;
      if (get() === i) b.className = "on";
      b.onclick = function () { set(i); opts(id, list, get, set); refreshBest(); };
      el.appendChild(b);
    });
  }
  opts("songs", SONGS, function () { return songI; }, function (i) { songI = i; });
  opts("diffs", DIFFS, function () { return diffI; }, function (i) { diffI = i; });
  $("start").onclick = begin; $("again").onclick = begin;
  $("resume").onclick = resume; $("pauseb").onclick = pause;
  $("tomenu1").onclick = toMenu; $("tomenu2").onclick = toMenu;
  function quit() {
    cancelAnimationFrame(rafId);
    state = "bye";
    ["menu", "pause", "end"].forEach(function (i) { $(i).classList.add("hide"); });
    $("pauseb").style.display = "none";
    $("bye").classList.remove("hide");
  }
  $("exit").onclick = quit; $("quit1").onclick = quit; $("quit2").onclick = quit;
  $("back").onclick = toMenu;

  window.addEventListener("keydown", function (e) {
    if (e.repeat) return;
    var k = e.key.toLowerCase();
    if (k === "escape" || k === "p") {
      if (state === "play") pause(); else if (state === "pause") resume();
      return;
    }
    if (k in KEYS) { e.preventDefault(); tap(KEYS[k]); return; }
    if (k === "enter" && state === "menu") { e.preventDefault(); begin(); }
  });
  cv.addEventListener("pointerdown", function (e) {
    e.preventDefault();
    var r = cv.getBoundingClientRect();
    tap(Math.max(0, Math.min(3, Math.floor((e.clientX - r.left) / r.width * 4))));
  });

  function onResize() { resize(); draw(curT()); }
  if (window.ResizeObserver) new ResizeObserver(onResize).observe(cv);
  window.addEventListener("resize", onResize);
  window.addEventListener("blur", pause);
  document.addEventListener("visibilitychange", function () { if (document.hidden) pause(); });

  $("pauseb").style.display = "none";
  resize(); refreshBest(); draw(0);
})();