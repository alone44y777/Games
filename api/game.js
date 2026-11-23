// =========================================================================
// Empire Tech Zone Arcade API v2.0
// Brand     : Empire Tech Zone
// Developer : Dark Empire
// Owner     : SARDAR-DAUD-ARIAN
// Runtime   : Vercel Serverless Node.js (Zero Dependencies)
// =========================================================================

const BRAND = {
  name: "Empire Tech Zone",
  developer: "Dark Empire",
  owner: "SARDAR-DAUD-ARIAN",
  api_name: "Empire Tech Zone Arcade API",
  version: "2.0.0"
};

const GAMES = {
  shooter: { name: "Neon Space Shooter", category: "Action", controls: "Drag or Arrow Keys (Auto-Fire)" },
  flappy:  { name: "Cyber Flappy Dodge", category: "Reflex", controls: "Tap Screen or Press Space" },
  dodge:   { name: "Meteor Survival Arena", category: "Survival", controls: "Drag Hero or Arrow Keys" },
  hangman: { name: "Secret Word Hangman", category: "Word / Brain", controls: "Tap Letters or Keyboard" },
  whack:   { name: "Whack-a-Villain", category: "Funny Reflex", controls: "Tap Villains Fast (Avoid Bombs)" },
  stack:   { name: "Neon Tower Stack", category: "1-Tap Arcade", controls: "Tap at Exact Moment to Stack" },
  snake:   { name: "Cyber Neon Snake", category: "Classic Arcade", controls: "Swipe, D-Pad or Arrow Keys" },
  memory:  { name: "Neon Card Flip", category: "Brain Speed", controls: "Tap Cards to Match Pairs" }
};

const THEMES = {
  cyber:  { bg: "#070b14", panel: "#0f172a", primary: "#00f5ff", secondary: "#ff007f", accent: "#39ff14", text: "#e2e8f0" },
  matrix: { bg: "#020a04", panel: "#071a0c", primary: "#00ff41", secondary: "#00c853", accent: "#b9f6ca", text: "#d0ffd6" },
  retro:  { bg: "#120d1d", panel: "#1f1633", primary: "#ffbe0b", secondary: "#fb5607", accent: "#a855f7", text: "#fff3d6" },
  lava:   { bg: "#140606", panel: "#240b0b", primary: "#ff3b30", secondary: "#ff9500", accent: "#ffd60a", text: "#ffe5e5" }
};

const DIFFS = {
  easy:       { speed: 0.78, spawn: 1.25, label: "EASY" },
  normal:     { speed: 1.0,  spawn: 1.0,  label: "NORMAL" },
  hard:       { speed: 1.32, spawn: 0.78, label: "HARD" },
  impossible: { speed: 1.68, spawn: 0.56, label: "IMPOSSIBLE" }
};

const WORD_BANK = {
  pakistan: [
    { w: "LAHORE", h: "Heart of Punjab" },
    { w: "KARACHI", h: "City of Lights" },
    { w: "ISLAMABAD", h: "Green Capital City" },
    { w: "BIRYANI", h: "King of Desi Food" },
    { w: "CRICKET", h: "Everyone loves this sport" },
    { w: "MULTAN", h: "City of Saints" },
    { w: "CHAI", h: "Fuel of every night owl" },
    { w: "KASHMIR", h: "Heaven on Earth" }
  ],
  tech: [
    { w: "VERCEL", h: "Serverless cloud hosting" },
    { w: "GITHUB", h: "Home of source code" },
    { w: "JAVASCRIPT", h: "Language of the web" },
    { w: "FIREWALL", h: "Digital security shield" },
    { w: "ALGORITHM", h: "Step-by-step logic" },
    { w: "TERMINAL", h: "Hacker command window" },
    { w: "DATABASE", h: "Where records live" },
    { w: "SERVERLESS", h: "Functions without servers" }
  ],
  food: [
    { w: "PIZZA", h: "Cheesy round slices" },
    { w: "SHAWARMA", h: "Wrapped street favorite" },
    { w: "BURGER", h: "Patty inside a bun" },
    { w: "SAMOSA", h: "Crispy triangle snack" },
    { w: "MANGO", h: "King of summer fruits" },
    { w: "CHOCOLATE", h: "Sweet cocoa treat" }
  ],
  movies: [
    { w: "INCEPTION", h: "Dream inside a dream" },
    { w: "AVENGERS", h: "Earth mightiest heroes" },
    { w: "MATRIX", h: "Red pill or blue pill" },
    { w: "INTERSTELLAR", h: "Black hole space journey" },
    { w: "TITANIC", h: "Famous iceberg ship" },
    { w: "JOKER", h: "Gotham chaos villain" }
  ]
};

function cleanStr(val, fallback, maxLen) {
  if (val === undefined || val === null) return fallback;
  const s = String(val).trim().slice(0, maxLen || 40);
  return s.length ? s : fallback;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeJson(obj) {
  return JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\//g, "\\u002f")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function encodeWord(word) {
  const clean = String(word || "").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 18);
  if (!clean) return "";
  return Buffer.from(clean, "utf8").toString("base64");
}

function decodeWord(token) {
  try {
    const raw = Buffer.from(String(token || ""), "base64").toString("utf8");
    return raw.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 18);
  } catch (e) {
    return "";
  }
}

function getBaseUrl(req) {
  const proto = (req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
  return `${proto}://${host}`;
}

function buildQuery(obj) {
  const qs = new URLSearchParams();
  Object.keys(obj).forEach((k) => {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") {
      qs.set(k, String(obj[k]));
    }
  });
  return qs.toString();
}

