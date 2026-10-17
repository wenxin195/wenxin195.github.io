/** Queue visible work first, yielding between mounts. Failed items require explicit retry. */
export function observeNear(elements, load, { margin = Math.max(300, innerHeight * 0.75) } = {}) {
  const pending = new Set(elements), queue = new Set(), failed = new Set();
  let running = false, destroyed = false, observer;
  async function drain() {
    if (running || destroyed || document.hidden) return;
    running = true;
    while (queue.size && !destroyed && !document.hidden) {
      const el = [...queue].sort((a, b) => Math.abs(a.getBoundingClientRect().top) - Math.abs(b.getBoundingClientRect().top))[0];
      queue.delete(el);
      if (!pending.has(el)) continue;
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -margin || rect.top > innerHeight + margin) continue;
      try {
        await load(el);
        pending.delete(el);
        observer?.unobserve(el);
      } catch (error) {
        failed.add(el);
        el.dispatchEvent(new CustomEvent('site:load-error', { detail: error }));
      }
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
    running = false;
  }
  function check() {
    for (const el of pending) {
      const r = el.getBoundingClientRect();
      if (!failed.has(el) && r.bottom >= -margin && r.top <= innerHeight + margin) queue.add(el);
    }
    void drain();
  }
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting && !failed.has(entry.target)) queue.add(entry.target);
      void drain();
    }, { rootMargin: `${margin}px 0px` });
    for (const el of pending) observer.observe(el);
  } else window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('pageshow', check);
  window.addEventListener('resize', check);
  document.addEventListener('visibilitychange', check);
  check();
  return {
    retry(el) { failed.delete(el); if (pending.has(el)) queue.add(el); void drain(); },
    destroy() {
      destroyed = true;
      observer?.disconnect();
      queue.clear();
      window.removeEventListener('scroll', check);
      window.removeEventListener('pageshow', check);
      window.removeEventListener('resize', check);
      document.removeEventListener('visibilitychange', check);
    },
  };
}
