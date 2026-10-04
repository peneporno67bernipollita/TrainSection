import qrcode from 'qrcode-generator';

// Returns an SVG string drawn with currentColor so it follows the theme.
// Returns null when the text is too long to fit in a scannable code.
export function qrSvg(text) {
  if (!text || text.length > 1800) return null;
  const qr = qrcode(0, 'L');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  let d = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c)) d += 'M' + c + ' ' + r + 'h1v1h-1z';
    }
  }
  const q = 4;
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + -q + ' ' + -q + ' ' + (n + 2 * q) + ' ' + (n + 2 * q) + '" shape-rendering="crispEdges" role="img" aria-label="Código QR">' +
    '<rect x="' + -q + '" y="' + -q + '" width="' + (n + 2 * q) + '" height="' + (n + 2 * q) + '" fill="#fff"/>' +
    '<path d="' + d + '" fill="#000"/></svg>';
}

export async function readQrFromFile(file) {
  const { default: jsQR } = await import('jsqr');
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h);
    const res = jsQR(data.data, w, h, { inversionAttempts: 'attemptBoth' });
    return res ? res.data : null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    img.src = src;
  });
}