function buildGameHtml(cfg) {
  const th = cfg.themeObj;
  const pageTitle = escHtml(`${cfg.title} | ${BRAND.name}`);
  const cfgJson = safeJson(cfg);
  const bankJson = safeJson(WORD_BANK);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="author" content="${escHtml(BRAND.developer)}">
<meta name="owner" content="${escHtml(BRAND.owner)}">
<meta name="generator" content="${escHtml(BRAND.api_name)} by ${escHtml(BRAND.name)}">
<title>${pageTitle}</title>
<style>
  :root {
    --bg: ${th.bg};
    --panel: ${th.panel};
    --primary: ${th.primary};
    --secondary: ${th.secondary};
    --accent: ${th.accent};
    --text: ${th.text};
  }
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; user-select: none; }
  html, body {
    width: 100%; height: 100dvh; overflow: hidden;
    background: var(--bg); color: var(--text);
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    display: flex; flex-direction: column;
  }
  .hud {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 12px; background: var(--panel);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    z-index: 10; flex-shrink: 0; gap: 8px;
  }
  .hud-left { display: flex; flex-direction: column; min-width: 0; }
  .hud-title {
    font-size: 13px; font-weight: 800; color: var(--primary);
    text-transform: uppercase; letter-spacing: 0.8px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .hud-sub { font-size: 11px; opacity: 0.78; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .hud-stats { display: flex; align-items: center; gap: 8px; }
  .pill {
    background: rgba(0,0,0,0.45); border: 1px solid rgba(255,255,255,0.12);
    padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700;
    display: flex; align-items: center; gap: 4px;
  }
  .pill span { color: var(--primary); }
  .hud-btns { display: flex; gap: 6px; }
  .icon-btn {
    background: rgba(255,255,255,0.07); color: var(--text);
    border: 1px solid rgba(255,255,255,0.15); border-radius: 8px;
    width: 32px; height: 32px; font-size: 14px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
  }
  .icon-btn:active { transform: scale(0.92); }
  .target-bar {
    display: none; text-align: center; font-size: 12px; font-weight: 700;
    padding: 5px 10px; background: rgba(255,0,127,0.16);
    border-bottom: 1px solid var(--secondary); color: var(--text);
    letter-spacing: 0.4px; flex-shrink: 0;
  }
  .target-bar.beaten {
    background: rgba(57,255,20,0.18); border-color: var(--accent); color: var(--accent);
  }
  .stage-wrap {
    position: relative; flex: 1; width: 100%; overflow: hidden;
    display: flex; align-items: center; justify-content: center;
  }
  canvas#gameCanvas {
    display: none; width: 100%; height: 100%; touch-action: none;
  }
  #domStage {
    display: none; width: 100%; height: 100%; max-width: 480px;
    padding: 12px; flex-direction: column; align-items: center;
    justify-content: center; gap: 12px; overflow-y: auto;
  }
  .dpad {
    display: none; position: absolute; bottom: 14px; left: 50%;
    transform: translateX(-50%); z-index: 9; gap: 6px;
    flex-direction: column; align-items: center; opacity: 0.88;
  }
  .dpad-row { display: flex; gap: 28px; }
  .dpad button {
    width: 48px; height: 44px; border-radius: 10px; font-size: 18px;
    background: rgba(15,23,42,0.85); color: var(--primary);
    border: 1px solid var(--primary); cursor: pointer;
  }
  .dpad button:active { background: var(--primary); color: #000; }
  .overlay {
    position: absolute; inset: 0; background: rgba(5,8,16,0.86);
    backdrop-filter: blur(6px); display: flex; align-items: center;
    justify-content: center; padding: 18px; z-index: 20;
  }
  .overlay.hidden { display: none; }
  .card {
    width: 100%; max-width: 360px; background: var(--panel);
    border: 1px solid var(--primary); border-radius: 16px;
    padding: 20px 18px; text-align: center;
    box-shadow: 0 0 28px rgba(0,0,0,0.6), inset 0 0 18px rgba(255,255,255,0.03);
  }
  .badge {
    display: inline-block; font-size: 10px; font-weight: 800;
    letter-spacing: 1.2px; text-transform: uppercase;
    padding: 4px 10px; border-radius: 999px; margin-bottom: 10px;
    border: 1px solid var(--secondary); color: var(--secondary);
    background: rgba(255,255,255,0.04);
  }
  .card h1 { font-size: 22px; color: var(--primary); margin-bottom: 6px; }
  .versus {
    font-size: 14px; margin-bottom: 10px; padding: 8px;
    background: rgba(0,0,0,0.35); border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.08);
  }
  .controls-hint { font-size: 12px; opacity: 0.78; margin-bottom: 16px; line-height: 1.4; }
  .roast-box {
    display: none; margin: 10px 0 14px; padding: 10px 12px;
    border-radius: 10px; background: rgba(255,0,127,0.12);
    border: 1px dashed var(--secondary); font-size: 13px; font-style: italic;
  }
  .score-big { font-size: 38px; font-weight: 900; color: var(--accent); margin: 4px 0; }
  .btn-primary {
    width: 100%; padding: 12px 16px; border: none; border-radius: 10px;
    background: var(--primary); color: #050810; font-size: 15px;
    font-weight: 800; letter-spacing: 0.6px; cursor: pointer; margin-bottom: 8px;
  }
  .btn-primary:active { transform: scale(0.97); }
  .btn-secondary {
    width: 100%; padding: 10px 14px; border-radius: 10px;
    background: transparent; color: var(--text);
    border: 1px solid var(--secondary); font-size: 13px;
    font-weight: 700; cursor: pointer; margin-bottom: 6px;
  }
  .btn-secondary:active { background: rgba(255,255,255,0.08); }
  .brand-tag {
    margin-top: 10px; font-size: 11px; opacity: 0.76; letter-spacing: 0.4px; line-height: 1.5;
  }
  .brand-tag b { color: var(--primary); }
  .brand-tag span { color: var(--accent); font-weight: 700; }
  .footer-brand {
    text-align: center; padding: 5px 10px; font-size: 11px;
    background: var(--panel); border-top: 1px solid rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.72); flex-shrink: 0; letter-spacing: 0.4px;
  }
  .footer-brand b { color: var(--primary); }
  .footer-brand span { color: var(--accent); font-weight: 700; }
  .toast {
    position: fixed; bottom: 44px; left: 50%; transform: translateX(-50%);
    background: var(--accent); color: #000; padding: 8px 16px;
    border-radius: 999px; font-size: 12px; font-weight: 800;
    z-index: 40; opacity: 0; pointer-events: none; transition: opacity 0.25s;
  }
  .toast.show { opacity: 1; }

  /* Hangman Styles */
  .hm-svg { width: 150px; height: 145px; stroke: var(--primary); stroke-width: 3.5; fill: none; stroke-linecap: round; }
  .hm-part { opacity: 0.12; transition: opacity 0.25s, stroke 0.25s; }
  .hm-part.shown { opacity: 1; stroke: var(--secondary); }
  .hm-hint {
    font-size: 12px; padding: 5px 12px; border-radius: 999px;
    background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.14);
  }
  .hm-word { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin: 4px 0; }
  .hm-slot {
    width: 28px; height: 34px; border-bottom: 3px solid var(--primary);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; font-weight: 900; color: var(--text);
  }
  .hm-keys {
    display: grid; grid-template-columns: repeat(7, 1fr);
    gap: 5px; width: 100%; max-width: 380px;
  }
  .hm-key {
    padding: 9px 0; border-radius: 8px; border: 1px solid rgba(255,255,255,0.16);
    background: var(--panel); color: var(--text); font-weight: 800;
    font-size: 14px; cursor: pointer;
  }
  .hm-key.ok { background: var(--accent); color: #000; border-color: var(--accent); }
  .hm-key.bad { background: rgba(255,0,127,0.22); color: rgba(255,255,255,0.4); border-color: var(--secondary); }

  /* Whack Styles */
  .whack-meta { display: flex; gap: 14px; font-size: 14px; font-weight: 800; }
  .whack-grid {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 12px; width: 100%; max-width: 340px;
  }
  .hole {
    aspect-ratio: 1; border-radius: 16px; background: var(--panel);
    border: 2px solid rgba(255,255,255,0.12); display: flex;
    flex-direction: column; align-items: center; justify-content: center;
    font-size: 40px; cursor: pointer; position: relative;
    transition: transform 0.08s, border-color 0.12s;
  }
  .hole.active { border-color: var(--primary); box-shadow: 0 0 16px rgba(0,245,255,0.25); }
  .hole.bomb { border-color: var(--secondary); }
  .hole.star { border-color: var(--accent); }
  .hole:active { transform: scale(0.92); }
  .hole-label { font-size: 10px; font-weight: 700; opacity: 0.85; margin-top: 2px; max-width: 90%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  /* Memory Styles */
  .mem-grid {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 8px; width: 100%; max-width: 360px;
  }
  .mcard {
    aspect-ratio: 1; border-radius: 12px; background: var(--panel);
    border: 2px solid var(--primary); display: flex; align-items: center;
    justify-content: center; font-size: 28px; cursor: pointer;
    transition: transform 0.18s, background 0.18s, border-color 0.18s;
  }
  .mcard.closed { background: linear-gradient(135deg, var(--panel), rgba(255,255,255,0.06)); font-size: 18px; color: var(--primary); }
  .mcard.matched { border-color: var(--accent); background: rgba(57,255,20,0.14); transform: scale(0.95); }
</style>
</head>
<body>

<div class="hud">
  <div class="hud-left">
    <div class="hud-title" id="hudTitle">${escHtml(cfg.title)}</div>
    <div class="hud-sub" id="hudSub">${escHtml(cfg.hero)} vs ${escHtml(cfg.enemy)} • ${escHtml(cfg.diffObj.label)}</div>
  </div>
  <div class="hud-stats">
    <div class="pill" id="extraPill" style="display:none"></div>
    <div class="pill">SCORE <span id="scoreVal">0</span></div>
    <div class="pill">BEST <span id="bestVal">0</span></div>
  </div>
  <div class="hud-btns">
    <button class="icon-btn" id="soundBtn" title="Sound">🔊</button>
    <button class="icon-btn" id="restartBtn" title="Restart">↻</button>
  </div>
</div>

<div class="target-bar" id="targetBar"></div>

<div class="stage-wrap" id="stageWrap">
  <canvas id="gameCanvas"></canvas>
  <div id="domStage"></div>

  <div class="dpad" id="snakeDpad">
    <button data-dir="U">▲</button>
    <div class="dpad-row">
      <button data-dir="L">◀</button>
      <button data-dir="D">▼</button>
      <button data-dir="R">▶</button>
    </div>
  </div>

  <div class="overlay" id="overlay">
    <div class="card">
      <div class="badge" id="ovBadge">${escHtml(BRAND.name)} • ${escHtml(cfg.diffObj.label)}</div>
      <h1 id="ovTitle">${escHtml(cfg.title)}</h1>
      <div class="versus" id="ovVersus">${escHtml(cfg.hero_icon)} <b>${escHtml(cfg.hero)}</b> &nbsp;VS&nbsp; ${escHtml(cfg.enemy_icon)} <b>${escHtml(cfg.enemy)}</b></div>
      <div class="score-big" id="ovScore" style="display:none">0</div>
      <div class="roast-box" id="ovRoast"></div>
      <div class="controls-hint" id="ovHint">${escHtml(cfg.gameMeta.controls)}</div>
      <button class="btn-primary" id="playBtn">▶ PLAY NOW</button>
      <button class="btn-secondary" id="challengeBtn" style="display:none">🎯 CHALLENGE FRIEND</button>
      <div class="brand-tag">
        Powered by <b>${escHtml(BRAND.name)}</b><br>
        Dev: <b>${escHtml(BRAND.developer)}</b> • Owner: <span>${escHtml(BRAND.owner)}</span>
      </div>
    </div>
  </div>
</div>

<div class="footer-brand">⚡ <b>${escHtml(BRAND.name)}</b> • Dev: <b>${escHtml(BRAND.developer)}</b> | Owner: <span>${escHtml(BRAND.owner)}</span></div>
<div class="toast" id="toast"></div>

<script>
(function() {
  var CFG = ${cfgJson};
  var WORD_BANK = ${bankJson};
  var TH = CFG.themeObj;
  var DF = CFG.diffObj;

  var canvas = document.getElementById("gameCanvas");
  var ctx = canvas.getContext("2d");
  var domStage = document.getElementById("domStage");
  var stageWrap = document.getElementById("stageWrap");
  var overlay = document.getElementById("overlay");
  var scoreEl = document.getElementById("scoreVal");
  var bestEl = document.getElementById("bestVal");
  var extraPill = document.getElementById("extraPill");
  var targetBar = document.getElementById("targetBar");
  var soundBtn = document.getElementById("soundBtn");
  var restartBtn = document.getElementById("restartBtn");
  var playBtn = document.getElementById("playBtn");
  var challengeBtn = document.getElementById("challengeBtn");
  var ovTitle = document.getElementById("ovTitle");
  var ovScore = document.getElementById("ovScore");
  var ovRoast = document.getElementById("ovRoast");
  var ovHint = document.getElementById("ovHint");
  var snakeDpad = document.getElementById("snakeDpad");
  var toastEl = document.getElementById("toast");

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  var state = {
    running: false,
    score: 0,
    best: 0,
    muted: false,
    rafId: null,
    timers: [],
    targetBeaten: false,
    W: 360,
    H: 520,
    lastTime: 0,
    shake: 0,
    particles: []
  };

  var bestKey = "empire_best_" + CFG.type;
  try {
    state.best = parseInt(localStorage.getItem(bestKey) || "0", 10) || 0;
  } catch (e) { state.best = 0; }
  bestEl.textContent = state.best;

  if (CFG.target > 0) {
    targetBar.style.display = "block";
    targetBar.textContent = "🎯 TARGET: BEAT " + CFG.challenger.toUpperCase() + " (" + CFG.target + ")";
  }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    setTimeout(function() { toastEl.classList.remove("show"); }, 2200);
  }

  // ---- Pure Web Audio 8-Bit Synth ----
  var audioCtx = null;
  function getAudio() {
    if (state.muted) return null;
    try {
      if (!audioCtx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (AC) audioCtx = new AC();
      }
      if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
      return audioCtx;
    } catch (e) { return null; }
  }
  function beep(freq, dur, type, vol, slide) {
    var ac = getAudio();
    if (!ac) return;
    try {
      var o = ac.createOscillator();
      var g = ac.createGain();
      o.type = type || "square";
      o.frequency.setValueAtTime(freq, ac.currentTime);
      if (slide) o.frequency.exponentialRampToValueAtTime(slide, ac.currentTime + dur);
      g.gain.setValueAtTime(vol || 0.08, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
      o.connect(g); g.connect(ac.destination);
      o.start(); o.stop(ac.currentTime + dur);
    } catch (e) {}
  }
  var SFX = {
    shoot: function() { beep(720, 0.07, "square", 0.05, 260); },
    jump:  function() { beep(320, 0.11, "triangle", 0.08, 640); },
    score: function() { beep(560, 0.08, "sine", 0.08, 880); },
    hit:   function() { beep(160, 0.16, "sawtooth", 0.1, 55); },
    over:  function() { beep(240, 0.28, "sawtooth", 0.1, 70); },
    win:   function() {
      beep(523, 0.1, "triangle", 0.09);
      setTimeout(function(){ beep(659, 0.1, "triangle", 0.09); }, 100);
      setTimeout(function(){ beep(784, 0.18, "triangle", 0.1); }, 200);
    },
    click: function() { beep(440, 0.04, "sine", 0.05); }
  };

  soundBtn.addEventListener("click", function() {
    state.muted = !state.muted;
    soundBtn.textContent = state.muted ? "🔇" : "🔊";
  });

  function setScore(val) {
    state.score = Math.max(0, Math.floor(val));
    scoreEl.textContent = state.score;
    if (state.score > state.best) {
      state.best = state.score;
      bestEl.textContent = state.best;
      try { localStorage.setItem(bestKey, String(state.best)); } catch (e) {}
    }
    if (CFG.target > 0 && !state.targetBeaten && state.score > CFG.target) {
      state.targetBeaten = true;
      targetBar.classList.add("beaten");
      targetBar.textContent = "🏆 TARGET BEATEN! YOU CRUSHED " + CFG.challenger.toUpperCase() + " (" + CFG.target + ")";
      SFX.win();
      showToast("🏆 Challenge Beaten!");
    }
  }

  function addScore(delta) { setScore(state.score + delta); }

  function setExtra(html) {
    if (!html) { extraPill.style.display = "none"; return; }
    extraPill.style.display = "flex";
    extraPill.innerHTML = html;
  }

  function clearRuntime() {
    state.running = false;
    if (state.rafId) { cancelAnimationFrame(state.rafId); state.rafId = null; }
    while (state.timers.length) { clearInterval(state.timers.pop()); }
    state.particles = [];
    state.shake = 0;
    window.onkeydown = null;
    window.onkeyup = null;
    canvas.onpointerdown = null;
    canvas.ontouchstart = null;
    canvas.ontouchmove = null;
    canvas.ontouchend = null;
    canvas.onmousemove = null;
  }

  function resizeCanvas() {
    var r = stageWrap.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.W = Math.max(280, Math.floor(r.width));
    state.H = Math.max(320, Math.floor(r.height));
    canvas.width = Math.floor(state.W * dpr);
    canvas.height = Math.floor(state.H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resizeCanvas);

  function spawnParticles(x, y, color, count) {
    for (var i = 0; i < (count || 12); i++) {
      var ang = Math.random() * Math.PI * 2;
      var spd = 60 + Math.random() * 190;
      state.particles.push({
        x: x, y: y,
        vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
        life: 0.45 + Math.random() * 0.25,
        maxLife: 0.7,
        color: color || TH.primary,
        size: 2.5 + Math.random() * 3
      });
    }
  }

  function updateDrawParticles(dt) {
    for (var i = state.particles.length - 1; i >= 0; i--) {
      var p = state.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) { state.particles.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  function endGame(isVictory, customMsg) {
    clearRuntime();
    if (isVictory) SFX.win(); else SFX.over();
    ovTitle.textContent = isVictory ? "🏆 VICTORY!" : "💀 GAME OVER";
    ovScore.style.display = "block";
    ovScore.textContent = state.score;
    ovRoast.style.display = "block";
    if (customMsg) {
      ovRoast.textContent = customMsg;
    } else if (state.targetBeaten) {
      ovRoast.textContent = "🔥 You beat " + CFG.challenger + "'s score of " + CFG.target + "!";
    } else if (isVictory) {
      ovRoast.textContent = "⚡ Unstoppable! " + CFG.hero + " dominated " + CFG.enemy + "!";
    } else {
      ovRoast.textContent = CFG.roast;
    }
    ovHint.textContent = "Best Score: " + state.best + " • Try again or challenge a friend!";
    playBtn.textContent = "↻ PLAY AGAIN";
    challengeBtn.style.display = "block";
    overlay.classList.remove("hidden");
  }

  challengeBtn.addEventListener("click", function() {
    var text = "🎮 I scored " + state.score + " in " + CFG.title + "! Can you beat me?";
    var url = "";
    if (window.location.protocol === "http:" || window.location.protocol === "https:") {
      var u = new URL(window.location.href);
      u.searchParams.set("target", String(state.score));
      u.searchParams.set("challenger", CFG.hero);
      u.searchParams.set("mode", "play");
      url = u.toString();
    }
    var sharePayload = url ? (text + " " + url) : (text + " (Powered by Empire Tech Zone)");
    if (navigator.share && url) {
      navigator.share({ title: CFG.title, text: text, url: url }).catch(function(){});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(sharePayload).then(function() {
        showToast("🎯 Challenge Link Copied!");
      }).catch(function() { showToast("Score: " + state.score); });
    } else {
      showToast("🎯 Score to beat: " + state.score);
    }
  });

  // =========================================================================
  // GAME 1: NEON SPACE SHOOTER
  // =========================================================================
  function startShooter() {
    canvas.style.display = "block";
    domStage.style.display = "none";
    snakeDpad.style.display = "none";
    resizeCanvas();

    var px = state.W / 2;
    var py = state.H - 64;
    var hp = 3;
    var invuln = 0;
    var bullets = [];
    var enemies = [];
    var stars = [];
    var shootTimer = 0;
    var spawnTimer = 0;
    var kills = 0;
    var keys = {};
    var pointerX = null;

    for (var s = 0; s < 45; s++) {
      stars.push({ x: Math.random() * state.W, y: Math.random() * state.H, sp: 25 + Math.random() * 75, sz: 1 + Math.random() * 2 });
    }

    function updateHpUI() {
      var h = "";
      for (var i = 0; i < hp; i++) h += "❤️";
      setExtra(h || "💀");
    }
    updateHpUI();

    function onKeyDown(e) { keys[e.key] = true; }
    function onKeyUp(e) { keys[e.key] = false; }
    function onMove(e) {
      var r = canvas.getBoundingClientRect();
      var cx = e.touches ? e.touches[0].clientX : e.clientX;
      pointerX = cx - r.left;
    }
    function onEnd() { pointerX = null; }

    window.onkeydown = onKeyDown;
    window.onkeyup = onKeyUp;
    canvas.ontouchstart = onMove;
    canvas.ontouchmove = onMove;
    canvas.ontouchend = onEnd;
    canvas.onmousemove = function(e) { if (e.buttons) onMove(e); };

    state.running = true;
    state.lastTime = performance.now();

    function loop(now) {
      if (!state.running) return;
      var dt = Math.min(0.05, (now - state.lastTime) / 1000);
      state.lastTime = now;

      if (keys.ArrowLeft || keys.a || keys.A) px -= 340 * dt;
      if (keys.ArrowRight || keys.d || keys.D) px += 340 * dt;
      if (pointerX !== null) px += (pointerX - px) * Math.min(1, dt * 16);
      px = Math.max(24, Math.min(state.W - 24, px));
      py = state.H - 64;

      if (invuln > 0) invuln -= dt;
      if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 28);

      shootTimer -= dt;
      if (shootTimer <= 0) {
        bullets.push({ x: px, y: py - 24, vy: -560 });
        SFX.shoot();
        shootTimer = Math.max(0.13, 0.22 / Math.sqrt(DF.speed));
      }

      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        var isBoss = (kills > 0 && kills % 12 === 0 && enemies.every(function(en){ return !en.boss; }));
        var rad = isBoss ? 30 : 19;
        enemies.push({
          x: rad + Math.random() * (state.W - rad * 2),
          y: -rad - 10,
          vy: (isBoss ? 75 : (115 + Math.random() * 85)) * DF.speed * (1 + state.score / 1500),
          rad: rad,
          hp: isBoss ? 5 : 1,
          maxHp: isBoss ? 5 : 1,
          boss: isBoss
        });
        spawnTimer = Math.max(0.26, (0.85 * DF.spawn) - Math.min(0.38, state.score / 2200));
      }

      for (var i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y += bullets[i].vy * dt;
        if (bullets[i].y < -20) bullets.splice(i, 1);
      }

      for (var j = enemies.length - 1; j >= 0; j--) {
        var en = enemies[j];
        en.y += en.vy * dt;

        var dead = false;
        for (var b = bullets.length - 1; b >= 0; b--) {
          var bl = bullets[b];
          var dx = bl.x - en.x, dy = bl.y - en.y;
          if (dx * dx + dy * dy < (en.rad + 8) * (en.rad + 8)) {
            bullets.splice(b, 1);
            en.hp--;
            spawnParticles(bl.x, bl.y, TH.primary, 5);
            if (en.hp <= 0) {
              dead = true;
              kills++;
              addScore(en.boss ? 50 : 10);
              SFX.score();
              spawnParticles(en.x, en.y, en.boss ? TH.accent : TH.secondary, en.boss ? 24 : 12);
              break;
            }
          }
        }
        if (dead) { enemies.splice(j, 1); continue; }

        var pdx = px - en.x, pdy = py - en.y;
        var hitPlayer = (pdx * pdx + pdy * pdy) < (en.rad + 18) * (en.rad + 18);
        if (hitPlayer || en.y > state.H + en.rad) {
          enemies.splice(j, 1);
          if (invuln <= 0 || en.y > state.H) {
            hp--;
            invuln = 1.0;
            state.shake = 10;
            SFX.hit();
            spawnParticles(px, py, TH.secondary, 16);
            updateHpUI();
            if (hp <= 0) { endGame(false); return; }
          }
        }
      }

      ctx.save();
      if (state.shake > 0) ctx.translate((Math.random() - 0.5) * state.shake, (Math.random() - 0.5) * state.shake);
      ctx.fillStyle = TH.bg;
      ctx.fillRect(0, 0, state.W, state.H);

      ctx.fillStyle = "rgba(255,255,255,0.35)";
      for (var st = 0; st < stars.length; st++) {
        stars[st].y += stars[st].sp * dt;
        if (stars[st].y > state.H) { stars[st].y = 0; stars[st].x = Math.random() * state.W; }
        ctx.fillRect(stars[st].x, stars[st].y, stars[st].sz, stars[st].sz);
      }

      ctx.fillStyle = TH.primary;
      ctx.shadowColor = TH.primary;
      ctx.shadowBlur = 10;
      for (var k = 0; k < bullets.length; k++) {
        ctx.fillRect(bullets[k].x - 2.5, bullets[k].y - 12, 5, 18);
      }
      ctx.shadowBlur = 0;

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (var m = 0; m < enemies.length; m++) {
        var e2 = enemies[m];
        ctx.beginPath();
        ctx.arc(e2.x, e2.y, e2.rad, 0, Math.PI * 2);
        ctx.fillStyle = e2.boss ? "rgba(255,0,127,0.28)" : "rgba(255,255,255,0.08)";
        ctx.fill();
        ctx.lineWidth = e2.boss ? 3 : 1.5;
        ctx.strokeStyle = e2.boss ? TH.accent : TH.secondary;
        ctx.stroke();

        ctx.font = (e2.boss ? "30px" : "22px") + " sans-serif";
        ctx.fillText(CFG.enemy_icon, e2.x, e2.y + 1);
        if (e2.boss) {
          ctx.fillStyle = TH.accent;
          ctx.font = "bold 10px sans-serif";
          ctx.fillText(CFG.enemy.toUpperCase(), e2.x, e2.y - e2.rad - 10);
          ctx.fillStyle = "rgba(255,255,255,0.2)";
          ctx.fillRect(e2.x - 24, e2.y + e2.rad + 5, 48, 5);
          ctx.fillStyle = TH.secondary;
          ctx.fillRect(e2.x - 24, e2.y + e2.rad + 5, 48 * (e2.hp / e2.maxHp), 5);
        }
      }

      if (invuln <= 0 || Math.floor(now / 80) % 2 === 0) {
        ctx.beginPath();
        ctx.arc(px, py, 22, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,245,255,0.16)";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = TH.primary;
        ctx.stroke();
        ctx.font = "24px sans-serif";
        ctx.fillText(CFG.hero_icon, px, py + 1);
        ctx.fillStyle = TH.primary;
        ctx.font = "bold 10px sans-serif";
        ctx.fillText(CFG.hero, px, py + 32);
      }

      updateDrawParticles(dt);
      ctx.restore();
      state.rafId = requestAnimationFrame(loop);
    }
    state.rafId = requestAnimationFrame(loop);
  }

  // =========================================================================
  // GAME 2: CYBER FLAPPY DODGE
  // =========================================================================
  function startFlappy() {
    canvas.style.display = "block";
    domStage.style.display = "none";
    snakeDpad.style.display = "none";
    setExtra("");
    resizeCanvas();

    var bx = Math.min(110, state.W * 0.28);
    var by = state.H * 0.45;
    var vy = 0;
    var gravity = 1150 * Math.sqrt(DF.speed);
    var flapVel = -390;
    var pipes = [];
    var pipeTimer = 0.6;
    var gapH = Math.max(125, Math.min(168, state.H * 0.29) / Math.pow(DF.speed, 0.35));
    var pipeW = 58;

    function flap() {
      if (!state.running) return;
      vy = flapVel;
      SFX.jump();
      spawnParticles(bx - 12, by + 6, TH.primary, 5);
    }
    canvas.onpointerdown = function(e) { e.preventDefault(); flap(); };
    window.onkeydown = function(e) {
      if (e.code === "Space" || e.key === "ArrowUp") { e.preventDefault(); flap(); }
    };

    state.running = true;
    state.lastTime = performance.now();

    function loop(now) {
      if (!state.running) return;
      var dt = Math.min(0.05, (now - state.lastTime) / 1000);
      state.lastTime = now;

      vy += gravity * dt;
      by += vy * dt;

      pipeTimer -= dt;
      if (pipeTimer <= 0) {
        var minTop = 55;
        var maxTop = Math.max(minTop + 20, state.H - gapH - 65);
        var topH = minTop + Math.random() * (maxTop - minTop);
        pipes.push({ x: state.W + 20, topH: topH, passed: false });
        pipeTimer = Math.max(1.05, 1.65 * DF.spawn);
      }

      var pipeSpeed = (165 + Math.min(90, state.score * 2)) * DF.speed;
      for (var i = pipes.length - 1; i >= 0; i--) {
        var p = pipes[i];
        p.x -= pipeSpeed * dt;
        if (!p.passed && p.x + pipeW < bx) {
          p.passed = true;
          addScore(1);
          SFX.score();
        }
        if (bx + 14 > p.x && bx - 14 < p.x + pipeW) {
          if (by - 14 < p.topH || by + 14 > p.topH + gapH) {
            spawnParticles(bx, by, TH.secondary, 18);
            endGame(false);
            return;
          }
        }
        if (p.x + pipeW < -20) pipes.splice(i, 1);
      }

      if (by < 14 || by > state.H - 14) {
        endGame(false);
        return;
      }

      ctx.fillStyle = TH.bg;
      ctx.fillRect(0, 0, state.W, state.H);

      ctx.strokeStyle = "rgba(255,255,255,0.04)";
      ctx.lineWidth = 1;
      for (var gx = 0; gx < state.W; gx += 40) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, state.H); ctx.stroke();
      }

      for (var j = 0; j < pipes.length; j++) {
        var pp = pipes[j];
        var botY = pp.topH + gapH;
        ctx.fillStyle = TH.panel;
        ctx.strokeStyle = TH.secondary;
        ctx.lineWidth = 2;
        ctx.fillRect(pp.x, 0, pipeW, pp.topH);
        ctx.strokeRect(pp.x, 0, pipeW, pp.topH);
        ctx.fillRect(pp.x, botY, pipeW, state.H - botY);
        ctx.strokeRect(pp.x, botY, pipeW, state.H - botY);

        ctx.save();
        ctx.fillStyle = TH.secondary;
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(CFG.enemy.slice(0, 8), pp.x + pipeW / 2, botY + 20);
        ctx.restore();
      }

      ctx.beginPath();
      ctx.arc(bx, by, 18, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,245,255,0.2)";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = TH.primary;
      ctx.stroke();
      ctx.font = "22px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(CFG.hero_icon, bx, by + 1);

      updateDrawParticles(dt);
      state.rafId = requestAnimationFrame(loop);
    }
    state.rafId = requestAnimationFrame(loop);
  }

  // =========================================================================
  // GAME 3: METEOR SURVIVAL DODGE
  // =========================================================================
  function startDodge() {
    canvas.style.display = "block";
    domStage.style.display = "none";
    snakeDpad.style.display = "none";
    setExtra("⭐ +5");
    resizeCanvas();

    var px = state.W / 2, py = state.H * 0.72;
    var tx = px, ty = py;
    var hazards = [];
    var coins = [];
    var spawnT = 0;
    var coinT = 1.6;
    var timeAcc = 0;
    var keys = {};

    window.onkeydown = function(e) { keys[e.key] = true; };
    window.onkeyup = function(e) { keys[e.key] = false; };
    function setPos(e, isTouch) {
      var r = canvas.getBoundingClientRect();
      var cx = isTouch ? e.touches[0].clientX : e.clientX;
      var cy = isTouch ? e.touches[0].clientY : e.clientY;
      tx = cx - r.left;
      ty = (cy - r.top) - (isTouch ? 34 : 0);
    }
    canvas.ontouchstart = function(e) { e.preventDefault(); setPos(e, true); };
    canvas.ontouchmove = function(e) { e.preventDefault(); setPos(e, true); };
    canvas.onmousemove = function(e) { if (e.buttons) setPos(e, false); };

    state.running = true;
    state.lastTime = performance.now();

    function loop(now) {
      if (!state.running) return;
      var dt = Math.min(0.05, (now - state.lastTime) / 1000);
      state.lastTime = now;

      if (keys.ArrowLeft || keys.a) tx -= 360 * dt;
      if (keys.ArrowRight || keys.d) tx += 360 * dt;
      if (keys.ArrowUp || keys.w) ty -= 360 * dt;
      if (keys.ArrowDown || keys.s) ty += 360 * dt;

      tx = Math.max(22, Math.min(state.W - 22, tx));
      ty = Math.max(22, Math.min(state.H - 22, ty));
      px += (tx - px) * Math.min(1, dt * 15);
      py += (ty - py) * Math.min(1, dt * 15);

      timeAcc += dt;
      if (timeAcc >= 0.4) { timeAcc = 0; addScore(1); }

      spawnT -= dt;
      if (spawnT <= 0) {
        var r = 14 + Math.random() * 10;
        var angleDrift = (DF.speed > 1.1 ? (Math.random() - 0.5) * 110 : (Math.random() - 0.5) * 45);
        hazards.push({
          x: r + Math.random() * (state.W - r * 2),
          y: -r - 8,
          vx: angleDrift,
          vy: (160 + Math.random() * 140) * DF.speed * (1 + state.score / 400),
          r: r
        });
        spawnT = Math.max(0.16, 0.52 * DF.spawn - Math.min(0.24, state.score / 600));
      }

      coinT -= dt;
      if (coinT <= 0) {
        coins.push({ x: 26 + Math.random() * (state.W - 52), y: -16, vy: 120 * DF.speed });
        coinT = 2.4;
      }

      for (var c = coins.length - 1; c >= 0; c--) {
        var cn = coins[c];
        cn.y += cn.vy * dt;
        var cdx = px - cn.x, cdy = py - cn.y;
        if (cdx * cdx + cdy * cdy < 32 * 32) {
          coins.splice(c, 1);
          addScore(5);
          SFX.score();
          spawnParticles(cn.x, cn.y, TH.accent, 10);
          continue;
        }
        if (cn.y > state.H + 20) coins.splice(c, 1);
      }

      for (var i = hazards.length - 1; i >= 0; i--) {
        var hz = hazards[i];
        hz.x += hz.vx * dt;
        hz.y += hz.vy * dt;
        var dx = px - hz.x, dy = py - hz.y;
        var hitDist = (hz.r + 16) * 0.78;
        if (dx * dx + dy * dy < hitDist * hitDist) {
          spawnParticles(px, py, TH.secondary, 22);
          endGame(false);
          return;
        }
        if (hz.y > state.H + 30) hazards.splice(i, 1);
      }

      ctx.fillStyle = TH.bg;
      ctx.fillRect(0, 0, state.W, state.H);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (var c2 = 0; c2 < coins.length; c2++) {
        ctx.font = "22px sans-serif";
        ctx.fillText("⭐", coins[c2].x, coins[c2].y);
      }

      for (var h2 = 0; h2 < hazards.length; h2++) {
        var hz2 = hazards[h2];
        ctx.beginPath();
        ctx.arc(hz2.x, hz2.y, hz2.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,0,127,0.16)";
        ctx.fill();
        ctx.strokeStyle = TH.secondary;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.font = Math.floor(hz2.r * 1.15) + "px sans-serif";
        ctx.fillText(CFG.enemy_icon, hz2.x, hz2.y + 1);
      }

      ctx.beginPath();
      ctx.arc(px, py, 20, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,245,255,0.2)";
      ctx.fill();
      ctx.strokeStyle = TH.primary;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.font = "22px sans-serif";
      ctx.fillText(CFG.hero_icon, px, py + 1);

      updateDrawParticles(dt);
      state.rafId = requestAnimationFrame(loop);
    }
    state.rafId = requestAnimationFrame(loop);
  }

  // =========================================================================
  // GAME 4: SECRET WORD HANGMAN (ANTI-CHEAT)
  // =========================================================================
  function startHangman() {
    canvas.style.display = "none";
    domStage.style.display = "flex";
    snakeDpad.style.display = "none";

    var secretWord = "";
    var hintText = "";
    var isCustomWord = false;

    function decodeClientWord(b64) {
      try { return atob(b64).toUpperCase().replace(/[^A-Z]/g, ""); } catch (e) { return ""; }
    }

    function pickWord() {
      if (CFG.word_token) {
        var dec = decodeClientWord(CFG.word_token);
        if (dec.length >= 2) {
          secretWord = dec;
          hintText = CFG.hint || ("Secret challenge by " + CFG.challenger);
          isCustomWord = true;
          return;
        }
      }
      var pool = [];
      if (WORD_BANK[CFG.category]) {
        pool = WORD_BANK[CFG.category];
      } else {
        Object.keys(WORD_BANK).forEach(function(k) { pool = pool.concat(WORD_BANK[k]); });
      }
      var item = pool[Math.floor(Math.random() * pool.length)];
      secretWord = item.w;
      hintText = "Hint: " + item.h;
      isCustomWord = false;
    }

    var guessed = {};
    var wrong = 0;
    var maxWrong = 6;
    state.running = true;

    function renderHangman() {
      setExtra("❤️ " + (maxWrong - wrong));
      var parts = [
        '<circle class="hm-part ' + (wrong >= 1 ? "shown" : "") + '" cx="105" cy="45" r="14"/>',
        '<line class="hm-part ' + (wrong >= 2 ? "shown" : "") + '" x1="105" y1="59" x2="105" y2="100"/>',
        '<line class="hm-part ' + (wrong >= 3 ? "shown" : "") + '" x1="105" y1="68" x2="85" y2="88"/>',
        '<line class="hm-part ' + (wrong >= 4 ? "shown" : "") + '" x1="105" y1="68" x2="125" y2="88"/>',
        '<line class="hm-part ' + (wrong >= 5 ? "shown" : "") + '" x1="105" y1="100" x2="88" y2="128"/>',
        '<line class="hm-part ' + (wrong >= 6 ? "shown" : "") + '" x1="105" y1="100" x2="122" y2="128"/>'
      ].join("");

      var slots = "";
      var solved = true;
      for (var i = 0; i < secretWord.length; i++) {
        var ch = secretWord[i];
        var show = !!guessed[ch];
        if (!show) solved = false;
        slots += '<div class="hm-slot">' + (show ? ch : "") + '</div>';
      }

      var keysHtml = "";
      var abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      for (var k = 0; k < abc.length; k++) {
        var l = abc[k];
        var cls = "hm-key";
        var dis = "";
        if (guessed[l]) {
          cls += (secretWord.indexOf(l) >= 0 ? " ok" : " bad");
          dis = " disabled";
        }
        keysHtml += '<button class="' + cls + '" data-l="' + l + '"' + dis + '>' + l + '</button>';
      }

      domStage.innerHTML =
        '<svg class="hm-svg" viewBox="0 0 160 150">' +
        '<line x1="20" y1="140" x2="80" y2="140"/><line x1="45" y1="140" x2="45" y2="15"/>' +
        '<line x1="45" y1="15" x2="105" y2="15"/><line x1="105" y1="15" x2="105" y2="31"/>' +
        parts + '</svg>' +
        '<div class="hm-hint">💡 ' + esc(hintText) + '</div>' +
        '<div class="hm-word">' + slots + '</div>' +
        '<div class="hm-keys">' + keysHtml + '</div>';

      var btns = domStage.querySelectorAll(".hm-key");
      btns.forEach(function(b) {
        b.onclick = function() { guessLetter(b.getAttribute("data-l")); };
      });

      if (solved) {
        var bonus = 40 + (maxWrong - wrong) * 10;
        addScore(bonus);
        SFX.win();
        if (isCustomWord) {
          setTimeout(function() { endGame(true, "🎉 You cracked the secret word: " + secretWord + "!"); }, 350);
        } else {
          showToast("✅ Solved " + secretWord + "! +" + bonus);
          setTimeout(function() {
            if (!state.running) return;
            guessed = {};
            wrong = 0;
            pickWord();
            renderHangman();
          }, 750);
        }
      } else if (wrong >= maxWrong) {
        setTimeout(function() { endGame(false, "💀 Word was: " + secretWord + " — " + CFG.roast); }, 300);
      }
    }

    function guessLetter(l) {
      if (!state.running || !l || guessed[l]) return;
      guessed[l] = true;
      if (secretWord.indexOf(l) >= 0) {
        addScore(10);
        SFX.score();
      } else {
        wrong++;
        SFX.hit();
      }
      renderHangman();
    }

    window.onkeydown = function(e) {
      if (!state.running) return;
      var k = String(e.key || "").toUpperCase();
      if (k.length === 1 && k >= "A" && k <= "Z") guessLetter(k);
    };

    pickWord();
    renderHangman();
  }

  // =========================================================================
  // GAME 5: WHACK-A-VILLAIN
  // =========================================================================
  function startWhack() {
    canvas.style.display = "none";
    domStage.style.display = "flex";
    snakeDpad.style.display = "none";

    var timeLeft = 30;
    var activeIdx = -1;
    var activeKind = "";
    state.running = true;

    domStage.innerHTML =
      '<div class="whack-meta"><span>🎯 Tap ' + esc(CFG.enemy_icon) + ' (+10)</span><span>⭐ (+25)</span><span>💣 (-15)</span></div>' +
      '<div class="whack-grid" id="whackGrid"></div>';

    var grid = document.getElementById("whackGrid");
    var holes = [];
    for (var i = 0; i < 9; i++) {
      var d = document.createElement("div");
      d.className = "hole";
      d.setAttribute("data-i", String(i));
      d.onpointerdown = function(e) {
        e.preventDefault();
        if (!state.running) return;
        var idx = parseInt(this.getAttribute("data-i"), 10);
        if (idx !== activeIdx) return;
        if (activeKind === "enemy") {
          addScore(10); SFX.score();
        } else if (activeKind === "star") {
          addScore(25); SFX.win();
        } else if (activeKind === "bomb") {
          addScore(-15); SFX.hit(); showToast("💥 Boom! -15");
        }
        clearHole();
      };
      grid.appendChild(d);
      holes.push(d);
    }

    function clearHole() {
      if (activeIdx >= 0 && holes[activeIdx]) {
        holes[activeIdx].className = "hole";
        holes[activeIdx].innerHTML = "";
      }
      activeIdx = -1;
      activeKind = "";
    }

    function popRandom() {
      if (!state.running) return;
      clearHole();
      var idx = Math.floor(Math.random() * 9);
      var roll = Math.random();
      activeIdx = idx;
      if (roll < 0.14) {
        activeKind = "star";
        holes[idx].className = "hole active star";
        holes[idx].innerHTML = '⭐<div class="hole-label">BONUS</div>';
      } else if (roll < 0.30) {
        activeKind = "bomb";
        holes[idx].className = "hole active bomb";
        holes[idx].innerHTML = '💣<div class="hole-label">AVOID!</div>';
      } else {
        activeKind = "enemy";
        holes[idx].className = "hole active";
        holes[idx].innerHTML = esc(CFG.enemy_icon) + '<div class="hole-label">' + esc(CFG.enemy) + '</div>';
      }
    }

    setExtra("⏱️ " + timeLeft + "s");
    popRandom();

    var popMs = Math.max(380, Math.floor(820 / DF.speed));
    state.timers.push(setInterval(popRandom, popMs));
    state.timers.push(setInterval(function() {
      timeLeft--;
      setExtra("⏱️ " + timeLeft + "s");
      if (timeLeft <= 0) endGame(state.score >= 100);
    }, 1000));
  }

  // =========================================================================
  // GAME 6: NEON TOWER STACK
  // =========================================================================
  function startStack() {
    canvas.style.display = "block";
    domStage.style.display = "none";
    snakeDpad.style.display = "none";
    setExtra("COMBO x1");
    resizeCanvas();

    var blockH = 28;
    var baseW = Math.min(200, state.W * 0.56);
    var blocks = [{ x: (state.W - baseW) / 2, y: state.H - 70, w: baseW, hue: 185 }];
    var falling = [];
    var combo = 0;
    var camY = 0;

    function makeMover() {
      var top = blocks[blocks.length - 1];
      var fromLeft = blocks.length % 2 === 1;
      return {
        x: fromLeft ? 10 : state.W - top.w - 10,
        y: top.y - blockH,
        w: top.w,
        dir: fromLeft ? 1 : -1,
        speed: (175 + Math.min(220, blocks.length * 9)) * DF.speed,
        hue: (185 + blocks.length * 14) % 360
      };
    }

    var mover = makeMover();

    function drop() {
      if (!state.running) return;
      var top = blocks[blocks.length - 1];
      var diff = mover.x - top.x;

      if (Math.abs(diff) <= 7) {
        combo++;
        blocks.push({ x: top.x, y: mover.y, w: top.w, hue: mover.hue });
        addScore(combo >= 3 ? 2 : 1);
        setExtra("🔥 PERFECT x" + combo);
        SFX.win();
        spawnParticles(top.x + top.w / 2, mover.y + camY, TH.accent, 14);
      } else {
        var leftEdge = Math.max(mover.x, top.x);
        var rightEdge = Math.min(mover.x + mover.w, top.x + top.w);
        var overlap = rightEdge - leftEdge;
        if (overlap <= 4) {
          falling.push({ x: mover.x, y: mover.y, w: mover.w, vy: 40, hue: mover.hue });
          endGame(false);
          return;
        }
        combo = 0;
        setExtra("STACK " + blocks.length);
        var cutW = mover.w - overlap;
        var cutX = diff > 0 ? rightEdge : mover.x;
        falling.push({ x: cutX, y: mover.y, w: cutW, vy: 20, hue: mover.hue });
        blocks.push({ x: leftEdge, y: mover.y, w: overlap, hue: mover.hue });
        addScore(1);
        SFX.score();
      }
      mover = makeMover();
    }

    canvas.onpointerdown = function(e) { e.preventDefault(); drop(); };
    window.onkeydown = function(e) { if (e.code === "Space") { e.preventDefault(); drop(); } };

    state.running = true;
    state.lastTime = performance.now();

    function loop(now) {
      if (!state.running) return;
      var dt = Math.min(0.05, (now - state.lastTime) / 1000);
      state.lastTime = now;

      mover.x += mover.dir * mover.speed * dt;
      if (mover.x <= 8) { mover.x = 8; mover.dir = 1; }
      if (mover.x + mover.w >= state.W - 8) { mover.x = state.W - 8 - mover.w; mover.dir = -1; }

      var desiredCam = Math.max(0, (state.H * 0.42) - mover.y);
      camY += (desiredCam - camY) * Math.min(1, dt * 7);

      for (var f = falling.length - 1; f >= 0; f--) {
        falling[f].vy += 900 * dt;
        falling[f].y += falling[f].vy * dt;
        if (falling[f].y + camY > state.H + 80) falling.splice(f, 1);
      }

      ctx.fillStyle = TH.bg;
      ctx.fillRect(0, 0, state.W, state.H);

      for (var i = 0; i < blocks.length; i++) {
        var b = blocks[i];
        var drawY = b.y + camY;
        if (drawY > state.H + 40 || drawY < -40) continue;
        ctx.fillStyle = "hsl(" + b.hue + ", 90%, 55%)";
        ctx.fillRect(b.x, drawY, b.w, blockH - 2);
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.strokeRect(b.x, drawY, b.w, blockH - 2);
      }

      ctx.fillStyle = TH.primary;
      ctx.fillRect(mover.x, mover.y + camY, mover.w, blockH - 2);
      ctx.strokeStyle = "#fff";
      ctx.strokeRect(mover.x, mover.y + camY, mover.w, blockH - 2);

      for (var j = 0; j < falling.length; j++) {
        var fl = falling[j];
        ctx.globalAlpha = 0.65;
        ctx.fillStyle = TH.secondary;
        ctx.fillRect(fl.x, fl.y + camY, fl.w, blockH - 2);
      }
      ctx.globalAlpha = 1;

      updateDrawParticles(dt);
      state.rafId = requestAnimationFrame(loop);
    }
    state.rafId = requestAnimationFrame(loop);
  }

  // =========================================================================
  // GAME 7: CYBER NEON SNAKE
  // =========================================================================
  function startSnake() {
    canvas.style.display = "block";
    domStage.style.display = "none";
    snakeDpad.style.display = "flex";
    setExtra("🐍 3");
    resizeCanvas();

    var cols = 15;
    var boardPx = Math.min(state.W - 20, state.H - 135);
    var cell = Math.max(14, Math.floor(boardPx / cols));
    var ox = Math.floor((state.W - cell * cols) / 2);
    var oy = Math.max(12, Math.floor((state.H - 120 - cell * cols) / 2));

    var snake = [{ x: 7, y: 7 }, { x: 6, y: 7 }, { x: 5, y: 7 }];
    var dir = { x: 1, y: 0 };
    var queue = [];
    var food = { x: 11, y: 7 };

    function placeFood() {
      for (var t = 0; t < 100; t++) {
        var fx = Math.floor(Math.random() * cols);
        var fy = Math.floor(Math.random() * cols);
        var clash = snake.some(function(s) { return s.x === fx && s.y === fy; });
        if (!clash) { food = { x: fx, y: fy }; return; }
      }
    }

    function turn(nx, ny) {
      var ref = queue.length ? queue[queue.length - 1] : dir;
      if (ref.x + nx === 0 && ref.y + ny === 0) return;
      if (queue.length < 2) queue.push({ x: nx, y: ny });
    }

    window.onkeydown = function(e) {
      if (e.key === "ArrowUp" || e.key === "w") turn(0, -1);
      else if (e.key === "ArrowDown" || e.key === "s") turn(0, 1);
      else if (e.key === "ArrowLeft" || e.key === "a") turn(-1, 0);
      else if (e.key === "ArrowRight" || e.key === "d") turn(1, 0);
    };

    var swX = 0, swY = 0;
    canvas.ontouchstart = function(e) { swX = e.touches[0].clientX; swY = e.touches[0].clientY; };
    canvas.ontouchend = function(e) {
      var dx = e.changedTouches[0].clientX - swX;
      var dy = e.changedTouches[0].clientY - swY;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
      if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 1 : -1, 0);
      else turn(0, dy > 0 ? 1 : -1);
    };

    snakeDpad.querySelectorAll("button").forEach(function(b) {
      b.onpointerdown = function(e) {
        e.preventDefault();
        var d = b.getAttribute("data-dir");
        if (d === "U") turn(0, -1);
        else if (d === "D") turn(0, 1);
        else if (d === "L") turn(-1, 0);
        else if (d === "R") turn(1, 0);
      };
    });

    state.running = true;
    var stepAcc = 0;
    state.lastTime = performance.now();

    function drawBoard() {
      ctx.fillStyle = TH.bg;
      ctx.fillRect(0, 0, state.W, state.H);

      ctx.fillStyle = TH.panel;
      ctx.fillRect(ox, oy, cell * cols, cell * cols);
      ctx.strokeStyle = TH.primary;
      ctx.lineWidth = 2;
      ctx.strokeRect(ox, oy, cell * cols, cell * cols);

      ctx.font = Math.floor(cell * 0.78) + "px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(CFG.enemy_icon, ox + food.x * cell + cell / 2, oy + food.y * cell + cell / 2 + 1);

      for (var i = 0; i < snake.length; i++) {
        var seg = snake[i];
        ctx.fillStyle = i === 0 ? TH.primary : TH.accent;
        ctx.fillRect(ox + seg.x * cell + 2, oy + seg.y * cell + 2, cell - 4, cell - 4);
      }
    }

    function loop(now) {
      if (!state.running) return;
      var dt = Math.min(0.05, (now - state.lastTime) / 1000);
      state.lastTime = now;

      var tickSec = Math.max(0.068, (0.145 / DF.speed) - Math.min(0.045, snake.length * 0.0015));
      stepAcc += dt;
      if (stepAcc >= tickSec) {
        stepAcc = 0;
        if (queue.length) dir = queue.shift();
        var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
        var hitWall = head.x < 0 || head.y < 0 || head.x >= cols || head.y >= cols;
        var hitSelf = snake.some(function(s) { return s.x === head.x && s.y === head.y; });
        if (hitWall || hitSelf) { endGame(false); return; }

        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
          addScore(10);
          setExtra("🐍 " + snake.length);
          SFX.score();
          placeFood();
        } else {
          snake.pop();
        }
      }

      drawBoard();
      state.rafId = requestAnimationFrame(loop);
    }
    state.rafId = requestAnimationFrame(loop);
  }

  // =========================================================================
  // GAME 8: NEON CARD FLIP (MEMORY)
  // =========================================================================
  function startMemory() {
    canvas.style.display = "none";
    domStage.style.display = "flex";
    snakeDpad.style.display = "none";

    var icons = [CFG.hero_icon, CFG.enemy_icon, "⚡", "🔥", "💎", "👑", "🎯", "🛸"];
    var pairCount = (CFG.diff === "easy") ? 6 : 8;
    var deck = [];
    for (var i = 0; i < pairCount; i++) {
      deck.push(icons[i], icons[i]);
    }
    for (var j = deck.length - 1; j > 0; j--) {
      var r = Math.floor(Math.random() * (j + 1));
      var tmp = deck[j]; deck[j] = deck[r]; deck[r] = tmp;
    }

    var first = null;
    var busy = false;
    var moves = 0;
    var matched = 0;
    var secs = 0;
    state.running = true;

    setExtra("⏱️ 0s");
    state.timers.push(setInterval(function() {
      secs++;
      setExtra("⏱️ " + secs + "s");
    }, 1000));

    domStage.innerHTML = '<div class="whack-meta" id="memMeta">Moves: 0 • Pairs: 0/' + pairCount + '</div><div class="mem-grid" id="memGrid"></div>';
    var grid = document.getElementById("memGrid");
    var meta = document.getElementById("memMeta");

    deck.forEach(function(sym) {
      var card = document.createElement("div");
      card.className = "mcard closed";
      card.textContent = "?";
      card.setAttribute("data-s", sym);
      card.onclick = function() {
        if (!state.running || busy || !card.classList.contains("closed")) return;
        SFX.click();
        card.classList.remove("closed");
        card.textContent = sym;

        if (!first) {
          first = card;
          return;
        }
        moves++;
        if (first.getAttribute("data-s") === sym) {
          first.classList.add("matched");
          card.classList.add("matched");
          first = null;
          matched++;
          addScore(25);
          SFX.score();
          meta.textContent = "Moves: " + moves + " • Pairs: " + matched + "/" + pairCount;
          if (matched === pairCount) {
            var speedBonus = Math.max(0, 200 - moves * 6 - secs * 2);
            addScore(speedBonus);
            setTimeout(function() {
              endGame(true, "🧠 Cleared in " + moves + " moves & " + secs + "s! (+" + speedBonus + " speed bonus)");
            }, 350);
          }
        } else {
          busy = true;
          var prev = first;
          first = null;
          meta.textContent = "Moves: " + moves + " • Pairs: " + matched + "/" + pairCount;
          setTimeout(function() {
            prev.classList.add("closed"); prev.textContent = "?";
            card.classList.add("closed"); card.textContent = "?";
            busy = false;
          }, 550);
        }
      };
      grid.appendChild(card);
    });
  }

  // ---- Dispatcher ----
  function launchGame() {
    clearRuntime();
    state.targetBeaten = false;
    if (CFG.target > 0) {
      targetBar.classList.remove("beaten");
      targetBar.textContent = "🎯 TARGET: BEAT " + CFG.challenger.toUpperCase() + " (" + CFG.target + ")";
    }
    setScore(0);
    overlay.classList.add("hidden");
    getAudio();

    if (CFG.type === "shooter") startShooter();
    else if (CFG.type === "flappy") startFlappy();
    else if (CFG.type === "dodge") startDodge();
    else if (CFG.type === "hangman") startHangman();
    else if (CFG.type === "whack") startWhack();
    else if (CFG.type === "stack") startStack();
    else if (CFG.type === "snake") startSnake();
    else if (CFG.type === "memory") startMemory();
    else startShooter();
  }

  playBtn.addEventListener("click", launchGame);
  restartBtn.addEventListener("click", launchGame);
})();
</script>
</body>
</html>`;
}

module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("X-Powered-By", BRAND.name);
  res.setHeader("X-API-Developer", BRAND.developer);
  res.setHeader("X-API-Owner", BRAND.owner);
  res.setHeader("X-API-Version", BRAND.version);

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const body = (req.body && typeof req.body === "object") ? req.body : {};
  const params = Object.assign({}, req.query || {}, body);
  const baseUrl = getBaseUrl(req);
  const mode = cleanStr(params.mode, "play", 16).toLowerCase();

  // 1. API Documentation Endpoint (Default on "/")
  if (mode === "docs" || mode === "info" || mode === "list") {
    return res.status(200).json({
      status: true,
      brand: BRAND.name,
      developer: BRAND.developer,
      owner: BRAND.owner,
      api: BRAND.api_name,
      version: BRAND.version,
      endpoints: {
        docs: `${baseUrl}/api/game?mode=docs`,
        play: `${baseUrl}/api/game?type=shooter&hero=Player&enemy=Bugs&theme=cyber&mode=play`,
        json_builder: `${baseUrl}/api/game?type=flappy&hero=Player&enemy=Exams&mode=json`,
        download_html: `${baseUrl}/api/game?type=dodge&hero=Player&mode=download`,
        hangman_encoder: `${baseUrl}/api/game?mode=encode&word=KARACHI&hint=City+of+Lights`
      },
      games: GAMES,
      themes: Object.keys(THEMES),
      difficulties: Object.keys(DIFFS),
      hangman_categories: Object.keys(WORD_BANK),
      parameters: {
        type: "shooter | flappy | dodge | hangman | whack | stack | snake | memory",
        hero: "Player name (default: Player)",
        hero_icon: "Hero emoji (default: 🚀)",
        enemy: "Villain / obstacle name (default: Villain)",
        enemy_icon: "Enemy emoji (default: 👾)",
        title: "Custom game title (optional)",
        theme: "cyber | matrix | retro | lava",
        diff: "easy | normal | hard | impossible",
        roast: "Custom game-over roast message",
        target: "Numeric score challenge target (optional)",
        challenger: "Name of challenger (optional)",
        word: "Plain secret word for hangman (auto-encoded)",
        w: "Pre-encoded Base64 word token for anti-cheat hangman",
        hint: "Hint text for custom hangman word",
        category: "pakistan | tech | food | movies | random",
        mode: "play | download | json | encode | docs"
      }
    });
  }

  // 2. Anti-Cheat Hangman Secret Word Encoder Endpoint
  if (mode === "encode") {
    const rawWord = cleanStr(params.word, "", 24);
    const token = encodeWord(rawWord);
    if (!token) {
      return res.status(400).json({
        status: false,
        brand: BRAND.name,
        developer: BRAND.developer,
        owner: BRAND.owner,
        error: "Please provide a valid English word using ?mode=encode&word=KARACHI"
      });
    }
    const hint = cleanStr(params.hint, "Crack the secret word!", 60);
    const hero = cleanStr(params.hero, "Player", 20);
    const theme = THEMES[cleanStr(params.theme, "cyber", 12).toLowerCase()]
      ? cleanStr(params.theme, "cyber", 12).toLowerCase()
      : "cyber";
    const qs = buildQuery({ type: "hangman", w: token, hint, hero, challenger: hero, theme, mode: "play" });

    return res.status(200).json({
      status: true,
      brand: BRAND.name,
      developer: BRAND.developer,
      owner: BRAND.owner,
      encoded_token: token,
      hint: hint,
      length: decodeWord(token).length,
      play_url: `${baseUrl}/api/game?${qs}`
    });
  }

  // 3. Build Game Configuration
  const rawType = cleanStr(params.type, "shooter", 16).toLowerCase();
  const type = GAMES[rawType] ? rawType : "shooter";
  const rawTheme = cleanStr(params.theme, "cyber", 16).toLowerCase();
  const theme = THEMES[rawTheme] ? rawTheme : "cyber";
  const rawDiff = cleanStr(params.diff, "normal", 16).toLowerCase();
  const diff = DIFFS[rawDiff] ? rawDiff : "normal";

  const hero = cleanStr(params.hero, "Player", 20);
  const hero_icon = cleanStr(params.hero_icon, "🚀", 6);
  const enemy = cleanStr(params.enemy, "Villain", 20);
  const enemy_icon = cleanStr(params.enemy_icon, "👾", 6);
  const title = cleanStr(params.title, GAMES[type].name, 34);
  const roast = cleanStr(params.roast, `Oops! ${enemy} destroyed ${hero}. Try again!`, 110);
  const target = Math.max(0, Math.min(999999, parseInt(params.target, 10) || 0));
  const challenger = cleanStr(params.challenger, hero, 20);
  const category = cleanStr(params.category, "random", 16).toLowerCase();
  const hint = cleanStr(params.hint, "", 65);

  let word_token = "";
  if (params.w) {
    const check = decodeWord(params.w);
    if (check.length >= 2) word_token = encodeWord(check);
  } else if (params.word) {
    const enc = encodeWord(params.word);
    if (enc) word_token = enc;
  }

  const cfg = {
    type,
    title,
    hero,
    hero_icon,
    enemy,
    enemy_icon,
    theme,
    themeObj: THEMES[theme],
    diff,
    diffObj: DIFFS[diff],
    roast,
    target,
    challenger,
    category,
    hint,
    word_token,
    gameMeta: GAMES[type]
  };

  // 4. JSON Builder Output (For Your Future Frontend Website)
  if (mode === "json") {
    const sharedParams = {
      type, title, hero, hero_icon, enemy, enemy_icon,
      theme, diff, roast,
      target: target || "",
      challenger: target ? challenger : "",
      category: type === "hangman" ? category : "",
      hint: type === "hangman" ? hint : "",
      w: type === "hangman" ? word_token : ""
    };

    const playUrl = `${baseUrl}/api/game?${buildQuery(Object.assign({}, sharedParams, { mode: "play" }))}`;
    const downloadUrl = `${baseUrl}/api/game?${buildQuery(Object.assign({}, sharedParams, { mode: "download" }))}`;

    return res.status(200).json({
      status: true,
      brand: BRAND.name,
      developer: BRAND.developer,
      owner: BRAND.owner,
      api: BRAND.api_name,
      version: BRAND.version,
      game: {
        type,
        name: GAMES[type].name,
        category: GAMES[type].category,
        title,
        hero,
        enemy,
        theme,
        difficulty: diff,
        target_score: target
      },
      urls: {
        play: playUrl,
        download: downloadUrl
      },
      embed_iframe: `<iframe src="${playUrl}" width="100%" height="620" style="border:none;border-radius:14px;" allow="fullscreen"></iframe>`
    });
  }

  // 5. Playable HTML or Offline Download Output
  const html = buildGameHtml(cfg);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  if (mode === "download") {
    const safeFile = `empire-tech-zone-${type}-game.html`;
    res.setHeader("Content-Disposition", `attachment; filename="${safeFile}"`);
  }

  return res.status(200).send(html);
};
