# "An Important Question 🩷" — Project Overview

A single-page, mobile-first web app: a playful girlfriend-proposal site. It will
mostly be opened from a QR code on a phone, so **phone portrait is the primary
viewport**; desktop is secondary. No dependencies, no build step — plain HTML +
CSS + vanilla JS, organized as:

```
/index.html      markup only
/css/styles.css  all styles (numbered sections + z-index contract at top)
/js/utils.js     $, rand(), reducedMotion — loaded first
/js/audio.js     Web Audio helpers, mp3-with-fallback players
/js/confetti.js  canvas particle system
/js/gallery.js   photo probing/loading (owns PHOTO_EXTENSIONS)
/js/envelope.js  float physics, catch/open/close cycle
/js/dodge.js     No-button chase + prompt escalation + blush
/js/main.js      init, ambience, screen flow, celebrate/sad — loaded last
/assets/         images, audio, photos/
```

The js/ files are **classic scripts sharing global scope, loaded in that
order** (utils → audio → confetti → gallery → envelope → dodge → main). This is
deliberate: ES modules would break if the page is ever opened via `file://`,
and the modules genuinely share state (`celebrate`, `surrendered`,
`PHOTO_EXTENSIONS`). Don't convert to `type="module"` without also accepting
the file:// limitation.

---

## 1. User flow (the "state machine")

```
┌─────────────┐  Continue  ┌──────────────────┐   Yes   ┌───────────────┐
│ 1. INTRO    │──────────▶│ 2. QUESTION       │────────▶│ 4. CELEBRATION │
│ #screen-intro│           │ #screen-question  │         │ #screen-yes    │
└─────────────┘           └──────────────────┘         └───────────────┘
                                │  No (after "LAST CHANCE")      ▲
                                ▼                                │
                          ┌──────────────────┐  "I change my mind!"
                          │ 3. SAD           │──────────────────┘
                          │ #screen-no       │
                          └──────────────────┘
```

Screens are sibling `<section class="screen">` elements, all `position: fixed;
inset: 0`. Exactly one has `.active` (opacity/visibility cross-fade, 0.6s).
`showScreen(id)` in JS swaps the class. There is no router, no URL state.

### Screen 1 — Intro
- Headline: "Hallo Lynnetty! I have a REALLY important question..."
- Character image (`chiikawa_idle.png`) with gentle bob animation.
- "Continue" button fades in after ~1s.

### Screen 2 — The Question ("May I be your boyfriend? :o")
The centerpiece interaction. Two buttons: **Yes 💖** and **No 😔**.
- The **No button dodges**. Desktop: flees when the cursor comes within a
  radius (110px). Mobile: `touchstart` fires before `click`, so the button
  teleports the moment a finger lands near it and the tap "misses".
- Dodge behaviors: random on-screen spot (never overlapping Yes, never
  off-screen), occasional shrink/rotate, occasional swap-places-with-Yes,
  "boing" sound each time. Throttled to one dodge per 250ms.
- **Escalation**: every 2nd dodge, the character's speech bubble shows the next
  prompt: "are you sure? 🥺" → "wait... you don't like me huh 😢" → "say you
  hate me SIGHH 😭" → "LAST CHANCE!! 🥺🩷". The first three auto-hide after
  2.6s; LAST CHANCE stays.
- Along the way the Yes button grows (dodge 4 → `scale 1.18`, dodge 8 →
  `scale 1.35`).
- At LAST CHANCE (dodge 8) the No button **stops dodging** and returns to its
  home slot — she gets a genuine choice. Clicking No then → Sad screen.
- Hovering/touching Yes makes the character blush (CSS class toggle).

### Screen 3 — Sad ("oh... okay 😔" / "breh...")
- Whole page goes grey: `body.sad` swaps the background gradient and hides the
  floating hearts. Character droops (slow sway + slight grayscale filter).
- Plays `breh.mp3` if present, else a descending "wah-wah" via Web Audio.
- Single button "Wait... I change my mind! 💗" → jumps to Celebration (and
  stops the sad audio).

