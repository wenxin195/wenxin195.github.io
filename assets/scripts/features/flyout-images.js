/**
 * Load WeChat QR / donate images after the page is usable.
 * Not on first paint, and not waiting for hover.
 *
 * @param {{root: (?ParentNode|undefined)}=} options
 * @return {{destroy: function(): undefined}}
 */
export function init(options = {}) {
  const root = options.root ?? document;
  let idleId = 0;
  let timeoutId = 0;
  let hydrated = false;

  /**
   * @return {undefined}
   */
  function hydrate() {
    if (hydrated) return;
    hydrated = true;

    root.querySelectorAll('img[data-src]').forEach((img) => {
      const src = img.getAttribute('data-src');
      if (!src) return;
      img.setAttribute('fetchpriority', 'low');
      img.decoding = 'async';
      img.src = src;
      img.removeAttribute('data-src');
    });
  }

  /**
   * @return {undefined}
   */
  function scheduleIdle() {
    if (typeof requestIdleCallback === 'function') {
      idleId = requestIdleCallback(hydrate, { timeout: 2500 });
    } else {
      timeoutId = window.setTimeout(hydrate, 1);
    }
  }

  /**
   * If the user opens the flyout before idle runs, start the request then.
   * @param {!Event} event
   */
  function onIntent(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (!target.closest('.share__wechat, .appreciate, .floating-actions')) return;
    hydrate();
  }

  // Start after first paint/DOM readiness, not window.load (which waits on unrelated assets).
  requestAnimationFrame(() => requestAnimationFrame(scheduleIdle));
  for (const type of ['pointerover', 'pointerdown', 'focusin']) root.addEventListener(type, onIntent, true);

  return {
    destroy() {
      for (const type of ['pointerover', 'pointerdown', 'focusin']) root.removeEventListener(type, onIntent, true);
      if (idleId && typeof cancelIdleCallback === 'function') {
        cancelIdleCallback(idleId);
      }
      if (timeoutId) window.clearTimeout(timeoutId);
    },
  };
}
