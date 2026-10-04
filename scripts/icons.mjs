// Generates the app icons from one SVG: a red 25 kg Olympic plate on the
// app's dark background. Run with `npm run icons`.
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

const BG = '#111416';
const RED = '#EF5D57';

function svg(size, plateScale, rounded) {
  const c = size / 2;
  const r = (size / 2) * plateScale;
  const rx = rounded ? size * 0.22 : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${rx}" fill="${BG}"/>
  <circle cx="${c}" cy="${c}" r="${r}" fill="${RED}"/>
  <circle cx="${c}" cy="${c}" r="${r * 0.8}" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="${r * 0.07}"/>
  <circle cx="${c}" cy="${c}" r="${r * 0.36}" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="${r * 0.05}"/>
  <circle cx="${c}" cy="${c}" r="${r * 0.2}" fill="${BG}"/>
</svg>`;
}

await mkdir('public/icons', { recursive: true });
await writeFile('public/icons/favicon.svg', svg(64, 0.8, true));
await sharp(Buffer.from(svg(512, 0.78, false))).png().toFile('public/icons/icon-512.png');
await sharp(Buffer.from(svg(192, 0.78, false))).png().toFile('public/icons/icon-192.png');
await sharp(Buffer.from(svg(512, 0.6, false))).png().toFile('public/icons/maskable-512.png');
await sharp(Buffer.from(svg(180, 0.74, false))).png().toFile('public/icons/apple-touch-icon.png');
// Source for the Android launcher icons (see scripts/android-icons.mjs).
await mkdir('resources', { recursive: true });
await writeFile('resources/icon.svg', svg(1024, 0.78, false));
await writeFile('resources/icon-foreground.svg', svg(1024, 0.6, false).replace(/<rect[^>]*\/>/, ''));
console.log('Icons written to public/icons');
