"use strict";

/* ============================================================
   THE DODGING "NO" BUTTON + question-screen reactions
   ------------------------------------------------------------
   On desktop the button flees the cursor; on a phone it dodges
   the moment her finger lands near it.

   QUIRK — do not "modernize": touchstart fires BEFORE click, so
   moving the button on touchstart makes the tap "miss" and the
   click never registers. Don't convert to pointer events without
   re-testing on a real phone.

   Every 2 dodges the character reacts with an escalating speech
   bubble. After "LAST CHANCE" the button stops dodging — if she
   presses No then, she means it → goSad() in main.js.
   ============================================================ */

const btnNo = $("#btn-no");
const btnYes = $("#btn-yes");

let dodgeCount = 0;      // total times the button has fled
let dodgeRadius = 110;   // proximity that triggers a dodge (px)
let lastDodge = 0;     // timestamp throttle so it doesn't teleport wildly
let surrendered = false; // true after LAST CHANCE: No stops dodging

/* One escalating message every 2 dodges; the last one is final */
const NO_PROMPTS = [
  "are you sure? 🥺",
  "wait... you don't like me huh 😢",
  "say you hate me SIGHH 😭",
  "LAST CHANCE!! 🥺🩷",
];

/* Move the No button to a random on-screen spot (never off-screen,
   and never right on top of the Yes button). */
function dodge() {
  const now = performance.now();
  if (now - lastDodge < 250) return;  // throttle
  lastDodge = now;
  dodgeCount++;

  btnNo.classList.add("dodging");
  const bw = btnNo.offsetWidth, bh = btnNo.offsetHeight;
  const pad = 12;

  // Pick a random spot that NEVER overlaps the Yes button: a mid-tap
  // dodge must not leave Yes under her finger. Among the candidates,
  // keep the one farthest from Yes as a guaranteed fallback.
  const yesRect = btnYes.getBoundingClientRect();
  const yesCx = yesRect.left + yesRect.width / 2;
  const yesCy = yesRect.top + yesRect.height / 2;
  const margin = 40; // clearance around Yes, beyond mere non-overlap
  let x, y, bestX, bestY, bestDist = -1;
  for (let tries = 0; tries < 40; tries++) {
    x = rand(pad, window.innerWidth - bw - pad);
    y = rand(pad, window.innerHeight - bh - pad);
    const overlapsYes =
      x < yesRect.right + margin && x + bw > yesRect.left - margin &&
      y < yesRect.bottom + margin && y + bh > yesRect.top - margin;
    const dist = Math.hypot(x + bw / 2 - yesCx, y + bh / 2 - yesCy);
    if (dist > bestDist) { bestDist = dist; bestX = x; bestY = y; }
    if (!overlapsYes) { bestX = x; bestY = y; break; }
  }
  btnNo.style.left = bestX + "px";
  btnNo.style.top = bestY + "px";

  // Occasionally shrink a bit / rotate a little for extra silliness
  const scale = Math.random() < 0.3 ? rand(0.78, 0.9) : 1;
  const rotate = Math.random() < 0.4 ? rand(-14, 14) : 0;
  btnNo.style.transform = `scale(${scale}) rotate(${rotate}deg)`;

  playPop();
  afterDodge();
}

/* Escalating reactions as she keeps trying to press No:
   every 2nd dodge shows the next speech-bubble prompt. */
function afterDodge() {
  // Yes grows first — showPrompt's LAST CHANCE branch (dodge 8) resets
  // the growth, so it must run after any classList.add of this tick
  if (dodgeCount === 4) btnYes.classList.add("bigger");
  if (dodgeCount === 6) btnYes.classList.add("biggest");

  if (dodgeCount % 2 === 0) {
    const idx = dodgeCount / 2 - 1;
    if (idx < NO_PROMPTS.length) showPrompt(idx);
  }
}

let promptTimer = null;
function showPrompt(idx) {
  const bubble = $("#speech-bubble");
  bubble.textContent = NO_PROMPTS[idx];
  bubble.classList.add("show");
  clearTimeout(promptTimer);

  if (idx === NO_PROMPTS.length - 1) {
    // LAST CHANCE: the bubble stays, and No stops dodging —
    // if she presses it now, she really means it.
    surrendered = true;
    // Put the button back in its home slot next to Yes, and shrink
    // Yes back to normal: grown-Yes visually overflows its layout box
    // and would sit nearly touching No — a mis-tap waiting to happen.
    btnNo.classList.remove("dodging");
    btnNo.style.left = btnNo.style.top = "";
    btnNo.style.transform = "none";
    btnYes.classList.remove("bigger", "biggest");
  } else {
    promptTimer = setTimeout(() => bubble.classList.remove("show"), 2600);
  }
}

/* --- Desktop: dodge when the cursor gets close --- */
document.addEventListener("mousemove", (e) => {
  if (surrendered || !$("#screen-question").classList.contains("active")) return;
  const r = btnNo.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  if (Math.hypot(e.clientX - cx, e.clientY - cy) < dodgeRadius) dodge();
});

/* --- Mobile: dodge when a finger lands near the button (see QUIRK) --- */
document.addEventListener("touchstart", (e) => {
  if (surrendered || !$("#screen-question").classList.contains("active")) return;
  const t = e.touches[0];
  const r = btnNo.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  if (Math.hypot(t.clientX - cx, t.clientY - cy) < dodgeRadius) dodge();
}, { passive: true });

/* --- If No is actually clicked --- */
btnNo.addEventListener("click", () => {
  if (surrendered) {
    // Past LAST CHANCE — she means it. Sad screen. 😔
    playClick();
    goSad();
    return;
  }
  // Somehow clicked mid-chase (e.g. keyboard) — it just escapes again
  dodge();
});

/* --- Blush on Yes hover (and touch) --- */
function setBlush(on) {
  $("#char-question").classList.toggle("blushing", on);
}
btnYes.addEventListener("mouseenter", () => setBlush(true));
btnYes.addEventListener("mouseleave", () => setBlush(false));
btnYes.addEventListener("touchstart", () => setBlush(true), { passive: true });
