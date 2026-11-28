/**
 * Makes the app icons from the lit-sphere mark.
 *
 *   node scripts/icons.cjs
 *
 * Run it again only if the mark changes. The finished images are saved in the
 * project, so the live site never runs this.
 */
const fs = require("fs");
const sharp = require("sharp");

// The mark on the app's night-sky colour. `scale` shrinks the mark for icons that
// phones crop to a circle or rounded square, so nothing important is cut off.
const svg = (scale) => `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0a0e13"/>
  <g transform="translate(256 256) scale(${scale}) translate(-16 -16)" fill="none" stroke="#8fc6de" stroke-width="2.4" stroke-linecap="round">
    <circle cx="16" cy="16" r="12" stroke-opacity="0.32"/>
    <path d="M7.5 7.5a12 12 0 0 1 17 0"/>
  </g>
</svg>`;

const make = (file, size, scale) => sharp(Buffer.from(svg(scale))).resize(size, size).png().toFile(file);

(async () => {
  fs.mkdirSync("public/icons", { recursive: true });
  await make("src/app/icon.png", 256, 13); // browser tab
  await make("src/app/apple-icon.png", 180, 11); // iPhone home screen
  await make("public/icons/icon-192.png", 192, 12);
  await make("public/icons/icon-512.png", 512, 12);
  await make("public/icons/maskable-512.png", 512, 8.5); // Android, which crops to its own shape
  console.log("icons made");
})();