### Screen 4 — Celebration ("HOORAYY!! 🩷")
Triggered by Yes (or the sad-screen reconsider button). Several things at once:
- `our_song.mp3` starts **looping** (allowed because it's user-gesture-initiated).
  Fallback: a generated Web Audio arpeggio chime.
- Canvas confetti (3 bursts, ~180 particles, hearts + rects) + emoji hearts
  floating up from the bottom.
- **Photo gallery**: a 2-column grid auto-populated from `photos/date1.jpg` …
  `photos/date24.jpg` (also tries .jpeg/.png and uppercase). Missing numbers
  are silently skipped. This screen is the only one that scrolls
  (`justify-content: flex-start; overflow-y: auto`).
- **The floating envelope** 💌: after 1.2s, a CSS-drawn sealed envelope detaches
  from the layout and drifts around the viewport DVD-screensaver style
  (~130px/s, bounces off edges, rAF loop). Tapping it = "catching" it: it
  glides to screen center, the flap opens, the letter slides out, and a
  full-screen overlay shows `letter.jpg` (a photo of a real handwritten
  letter). Closing the overlay re-seals the envelope and it flies off again —
  she has to catch it each time she wants to reread it.

### Global ambience
- Floating hearts/sparkles emoji rise continuously in the background
  (`#bg-decor`, spawned every 900ms, self-removing).
- All sounds are lazily created Web Audio oscillators unless a real mp3 exists.
- `prefers-reduced-motion`: all animations collapse to ~0s, the envelope
  doesn't float, decor doesn't spawn.

---

## 2. Asset convention (drop-in files, zero code changes)

Everything has a built-in fallback (inline SVG character, generated chime), so
the page works with no assets at all. Real files are detected at runtime by
probing (404s are expected and harmless):

| File | Used on |
|---|---|
| `assets/chiikawa_idle.png` | intro + question screens (APNG works — it's an `<img>`) |
| `assets/chiikawa_happy.png` | celebration screen |
| `assets/sad.gif` | sad screen |
| `assets/our_song.mp3` | celebration background song (loops) |
| `assets/breh.mp3` | sad screen voice clip |
| `assets/letter.jpg` (or .jpeg/.png) | inside the envelope overlay |
| `assets/photos/date1..24.{jpg,jpeg,png,JPG,JPEG,PNG}` | celebration gallery |

Images use a `.char-img` + `.char-placeholder` pattern: the `<img>` is hidden
until its `load` event adds `.loaded`, which also hides the sibling SVG
placeholder.

---

## 3. Notes for the UI/UX designer

**Current design language** (all defined in the `<style>` block):
- Palette: soft pastels. Pink gradient background (`#ffe9f3 → #fff6fb →
  #e8f4ff → #fdeffa`), primary pink `#e2749b`, accent pinks `#f26d9d`/`#f78fb5`,
  "No" periwinkle `#93a9e8`, text mauve `#7a5c6b`. Sad mode: desaturated
  grey-blues (`#eef0f5`, `#8a93a8`).
- Type: system stack "Trebuchet MS"/"Comic Sans MS"/"Segoe UI" — intentionally
  rounded/cute. All sizes use `clamp()` for phone→desktop scaling.
- Buttons: 999px pill radius, min 56px tall (thumb-friendly), gradient fills,
  soft drop + inset shadows, springy `cubic-bezier(.34,1.56,.64,1)` transforms.
  Yes idle-bounces to invite tapping.
- Motion is the personality: char bob, button bounce, dodge spring, envelope
  wiggle/flight, confetti, floating hearts. Anything you redesign should keep
  the springy overshoot feel.
- Polish already applied (July 2026 revamp):
  - Design tokens at `:root` in styles.css (palette, spacing scale, spring
    curves, shadows) — extend those rather than adding new hex values.
  - Speech bubble no longer collides with the headline (`#char-question`
    reserves headroom; bubble wraps on narrow phones instead of overflowing).
  - Headlines use `max-width: min(92vw, 24ch)` + `text-wrap: balance`.
  - Celebration hierarchy tightened: smaller character, smaller hearts row,
    quieter envelope hint, consistent 16px rhythm.
  - Landscape-phone media query (`orientation: landscape, max-height 520px`):
    vh-sized character, 3-column gallery, everything fits one screen height.
  - Letter close button is a 56px pink candy bubble with spring hover.

**Constraints to respect**: one-hand phone use, no scrolling anywhere except
the celebration screen, tap targets ≥ 56px, `prefers-reduced-motion` support,
`user-select: none` + `touch-action: manipulation` (no double-tap zoom).

---

## 4. Notes for the engineer (code organization)

The split described at the top of this document is done. Per-file notes:

- `js/utils.js` must stay first and `js/main.js` last in the `<script>` order;
  the comment in index.html documents the chain.
- Cross-module runtime calls (all resolved at call time, safe with classic
  scripts): dodge.js calls `goSad()` (main.js); main.js's `celebrate()` calls
  `launchConfetti()` (confetti.js), `buildPhotoGallery()` (gallery.js), and
  `startFloating()` (envelope.js); envelope.js reads `PHOTO_EXTENSIONS`
  (gallery.js) at load time — hence gallery loads before envelope.
- `surrendered` / `dodgeCount` couple the dodge system to the speech bubble
  (both inside dodge.js now).
- The z-index layering contract is documented at the top of `css/styles.css`:
  bg decor 0 → screens 1 → dodging No button 50 → celebrate hearts 60 →
  floating envelope 65 → confetti canvas 70 → letter overlay 90.

**Behavioral quirks to preserve**:
- The 404-probe asset pattern is intentional (console noise is expected).
- `touchstart` must keep firing before `click` for the mobile dodge to work;
  don't convert to pointer events without re-testing on a real phone.
- Audio contexts are created lazily on first user gesture (mobile autoplay
  policy). The celebration mp3 loops; the sad mp3 must stop on reconsider.
- The envelope float uses `left/top` + rAF (not transforms) because the
  `.caught` glide-to-center relies on transitioning those same properties, and
  `transform` is already used by the wiggle animation.
- Bug class to watch: Playwright/automation can't click the wiggling envelope
  or bouncing Yes without `force`/dispatch — fine for humans, relevant for
  tests.

**Testing**: there are Playwright smoke scripts (session scratchpad, not in
repo) that walk intro → dodge×8 → prompts → sad → reconsider → celebration →
catch envelope → letter → re-float. Worth committing a `tests/` folder with
that flow if the code gets reorganized.

**Deployment**: any static host works (Netlify Drop, GitHub Pages, Vercel).
No server, no env vars. Case-sensitive hosts are why `PHOTO_EXTENSIONS`
includes uppercase variants. `assets/photos/` currently has 13 images
(date2–date14; date1 is unused — the loader skips gaps by design).
