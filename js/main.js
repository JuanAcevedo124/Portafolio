// ===== LIVE CODE SESSION — mezclador real con Song.mp3 =====
const navToggle = document.querySelector('.nav__toggle');
const navMenu = document.querySelector('.nav__menu');

navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  const expanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!expanded));
});
document.querySelectorAll('.nav__link').forEach((link) =>
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
  })
);
document.addEventListener('click', (e) => {
  if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
    navMenu.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

// ===== Typewriter de roles =====
const phrases = [
  'interfaces que suenan bien',
  'beats de JavaScript',
  'bajos sólidos de backend',
  'experiencias que hacen encore',
];
const typeEl = document.getElementById('typewriter');
let pi = 0, ci = phrases[0].length, deleting = true;
if (typeEl) {
  setInterval(() => {
    if (!document.body.classList.contains('is-playing')) return;
    if (deleting) {
      ci--;
      if (ci <= 0) { deleting = false; pi = (pi + 1) % phrases.length; ci = 0; }
    } else {
      ci++;
      if (ci >= phrases[pi].length + 8) { deleting = true; }
    }
    typeEl.textContent = phrases[pi].slice(0, Math.min(ci, phrases[pi].length));
  }, 90);
}

// ===== Audio real: Song.mp3 + EQ de 3 bandas + analyser =====
const song = document.getElementById('song');
const songToggle = document.getElementById('songToggle');
const songToggleLabel = document.getElementById('songToggleLabel');
const songStatus = document.getElementById('songStatus');
const songTime = document.getElementById('songTime');
const playBtn = document.getElementById('playToggle');
const playBtnNav = document.getElementById('playToggleNav');

let audioCtx = null;
let lowFilter = null, midFilter = null, highFilter = null;
let analyser = null, freqData = null;
let graphBuilt = false;
let isSongPlaying = false;

function fmt(s) {
  if (!isFinite(s) || s < 0) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

function buildGraph() {
  if (graphBuilt || !song) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  audioCtx = new AC();
  const src = audioCtx.createMediaElementSource(song);

  lowFilter = audioCtx.createBiquadFilter();
  lowFilter.type = 'lowshelf';
  lowFilter.frequency.value = 220;

  midFilter = audioCtx.createBiquadFilter();
  midFilter.type = 'peaking';
  midFilter.frequency.value = 1000;
  midFilter.Q.value = 0.9;

  highFilter = audioCtx.createBiquadFilter();
  highFilter.type = 'highshelf';
  highFilter.frequency.value = 5200;

  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 64;
  freqData = new Uint8Array(analyser.frequencyBinCount);

  src.connect(lowFilter).connect(midFilter).connect(highFilter).connect(analyser).connect(audioCtx.destination);
  graphBuilt = true;
  applyFadersToEQ();
}

// fader 0-100 -> ganancia EQ -25dB a +9dB
function faderToGain(v) {
  return -25 + (v / 100) * 34;
}

function applyFadersToEQ() {
  if (!graphBuilt) return;
  document.querySelectorAll('.channel').forEach((ch) => {
    const fader = ch.querySelector('.fader');
    if (!fader) return;
    const g = faderToGain(Number(fader.value));
    const band = ch.dataset.band;
    if (band === 'low' && lowFilter) lowFilter.gain.value = g;
    if (band === 'mid' && midFilter) midFilter.gain.value = g;
    if (band === 'high' && highFilter) highFilter.gain.value = g;
  });
}

function setStagePlaying(on) {
  document.body.classList.toggle('is-playing', on);
  if (playBtn) {
    // El botón del player refleja la música, no solo la animación
    playBtn.textContent = isSongPlaying ? '⏸' : '▶';
  }
}

async function playSong() {
  if (!song) return;
  buildGraph();
  if (audioCtx && audioCtx.state === 'suspended') await audioCtx.resume();
  await song.play();
}

function pauseSong() {
  if (!song) return;
  song.pause();
}

if (song) {
  song.addEventListener('play', () => {
    isSongPlaying = true;
    setStagePlaying(true);
    if (songToggleLabel) songToggleLabel.textContent = 'Pausar instrumental';
    const icon = songToggle ? songToggle.querySelector('.btn__icon') : null;
    if (icon) icon.textContent = '⏸';
    if (songStatus) {
      songStatus.textContent = '♪ Sonando Song.mp3 — mueve los faders para filtrarla en vivo';
      songStatus.classList.add('playing');
    }
  });
  song.addEventListener('pause', () => {
    isSongPlaying = false;
    if (songToggleLabel) songToggleLabel.textContent = 'Tocar mi instrumental';
    const icon = songToggle ? songToggle.querySelector('.btn__icon') : null;
    if (icon) icon.textContent = '▶';
    if (songStatus) {
      songStatus.textContent = '⏸ Song.mp3 en pausa';
      songStatus.classList.remove('playing');
    }
    if (playBtn) playBtn.textContent = '▶';
  });
  song.addEventListener('timeupdate', () => {
    if (songTime) songTime.textContent = `${fmt(song.currentTime)} / ${fmt(song.duration)}`;
  });
  song.addEventListener('loadedmetadata', () => {
    if (songTime) songTime.textContent = `${fmt(0)} / ${fmt(song.duration)}`;
  });
  song.addEventListener('error', () => {
    if (songStatus) songStatus.textContent = '⚠ No pude cargar audio/Song.mp3 — revisa que el archivo siga en la carpeta audio.';
  });
}

async function toggleSong() {
  if (!song) return;
  if (song.paused) {
    try { await playSong(); }
    catch (err) {
      if (songStatus) songStatus.textContent = '⚠ El navegador bloqueó el audio — pulsa de nuevo para dar play.';
    }
  } else {
    pauseSong();
  }
}

if (songToggle) songToggle.addEventListener('click', toggleSong);
if (playBtn) playBtn.addEventListener('click', toggleSong);
if (playBtnNav) playBtnNav.addEventListener('click', toggleSong);
// Arranca con animaciones encendidas pero música en pausa (autoplay bloqueado)
setStagePlaying(true);

// ===== Visualizador: real cuando suena, falso cuando no =====
const canvas = document.getElementById('visualizer');
const ctx = canvas ? canvas.getContext('2d') : null;
const bars = new Array(24).fill(4);

function drawVisualizer(t) {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const n = bars.length;
  let targets = [];

  if (analyser && isSongPlaying) {
    analyser.getByteFrequencyData(freqData);
    for (let i = 0; i < n; i++) {
      const bin = Math.floor((i / n) * freqData.length);
      targets.push(4 + (freqData[bin] / 255) * (canvas.height - 6));
    }
  } else {
    const stageOn = document.body.classList.contains('is-playing');
    for (let i = 0; i < n; i++) {
      targets.push(stageOn
        ? 6 + Math.abs(Math.sin(t / 300 + i * 0.7)) * 40 + Math.random() * 6
        : 4);
    }
  }

  targets.forEach((target, i) => {
    bars[i] += (target - bars[i]) * 0.25;
    const h = bars[i];
    const x = i * (canvas.width / n);
    const grad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - h);
    grad.addColorStop(0, '#ff2e88');
    grad.addColorStop(1, '#22d3ee');
    ctx.fillStyle = grad;
    ctx.fillRect(x + 1, canvas.height - h, canvas.width / n - 2, h);
  });
  requestAnimationFrame(drawVisualizer);
}
if (canvas) requestAnimationFrame(drawVisualizer);

// ===== Player inferior: scroll + track por sección =====
const tracks = [
  'Song.mp3 — instrumental propio',
  'Track 01 · El artista',
  'Track 02-04 · Discografía',
  'Track 05 · Mezclador en vivo ♪',
  'Encore · Hablemos',
];
const playerTrack = document.getElementById('playerTrack');
const playerBar = document.getElementById('playerBar');
const playerTime = document.getElementById('playerTime');
const scrollProgress = document.getElementById('scrollProgress');
const sections = ['inicio', 'sobre-mi', 'proyectos', 'habilidades', 'contacto'];

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? window.scrollY / max : 0;
  if (playerBar) playerBar.style.width = `${p * 100}%`;
  if (scrollProgress) scrollProgress.style.width = `${p * 100}%`;
  if (playerTime) {
    const total = 213;
    const s = Math.floor(p * total);
    playerTime.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }
  let current = 0;
  sections.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top < window.innerHeight * 0.5) current = i;
  });
  if (playerTrack && !isSongPlaying) playerTrack.textContent = tracks[current];
  if (playerTrack && isSongPlaying && current !== 0) playerTrack.textContent = `${tracks[current]} · ♪ Song.mp3`;
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ===== Reveal on scroll =====
const observer = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    }),
  { threshold: 0.15 }
);
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// ===== Faders: % + LEDs + EQ real =====
document.querySelectorAll('.channel').forEach((channel) => {
  const fader = channel.querySelector('.fader');
  const val = channel.querySelector('.channel__val');
  const leds = channel.querySelectorAll('.channel__leds i');
  if (!fader) return;
  const update = () => {
    const v = Number(fader.value);
    if (val) val.textContent = `${v}%`;
    const lit = Math.round((v / 100) * leds.length);
    leds.forEach((led, i) => led.classList.toggle('on', i < lit));
    applyFadersToEQ();
  };
  fader.addEventListener('input', update);
  update();
});
