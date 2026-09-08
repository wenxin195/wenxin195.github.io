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
    const run = () => {
      initMermaid({ src: mermaidSrc, root });
    };

    if (typeof IntersectionObserver === 'function') {
      const diagrams = root.querySelectorAll('.mermaid');
      if (!diagrams.length) return;

      const observer = new IntersectionObserver((entries, obs) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        obs.disconnect();
        whenIdle(run);
      }, { rootMargin: '200px 0px' });

      diagrams.forEach((el) => observer.observe(el));
      return;
    }

    whenIdle(run);
  });
}
