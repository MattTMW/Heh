"use strict";

/* ============================================================
   SOUND — real mp3s with Web Audio fallbacks
   assets/our_song.mp3 (celebration, loops) and assets/breh.mp3
   (sad screen) are used if present; otherwise everything is a
   generated oscillator. The AudioContext is created lazily on
   first user interaction (mobile autoplay rules).
   ============================================================ */

let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, startDelay, duration, type = "sine", volume = 0.18) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime + startDelay);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + startDelay + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startDelay + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + startDelay);
    osc.stop(ctx.currentTime + startDelay + duration + 0.05);
  } catch (e) { /* audio blocked — no problem, stay silent */ }
}

function playPop() { playTone(rand(500, 700), 0, 0.12, "triangle", 0.12); } // dodge boing
function playClick() { playTone(880, 0, 0.1, "sine", 0.1); }                  // button tap

/* Try the real mp3 first, generated fallback only if playback fails.
   QUIRK: never gate on audio.readyState — mobile browsers don't preload
   media, so readyState stays 0 there even when the file exists. play()
   inside the user's tap loads AND plays; it only rejects if the file is
   truly missing/unplayable, which is when the fallback should fire. */
function playMediaWithFallback(audio, fallback) {
  if (!audio) { fallback(); return; }
  const attempt = audio.play();
  if (attempt && attempt.catch) {
    attempt.catch(() => fallback());
  } else if (audio.error) {
    fallback();
  }
}

function playCelebration() {
  playMediaWithFallback($("#celebration-audio"), playChimeFallback);
}
function playChimeFallback() {
  // A happy little ascending arpeggio (C-E-G-C) as the placeholder
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => playTone(f, i * 0.12, 0.5, "sine", 0.16));
  [523.25, 659.25, 783.99].forEach((f, i) => playTone(f * 2, 0.5 + i * 0.1, 0.4, "triangle", 0.08));
}

/* Prefer assets/breh.mp3; fall back to a sad little descending "wah wah" */
function playSad() {
  playMediaWithFallback($("#sad-audio"), playSadFallback);
}
function playSadFallback() {
  [392, 349.23, 311.13].forEach((f, i) => playTone(f, i * 0.4, 0.55, "triangle", 0.14));
}
