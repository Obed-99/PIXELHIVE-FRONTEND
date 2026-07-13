// Generates PixelHive brand assets (icon, splash, favicon, PWA, android) from the teal/orange logo SVG.
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const MOBILE = require('path').join(__dirname, '..');

// The logo mark, drawn in a 360x360 box.
const MARK = `
  <defs>
    <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0EA5A4"/><stop offset="1" stop-color="#053A39"/>
    </linearGradient>
  </defs>
  <polygon points="327,180 307.3,253.5 253.5,307.3 180,327 106.5,307.3 52.7,253.5 33,180 52.7,106.5 106.5,52.7 180,33 253.5,52.7 307.3,106.5" fill="none" stroke="url(#tg)" stroke-width="13"/>
  <g id="blades">
    <path id="bl" d="M303.5,190.8 L267.7,92.3 L222.3,100.5 L268,161.3 Z" fill="url(#tg)"/>
    <use href="#bl" transform="rotate(60 180 180)"/>
    <use href="#bl" transform="rotate(120 180 180)"/>
    <use href="#bl" transform="rotate(180 180 180)"/>
    <use href="#bl" transform="rotate(240 180 180)"/>
    <use href="#bl" transform="rotate(300 180 180)"/>
  </g>
  <g transform="translate(0,-16)">
    <polygon points="152,159 170.2,169.5 170.2,190.5 152,201 133.8,190.5 133.8,169.5" fill="none" stroke="#0B6462" stroke-width="6"/>
    <polygon points="208,159 226.2,169.5 226.2,190.5 208,201 189.8,190.5 189.8,169.5" fill="none" stroke="#0B6462" stroke-width="6"/>
    <polygon points="180,191 198.2,201.5 198.2,222.5 180,233 161.8,222.5 161.8,201.5" fill="none" stroke="#0B6462" stroke-width="6"/>
  </g>
`;

// scale = fraction of the canvas the 360-box mark occupies; bg = null for transparent.
function svgCanvas(size, scale, bg) {
  const s = (size * scale) / 360;
  const off = (size - 360 * s) / 2;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
      (bg ? `<rect width="${size}" height="${size}" fill="${bg}"/>` : '') +
      `<g transform="translate(${off},${off}) scale(${s})">${MARK}</g></svg>`
  );
}

async function out(buf, file) {
  await sharp(buf).png().toFile(file);
  const kb = Math.round(fs.statSync(file).size / 1024);
  console.log('wrote', path.basename(file), kb + 'KB');
}

(async () => {
  // App icon: dark bg, mark at 80%
  await out(svgCanvas(1024, 0.8, '#0B0F14'), path.join(MOBILE, 'assets/icon.png'));
  // Splash: transparent, mark only (splash bg color set in app.json)
  await out(svgCanvas(1024, 0.9, null), path.join(MOBILE, 'assets/splash-icon.png'));
  // Favicon
  await out(svgCanvas(64, 0.85, '#0B0F14'), path.join(MOBILE, 'assets/favicon.png'));
  // PWA / home-screen icon
  await out(svgCanvas(1024, 0.8, '#0B0F14'), path.join(MOBILE, 'public/pixelhive-icon.png'));
  // Android adaptive: foreground mark small (safe zone), solid bg handled by color
  await out(svgCanvas(1024, 0.55, null), path.join(MOBILE, 'assets/android-icon-foreground.png'));
  await out(svgCanvas(1024, 1, '#0B0F14'), path.join(MOBILE, 'assets/android-icon-background.png'));
  console.log('done');
})().catch((e) => { console.error(e); process.exit(1); });
