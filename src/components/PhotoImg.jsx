import { useEffect, useState } from 'preact/hooks';
import { getPhoto } from '../lib/db.js';

// Loads a photo blob from IndexedDB and shows it with an object URL.
export function PhotoImg({ id, alt, class: cls }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let u = null;
    let alive = true;
    if (id) {
      getPhoto(id).then((blob) => {
        if (alive && blob) { u = URL.createObjectURL(blob); setUrl(u); }
      }).catch(() => {});
    } else {
      setUrl(null);
    }
    return () => { alive = false; if (u) URL.revokeObjectURL(u); };
  }, [id]);
  if (!url) return <div class={(cls || '') + ' ph'} role="img" aria-label={alt || 'Sin foto'} />;
  return <img class={cls} src={url} alt={alt || ''} loading="lazy" />;
}
