// Generates the app icons from one SVG: a red 25 kg Olympic plate on the
// app's dark background. Run with `npm run icons`. If the Android project
// exists it also writes the launcher icons and the old-style splash images.
import sharp from 'sharp';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises';

sharp.cache(false); // don't keep files open: the splash images are rewritten in place

const BG = '#111416';
const RED = '#EF5D57';

// bg: 'square', 'rounded', 'circle' or null (transparent).
function svg(size, plateScale, bg = 'square') {
  const c = size / 2;
  const r = (size / 2) * plateScale;
  const back = bg === 'circle' ? `<circle cx="${c}" cy="${c}" r="${c}" fill="${BG}"/>`
    : bg ? `<rect width="${size}" height="${size}" rx="${bg === 'rounded' ? size * 0.22 : 0}" fill="${BG}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${back}
  <path fill="${RED}" fill-rule="evenodd" d="${ring(c, r, r * 0.2)}"/>
  <circle cx="${c}" cy="${c}" r="${r * 0.8}" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="${r * 0.07}"/>
  <circle cx="${c}" cy="${c}" r="${r * 0.36}" fill="none" stroke="#000" stroke-opacity=".22" stroke-width="${r * 0.05}"/>
</svg>`;
}

// A disc of radius r with a real hole of radius h, so the hole is
// transparent when there is no background.
const circlePath = (c, r) => `M${c - r} ${c}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
const ring = (c, r, h) => circlePath(c, r) + circlePath(c, h);

// Single-colour version for Android 13+ themed icons: only the alpha counts.
function mono(size, plateScale) {
  const c = size / 2;
  const r = (size / 2) * plateScale;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <mask id="m"><rect width="${size}" height="${size}" fill="#fff"/>
    <circle cx="${c}" cy="${c}" r="${r * 0.8}" fill="none" stroke="#000" stroke-width="${r * 0.07}"/>
    <circle cx="${c}" cy="${c}" r="${r * 0.36}" fill="none" stroke="#000" stroke-width="${r * 0.05}"/>
    <circle cx="${c}" cy="${c}" r="${r * 0.2}" fill="#000"/>
  </mask>
  <circle cx="${c}" cy="${c}" r="${r}" fill="#fff" mask="url(#m)"/>
</svg>`;
}

const png = (markup, file) => sharp(Buffer.from(markup)).png().toFile(file);

await mkdir('public/icons', { recursive: true });
await writeFile('public/icons/favicon.svg', svg(64, 0.8, 'rounded'));
await png(svg(512, 0.78), 'public/icons/icon-512.png');
await png(svg(192, 0.78), 'public/icons/icon-192.png');
await png(svg(512, 0.6), 'public/icons/maskable-512.png');
await png(svg(180, 0.74), 'public/icons/apple-touch-icon.png');
await mkdir('resources', { recursive: true });
await writeFile('resources/icon.svg', svg(1024, 0.78));
await writeFile('resources/icon-foreground.svg', svg(1024, 0.6, null));
console.log('Icons written to public/icons');

const RES = 'android/app/src/main/res';
if (existsSync(RES)) {
  const DENSITIES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
  for (const [name, k] of Object.entries(DENSITIES)) {
    const dir = `${RES}/mipmap-${name}`;
    await mkdir(dir, { recursive: true });
    await png(svg(48 * k, 0.72, 'rounded'), `${dir}/ic_launcher.png`);
    await png(svg(48 * k, 0.72, 'circle'), `${dir}/ic_launcher_round.png`);
    // Adaptive icon layers are 108 dp; launchers show the central 72 dp.
    await png(svg(108 * k, 0.44, null), `${dir}/ic_launcher_foreground.png`);
    await png(mono(108 * k, 0.44), `${dir}/ic_launcher_monochrome.png`);
  }
  // Splash images for Android 11 and older (12+ shows the launcher icon).
  for (const dir of (await readdir(RES)).filter((d) => d.startsWith('drawable'))) {
    const file = `${RES}/${dir}/splash.png`;
    if (!existsSync(file)) continue;
    const { width, height } = await sharp(await readFile(file)).metadata();
    const d = Math.round(Math.min(width, height) * 0.3);
    const plate = await sharp(Buffer.from(svg(d, 1, null))).png().toBuffer();
    await sharp({ create: { width, height, channels: 4, background: BG } })
      .composite([{ input: plate, left: Math.round((width - d) / 2), top: Math.round((height - d) / 2) }])
      .png().toFile(file + '.tmp');
    await rename(file + '.tmp', file);
  }
  console.log('Android launcher icons and splash written');
}
