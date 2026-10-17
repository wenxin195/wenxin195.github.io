/** Bounded content-anchor restoration. User input always wins. */
export function init(root) {
  if (!root) return;
  const nodes = [...root.querySelectorAll('[data-reading-id]')];
  const key = `reading:${location.pathname}`;
  const signature = nodes.map((el) => el.dataset.readingId).join('|');
  let saved;
  try { saved = JSON.parse(sessionStorage.getItem(key)); } catch { /* optional storage */ }
  const navigation = performance.getEntriesByType('navigation')[0]?.type;
  let target, offset = 0;
  if (location.hash) {
    try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { /* bad hash */ }
  } else if (['reload', 'back_forward'].includes(navigation) && saved?.signature === signature && saved.width === innerWidth) {
    target = nodes.find((el) => el.dataset.readingId === saved.id);
    offset = saved.offset;
  }
  let active = !!target, frame = 0;
  const deadline = setTimeout(() => { active = false; }, 60000);
  function cancel() { active = false; }
  function correct() {
    frame = 0;
    if (active && target?.isConnected) {
      const delta = target.getBoundingClientRect().top - offset;
      if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: 'instant' });
    }
    document.dispatchEvent(new CustomEvent('site:layout-change'));
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(correct); }
  function remember() {
    if (active) return;
    const visible = nodes.filter((el) => { const r = el.getBoundingClientRect(); return r.height && r.bottom > 0 && r.top < innerHeight; });
    const el = visible.find((n) => n.getBoundingClientRect().top >= 0) || visible[0];
    if (!el) return;
    try { sessionStorage.setItem(key, JSON.stringify({ signature, width: innerWidth, id: el.dataset.readingId, offset: el.getBoundingClientRect().top })); } catch { /* quota/private mode */ }
  }
  const resize = new ResizeObserver(schedule);
  for (const el of nodes) resize.observe(el);
  const onPageShow = (event) => { if (event.persisted) active = false; schedule(); };
  const onVisibility = () => { if (document.hidden) remember(); };
  for (const name of ['wheel', 'touchstart', 'pointerdown', 'keydown']) window.addEventListener(name, cancel, { passive: true });
  window.addEventListener('pageshow', onPageShow);
  window.addEventListener('pagehide', remember);
  window.addEventListener('hashchange', cancel);
  window.addEventListener('resize', cancel);
  document.addEventListener('visibilitychange', onVisibility);
  schedule();
  return () => {
    clearTimeout(deadline); cancelAnimationFrame(frame); resize.disconnect();
    for (const name of ['wheel', 'touchstart', 'pointerdown', 'keydown']) window.removeEventListener(name, cancel);
    window.removeEventListener('pageshow', onPageShow);
    window.removeEventListener('pagehide', remember);
    window.removeEventListener('hashchange', cancel);
    window.removeEventListener('resize', cancel);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
