"use strict";

/* ============================================================
   CONFETTI — lightweight canvas particle system
   launchConfetti() is called by celebrate() in main.js.
   The canvas sits at z-index 70 with pointer-events: none.
   ============================================================ */

const canvas = $("#confetti-canvas");
const ctx2d = canvas.getContext("2d");
let confetti = [];
let confettiRunning = false;

function sizeCanvas() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  ctx2d.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
window.addEventListener("resize", sizeCanvas);
sizeCanvas();

const CONFETTI_COLORS = ["#ff9ec4", "#ffd3e2", "#b8e0ff", "#fff2a8", "#d5c4ff", "#ffffff", "#ffb3cf"];

function launchConfetti() {
  // Two bursts from the bottom corners + a center pop
  const bursts = [
    { x: window.innerWidth * 0.15, y: window.innerHeight * 0.9 },
    { x: window.innerWidth * 0.85, y: window.innerHeight * 0.9 },
    { x: window.innerWidth * 0.5, y: window.innerHeight * 0.55 },
  ];
  bursts.forEach((b) => {
    for (let i = 0; i < 60; i++) {
      const angle = rand(-Math.PI * 0.85, -Math.PI * 0.15); // mostly upward
      const speed = rand(6, 14);
      confetti.push({
        x: b.x, y: b.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: rand(5, 11),
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rot: rand(0, Math.PI * 2),
        rotSpeed: rand(-0.25, 0.25),
        life: rand(120, 220),        // frames until it fades out
        shape: Math.random() < 0.3 ? "heart" : "rect",
      });
    }
  });
  if (!confettiRunning) { confettiRunning = true; requestAnimationFrame(confettiFrame); }
}

function confettiFrame() {
  ctx2d.clearRect(0, 0, window.innerWidth, window.innerHeight);
  confetti = confetti.filter((p) => p.life > 0 && p.y < window.innerHeight + 40);

  for (const p of confetti) {
    p.vy += 0.22;                 // gravity
    p.vx *= 0.99;                 // air drag
    p.x += p.vx; p.y += p.vy;
    p.rot += p.rotSpeed;
    p.life--;

    ctx2d.save();
    ctx2d.translate(p.x, p.y);
    ctx2d.rotate(p.rot);
    ctx2d.globalAlpha = Math.min(1, p.life / 40);   // fade at end of life
    ctx2d.fillStyle = p.color;
    if (p.shape === "heart") {
      // teeny two-circle-and-triangle heart
      const s = p.size / 2;
      ctx2d.beginPath();
      ctx2d.arc(-s / 2, -s / 3, s / 1.6, 0, Math.PI * 2);
      ctx2d.arc(s / 2, -s / 3, s / 1.6, 0, Math.PI * 2);
      ctx2d.moveTo(-s, 0); ctx2d.lineTo(0, s * 1.2); ctx2d.lineTo(s, 0);
      ctx2d.fill();
    } else {
      ctx2d.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    }
    ctx2d.restore();
  }

  if (confetti.length > 0) {
    requestAnimationFrame(confettiFrame);
  } else {
    confettiRunning = false;
    ctx2d.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}
