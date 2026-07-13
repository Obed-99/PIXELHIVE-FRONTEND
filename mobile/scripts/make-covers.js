// Compresses the project cover photos from Downloads into assets/covers.
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets', 'covers');
const MAP = [
  ['C:/Users/HP/Downloads/Wedding highlight.jpg', 'wedding.jpg'],
  ['C:/Users/HP/Downloads/Graduation.jpg', 'graduation.jpg'],
  ['C:/Users/HP/Downloads/Brand promo.jpg', 'brand.jpg'],
  ['C:/Users/HP/Downloads/corporate promo.jpg', 'corporate.jpg'],
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const [src, name] of MAP) {
    await sharp(src, { failOn: 'none' })
      .resize({ width: 900 })
      .jpeg({ quality: 72 })
      .toFile(path.join(OUT, name));
    console.log(name, Math.round(fs.statSync(path.join(OUT, name)).size / 1024) + 'KB');
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
