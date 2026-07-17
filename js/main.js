"use strict";

/* ============================================================
   MAIN — init, ambience, screen flow, celebrate/sad orchestration
   Loaded last; wires together audio.js, confetti.js, gallery.js,
   envelope.js, and dodge.js (all share the global scope).
   ============================================================ */

/* Try to load the real character images; if they exist, they replace
   the built-in SVG placeholders automatically (see CSS .char-img). */
document.querySelectorAll(".char-img").forEach((img) => {
  img.addEventListener("load", () => img.classList.add("loaded"));
  if (img.complete && img.naturalWidth > 0) img.classList.add("loaded");
});

/* ============================================================
   FLOATING BACKGROUND HEARTS + SPARKLES
   ============================================================ */
const DECOR = ["🩷", "💗", "💕", "✨", "⭐", "🌸", "💖", "✨"];
function spawnFloaty() {
  const el = document.createElement("div");
  const symbol = DECOR[Math.floor(Math.random() * DECOR.length)];
  el.textContent = symbol;
  el.className = "floaty" + (symbol === "✨" || symbol === "⭐" ? " sparkle" : "");
  el.style.left = rand(0, 100) + "vw";
  el.style.fontSize = rand(0.8, 1.9) + "rem";
  el.style.setProperty("--drift", rand(-40, 40) + "px");
  el.style.animationDuration = rand(7, 14) + "s";
  $("#bg-decor").appendChild(el);
  // Clean up after the animation so the DOM never bloats
  el.addEventListener("animationend", () => el.remove());
}
if (!reducedMotion) {
  for (let i = 0; i < 6; i++) setTimeout(spawnFloaty, i * 400); // initial batch
  setInterval(spawnFloaty, 900);                                 // steady stream
}

/* ============================================================
   SCREEN TRANSITIONS
   ============================================================ */
function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $(id).classList.add("active");
}

/* Intro: fade the Continue button in after ~1 second */
setTimeout(() => $("#btn-continue").classList.add("revealed"), 1000);

$("#btn-continue").addEventListener("click", () => {
  playClick();
  showScreen("#screen-question");
});

/* ============================================================
   THE SAD SCREEN — she really said no
   (reached from dodge.js once she clicks No past LAST CHANCE)
   ============================================================ */
function goSad() {
  document.body.classList.add("sad");
  // Reset the runaway No button so it doesn't linger over this screen
  btnNo.classList.remove("dodging");
  btnNo.style.left = btnNo.style.top = "";
  btnNo.style.transform = "none";
  playSad();
  showScreen("#screen-no");
}

/* The soft way back: "Wait... I change my mind!" → celebration */
$("#btn-reconsider").addEventListener("click", () => {
  document.body.classList.remove("sad");
  // Cut the "breh" short so it doesn't overlap the celebration song
  const sadAudio = $("#sad-audio");
  sadAudio.pause();
  sadAudio.currentTime = 0;
  celebrate();
});

/* ============================================================
   YES! — CONFETTI, HEARTS, SOUND, CELEBRATION SCREEN
   ============================================================ */
btnYes.addEventListener("click", celebrate);

function celebrate() {
  playCelebration();
  showScreen("#screen-yes");
  // Hide the runaway No button if it was mid-dodge
  btnNo.style.display = "none";
  launchConfetti();
  launchHearts();
  buildPhotoGallery();
  // Give her a beat to spot the envelope, then it flies off!
  setTimeout(startFloating, 1200);
}

/* Hearts that float up from the bottom of the screen */
function launchHearts() {
  const symbols = ["🩷", "💖", "💗", "💕", "✨"];
  let launched = 0;
  const timer = setInterval(() => {
    const h = document.createElement("div");
    h.className = "celebrate-heart";
    h.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    h.style.left = rand(2, 94) + "vw";
    h.style.fontSize = rand(1.4, 3) + "rem";
    h.style.setProperty("--dur", rand(2.5, 4.5) + "s");
    h.style.setProperty("--spin", rand(-180, 180) + "deg");
    document.body.appendChild(h);
    h.addEventListener("animationend", () => h.remove());
    if (++launched >= 40) clearInterval(timer);
  }, 120);
}
