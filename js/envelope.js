"use strict";

/* ============================================================
   THE ENVELOPE + LETTER
   After celebrate() calls startFloating(), the CSS-drawn envelope
   detaches and drifts DVD-screensaver style until she taps
   ("catches") it: it glides to center, the flap opens, and the
   letter overlay (typed letter in index.html) fades in. Closing
   the overlay re-seals the envelope and it flies off again.

   QUIRK — do not "modernize": the float uses left/top + rAF, not
   transforms, because the .caught glide-to-center transitions
   those same properties and transform is already taken by the
   wiggle animation.
   ============================================================ */

const envelope = $("#envelope");
const letterOverlay = $("#letter-overlay");

/* --- Float physics (reduced motion: stays politely in place) --- */
let floating = false;
let fx = 0, fy = 0;          // current position (px)
let fvx = 0, fvy = 0;        // velocity (px per second)
let lastFloatT = 0;

function startFloating() {
  if (reducedMotion || floating ||
    envelope.classList.contains("caught") ||
    envelope.classList.contains("open")) return;
  floating = true;

  // Start from where it sits in the layout so it doesn't teleport
  const r = envelope.getBoundingClientRect();
  fx = r.left;
  fy = r.top;
  envelope.classList.add("floating");
  envelope.style.left = fx + "px";
  envelope.style.top = fy + "px";

  // Slow enough to catch on a phone, lively enough to be a chase
  const speed = 130;
  const angle = rand(0, Math.PI * 2);
  fvx = Math.cos(angle) * speed;
  fvy = Math.sin(angle) * speed;

  lastFloatT = performance.now();
  requestAnimationFrame(floatFrame);
}

function floatFrame(t) {
  if (!floating) return;
  const dt = Math.min((t - lastFloatT) / 1000, 0.05); // clamp big gaps
  lastFloatT = t;

  fx += fvx * dt;
  fy += fvy * dt;

  // Bounce off the viewport edges (with a little padding)
  const pad = 6;
  const maxX = window.innerWidth - envelope.offsetWidth - pad;
  const maxY = window.innerHeight - envelope.offsetHeight - pad;
  if (fx < pad) { fx = pad; fvx = Math.abs(fvx); }
  if (fx > maxX) { fx = maxX; fvx = -Math.abs(fvx); }
  if (fy < pad) { fy = pad; fvy = Math.abs(fvy); }
  if (fy > maxY) { fy = maxY; fvy = -Math.abs(fvy); }

  envelope.style.left = fx + "px";
  envelope.style.top = fy + "px";
  requestAnimationFrame(floatFrame);
}

envelope.addEventListener("click", () => {
  // Caught mid-float: stop, glide to center, then open
  if (floating) {
    floating = false;
    envelope.classList.add("caught");
    envelope.style.left = (window.innerWidth - envelope.offsetWidth) / 2 + "px";
    envelope.style.top = (window.innerHeight - envelope.offsetHeight) / 2 + "px";
    playPop();
    setTimeout(openEnvelope, 650);
    return;
  }
  openEnvelope();
});

function openEnvelope() {
  const alreadyOpen = envelope.classList.contains("open");
  envelope.classList.add("open");
  // Gentle "paper" flourish: two soft rising notes
  playTone(660, 0, 0.25, "sine", 0.1);
  playTone(990, 0.12, 0.3, "sine", 0.08);
  // First tap: let the flap + letter animation play before the overlay
  setTimeout(() => letterOverlay.classList.add("show"),
    alreadyOpen || reducedMotion ? 0 : 750);
}

/* Close with the ✕ or by tapping the dark backdrop.
   The envelope seals itself back up and flies off again —
   she has to catch it every time she wants to reread it. */
function closeLetter() {
  letterOverlay.classList.remove("show");
  // Wait for the overlay fade, then re-seal + take off
  setTimeout(() => {
    envelope.classList.remove("open", "caught");
    startFloating();
  }, 500);
}
$("#letter-close").addEventListener("click", closeLetter);
letterOverlay.addEventListener("click", (e) => {
  if (e.target === letterOverlay) closeLetter();
});
