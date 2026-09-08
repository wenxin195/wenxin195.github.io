const LIST_LINK = '.article-list a[href]';
const IDLE_PREFETCH_LIMIT = 3;

/**
 * Prefetch article-list URLs after the current page has loaded.
 * Chromium: Speculation Rules (moderate / hover). Others: idle + pointer.
 * @return {{destroy: function(): undefined}}
 */
export function init() {
  const seen = new Set();
  let idleId = 0;
  let idleTimeoutId = 0;
  let usedSpeculation = false;

  /**
   * @return {boolean}
   */
  function supportsSpeculationRules() {
    return typeof HTMLScriptElement !== 'undefined'
      && typeof HTMLScriptElement.supports === 'function'
      && HTMLScriptElement.supports('speculationrules');
  }

  function injectSpeculationRules() {
    if (!document.querySelector(LIST_LINK)) return;
    const el = document.createElement('script');
    el.type = 'speculationrules';
    el.textContent = JSON.stringify({
      prefetch: [{
        source: 'document',
        eagerness: 'moderate',
        where: { selector_matches: LIST_LINK },
      }],
    });
    document.head.appendChild(el);
    usedSpeculation = true;
  }

  /**
   * @param {string} href
   * @return {boolean}
   */
  function prefetch(href) {
    let url;
    try {
      url = new URL(href, location.href);
    } catch {
      return false;
    }
    if (url.origin !== location.origin) return false;
    if (url.hash && url.pathname === location.pathname) return false;
    if (seen.has(url.href)) return false;
    seen.add(url.href);

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url.href;
    document.head.appendChild(link);
    return true;
  }

  /**
   * @param {!Event} event
   */
  function onPointerIntent(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest(LIST_LINK);
    if (!anchor) return;
    prefetch(anchor.href);
  }

  function prefetchVisibleList() {
    const anchors = document.querySelectorAll(LIST_LINK);
    let count = 0;
    for (const anchor of anchors) {
      if (prefetch(anchor.href)) count += 1;
      if (count >= IDLE_PREFETCH_LIMIT) break;
    }
  }

  function scheduleIdlePrefetch() {
    if (typeof requestIdleCallback === 'function') {
      idleId = requestIdleCallback(prefetchVisibleList, { timeout: 2500 });
    } else {
      idleTimeoutId = window.setTimeout(prefetchVisibleList, 1);
    }
  }

  /**
   * @param {function(): undefined} callback
   */
  function afterLoad(callback) {
    if (document.readyState === 'complete') {
      callback();
      return;
    }
    window.addEventListener('load', callback, { once: true });
  }

  afterLoad(() => {
    if (supportsSpeculationRules()) {
      injectSpeculationRules();
      return;
    }
    document.addEventListener('pointerdown', onPointerIntent, true);
    document.addEventListener('pointerenter', onPointerIntent, true);
    scheduleIdlePrefetch();
  });

  return {
    destroy() {
      if (!usedSpeculation) {
        document.removeEventListener('pointerdown', onPointerIntent, true);
        document.removeEventListener('pointerenter', onPointerIntent, true);
      }
      if (idleId && typeof cancelIdleCallback === 'function') {
        cancelIdleCallback(idleId);
      }
      if (idleTimeoutId) window.clearTimeout(idleTimeoutId);
    },
  };
}
