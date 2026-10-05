// Hash navigation. Each history entry the app creates stores its depth in
// history.state, so the back arrows (and Android's back button) can return to
// the previous screen instead of piling up entries.
let depth = 0;
let replacing = false;

export function initNav() {
  const st = history.state;
  if (st && typeof st.depth === 'number') depth = st.depth;
  else history.replaceState({ depth: 0 }, '');
  window.addEventListener('hashchange', () => {
    const cur = history.state;
    if (cur && typeof cur.depth === 'number') depth = cur.depth; // back/forward
    else {
      if (!replacing) depth += 1;
      history.replaceState({ depth }, '');
    }
    replacing = false;
  });
}

// replace: the current screen is done (saved, discarded…), so going back
// should not return to it.
export function go(path, { replace = false } = {}) {
  const hash = '#/' + String(path).replace(/^\//, '');
  if (location.hash === hash) return;
  if (replace) {
    replacing = true;
    location.replace(hash);
  } else {
    location.hash = hash;
  }
}

export const canGoBack = () => depth > 0;

export function goBack(fallback = 'hoy') {
  if (depth > 0) history.back();
  else go(fallback, { replace: true });
}
