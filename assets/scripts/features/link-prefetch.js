const LIST_LINK = '.article-list a[href]';
/** Intent-only prefetch; no automatic list downloads on constrained connections. */
export function init() {
  const seen = new Set();
  function prefetch(event) {
    const connection = navigator.connection;
    if (document.hidden || connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;
    const anchor = event.target.closest?.(LIST_LINK);
    if (!anchor) return;
    const url = new URL(anchor.href, location.href);
    url.hash = '';
    if (url.origin !== location.origin || url.pathname === location.pathname || seen.has(url.href) || seen.size >= 3) return;
    seen.add(url.href);
    const link = document.createElement('link');
    link.rel = 'prefetch'; link.href = url.href; link.fetchPriority = 'low';
    document.head.append(link);
  }
  for (const type of ['pointerover', 'pointerdown', 'focusin']) document.addEventListener(type, prefetch, { passive: true });
  return { destroy() { for (const type of ['pointerover', 'pointerdown', 'focusin']) document.removeEventListener(type, prefetch); } };
}
