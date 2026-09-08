/**
 * @fileoverview Mermaid 入口——首屏空闲后再拉 CDN，避免挡住进页。
 */
import { init as initMermaid } from '@/features/mermaid.js';

const entryScript = document.querySelector('script[data-mermaid-src]');
const mermaidSrc = entryScript?.getAttribute('data-mermaid-src');

/**
 * @param {function(): undefined} callback
 */
function whenIdle(callback) {
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(callback, { timeout: 2000 });
  } else {
    setTimeout(callback, 1);
  }
}

if (mermaidSrc) {
  document.addEventListener('DOMContentLoaded', () => {
    const root = document.querySelector('.js-article-body') ?? document;
    let started = false;

    const run = () => {
      if (started) return;
      started = true;
      initMermaid({ src: mermaidSrc, root }).catch((error) => {
        console.error('[mermaid] failed to render', error);
      });
    };

    if (typeof IntersectionObserver === 'function') {
      const diagrams = root.querySelectorAll('.mermaid');
      if (!diagrams.length) return;

      /** @type {number} */
      let fallback = 0;
      const observer = new IntersectionObserver((entries, obs) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        obs.disconnect();
        window.clearTimeout(fallback);
        whenIdle(run);
      }, { rootMargin: '200px 0px' });

      fallback = window.setTimeout(() => {
        observer.disconnect();
        whenIdle(run);
      }, 2500);

      diagrams.forEach((el) => observer.observe(el));
      return;
    }

    whenIdle(run);
  });
}
