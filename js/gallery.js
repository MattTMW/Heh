"use strict";

/* ============================================================
   PHOTO GALLERY — celebration-screen memory photos
   Probes assets/photos/date1..24 in half steps (date1, date1.5,
   date2, ...) in each extension — the .5 slots let a photo be
   inserted between two numbers without renumbering everything.
   Numbers that don't exist in any extension are silently skipped,
   so photos can be added/removed with zero code changes. The
   resulting 404s in the console are intentional — do not "fix"
   them.
   ============================================================ */

/* Uppercase variants included: deployed hosts (Netlify, GitHub Pages)
   are case-sensitive, and iPhone exports are often .JPG */
const PHOTO_EXTENSIONS = ["jpg", "jpeg", "png", "JPG", "JPEG", "PNG"];
const MAX_PHOTOS = 24;
let galleryBuilt = false;

function buildPhotoGallery() {
  if (galleryBuilt) return;
  galleryBuilt = true;

  const gallery = $("#photo-gallery");
  // Half steps: i renders as "1", "1.5", "2", ... in the filename
  for (let i = 1; i <= MAX_PHOTOS; i += 0.5) {
    const img = document.createElement("img");
    img.alt = "A memory from one of our dates";
    img.loading = "lazy";
    img.addEventListener("load", () => img.classList.add("loaded"));

    let extIndex = 0;
    img.addEventListener("error", () => {
      extIndex++;
      if (extIndex >= PHOTO_EXTENSIONS.length) { img.remove(); return; }
      img.src = `assets/photos/date${i}.${PHOTO_EXTENSIONS[extIndex]}`;
    });

    gallery.appendChild(img);
    img.src = `assets/photos/date${i}.${PHOTO_EXTENSIONS[extIndex]}`;
  }
}
