import { observeNear } from '@/utils/near-viewport.js';
import { importModule } from '@/utils/import-module.js';
const src = document.querySelector('script[data-mermaid-src]')?.dataset.mermaidSrc;
const root = document.querySelector('.js-article-body');
if (src && root) {
  const cleanups = [];
  let zoom, zoomPromise;
  const nodes = [...root.querySelectorAll('.mermaid')];
  const sources = new Map(nodes.map((el) => [el, el.textContent]));
  const observer = observeNear(nodes, async (el) => {
    el.setAttribute('aria-busy', 'true');
    try {
      const { init } = await importModule(new URL('../features/mermaid.js', import.meta.url));
      const instance = await init({ src, root: el, onRendered() {
        el.removeAttribute('aria-busy');
        zoom?.refresh();
        document.dispatchEvent(new CustomEvent('site:layout-change'));
      } });
      cleanups.push(() => instance?.destroy());
      el.tabIndex = 0;
    } catch (error) {
      el.removeAttribute('aria-busy');
      el.dataset.loadError = 'true';
      el.textContent = sources.get(el);
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = '图表加载失败，点击重试';
      button.className = 'resource-error';
      button.addEventListener('click', () => {
        button.remove(); delete el.dataset.loadError;
        el.removeAttribute('data-processed'); el.textContent = sources.get(el);
        observer.retry(el);
      }, { once: true });
      el.after(button);
      throw error;
    }
  });
  root.addEventListener('click', async (event) => {
    const diagram = event.target.closest?.('.mermaid[data-processed]');
    if (!diagram || zoom) return;
    if (event.target.closest('a, button')) return;
    event.preventDefault(); event.stopImmediatePropagation();
    if (!zoomPromise) zoomPromise = importModule(new URL('../features/mermaid-zoom.js', import.meta.url)).then(({ init }) => {
      zoom = init({ root, modalEl: document.querySelector('.js-mermaid-zoom-modal'),
        stageEl: document.querySelector('.js-mermaid-zoom-stage'), closeEl: document.querySelector('.js-mermaid-zoom-close'),
        lockRoot: document.querySelector('.js-shell'), scrollElement: document.querySelector('.js-shell-main') });
      return zoom;
    }).catch((error) => { zoomPromise = null; throw error; });
    try { await zoomPromise; if (zoom) diagram.click(); } catch { /* A later click retries. */ }
  }, true);
  root.addEventListener('keydown', (event) => {
    if (event.target.matches?.('.mermaid[data-processed]') && ['Enter', ' '].includes(event.key)) {
      event.preventDefault(); event.target.click();
    }
  });
  window.addEventListener('pagehide', (event) => {
    if (event.persisted) return;
    observer.destroy(); cleanups.forEach((destroy) => destroy()); zoom?.destroy();
  });
}
