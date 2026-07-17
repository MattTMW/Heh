"use strict";

/* ============================================================
   SHARED UTILITIES — loaded first; every other module uses these.
   All js/ files are classic scripts sharing the global scope,
   loaded in dependency order (see the <script> tags in index.html):
     utils → audio → confetti → gallery → envelope → dodge → main
   ============================================================ */

const $ = (sel) => document.querySelector(sel);
const rand = (min, max) => Math.random() * (max - min) + min;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
