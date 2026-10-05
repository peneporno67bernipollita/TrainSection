// Saving and picking files on the web (PWA) and inside the Android app.

export const isNative = () => !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

const isTouch = () => matchMedia('(pointer: coarse)').matches;

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] || '');
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

// Text goes to the native side in slices: a backup with photos can be tens of
// MB and one huge bridge message can run the app out of memory.
const SLICE = 1 << 21;

async function writeNative(filename, data) {
  const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
  if (typeof data !== 'string') {
    const blob = data instanceof Blob ? data : new Blob([data]);
    return Filesystem.writeFile({ path: filename, data: await blobToBase64(blob), directory: Directory.Cache });
  }
  let written = null;
  let i = 0;
  do {
    let end = Math.min(data.length, i + SLICE);
    // Never split a surrogate pair (emoji) between two slices.
    if (end < data.length && /[\uD800-\uDBFF]/.test(data[end - 1])) end--;
    const opts = { path: filename, data: data.slice(i, end), directory: Directory.Cache, encoding: Encoding.UTF8 };
    if (i === 0) written = await Filesystem.writeFile(opts);
    else await Filesystem.appendFile(opts);
    i = end;
  } while (i < data.length);
  return written;
}

export async function saveFile(filename, data, mime = 'application/octet-stream') {
  if (isNative()) {
    const { Share } = await import('@capacitor/share');
    const written = await writeNative(filename, data);
    try {
      await Share.share({ title: filename, files: [written.uri] });
    } catch (e) {
      if (/cancel/i.test(String(e && e.message))) return 'cancelled';
      throw e;
    }
    return 'shared';
  }
  const blob = data instanceof Blob ? data : new Blob([data], { type: mime });
  const file = new File([blob], filename, { type: blob.type || mime });
  if (isTouch() && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename });
      return 'shared';
    } catch (e) {
      if (e && e.name === 'AbortError') return 'cancelled';
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return 'downloaded';
}

// Android app only: opens the file with the app for its type (a calendar for
// .ics). Rejects when no installed app can open it.
let openFilePlugin = null;
export async function openFile(filename, data, mime) {
  await writeNative(filename, data);
  if (!openFilePlugin) openFilePlugin = (await import('@capacitor/core')).registerPlugin('OpenFile');
  await openFilePlugin.open({ name: filename, mime });
}

// In the Android app the camera saves a full-size copy of every photo in the
// app's Pictures folder. We keep our own compressed copy, so clean them up.
export async function cleanCameraFiles() {
  if (!isNative()) return;
  try {
    const { Filesystem, Directory } = await import('@capacitor/filesystem');
    const { files } = await Filesystem.readdir({ path: 'Pictures', directory: Directory.External });
    for (const f of files) {
      if (/^JPEG_.*\.jpg$/i.test(f.name)) await Filesystem.deleteFile({ path: 'Pictures/' + f.name, directory: Directory.External });
    }
  } catch { /* no photos taken yet */ }
}

export function pickFile(accept, capture) {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    if (capture) input.setAttribute('capture', capture);
    input.style.display = 'none';
    input.addEventListener('change', () => {
      resolve(input.files && input.files[0] ? input.files[0] : null);
      input.remove();
    });
    input.addEventListener('cancel', () => { resolve(null); input.remove(); });
    document.body.appendChild(input);
    input.click();
  });
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

// 'shared', 'cancelled' (the person closed the share sheet) or 'unsupported'.
export async function shareText(title, text, url) {
  try {
    if (isNative()) {
      const { Share } = await import('@capacitor/share');
      await Share.share({ title, text, url });
      return 'shared';
    }
    if (!navigator.share) return 'unsupported';
    await navigator.share({ title, text, url });
    return 'shared';
  } catch (e) {
    const cancelled = (e && e.name === 'AbortError') || /cancel/i.test(String(e && e.message));
    return cancelled ? 'cancelled' : 'unsupported';
  }
}
