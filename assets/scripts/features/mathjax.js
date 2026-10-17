import { loadScript } from '@/utils/load-script.js';
import { observeNear } from '@/utils/near-viewport.js';

/** Keep MathJax's SVG lazy output, while reserving the source blocks' geometry. */
export function init({ root, src }) {
  if (!root || !src) return;
  const blocks = [...root.querySelectorAll('[data-math-block], p, li, td, th, figcaption')].filter((el) =>
    !el.closest('pre, code, [data-component]') && !el.querySelector('[data-math-block], p, li')
    && /\$|\\\[|\\\(|\\(?:eq)?ref\{/.test(el.textContent));
  if (!blocks.length) return;
  const labels = new Map();
  for (const block of blocks) for (const match of block.textContent.matchAll(/\\label\{([^}]+)\}/g)) labels.set(match[1], block);
  const config = window.MathJax;
  if (!config || config.startup?.document) return;
  let key = `math-sizes:${location.pathname}:${innerWidth}`;
  let sizes = {};
  try { sizes = JSON.parse(sessionStorage.getItem(key)) || {}; } catch { /* optional */ }
  for (const el of blocks) {
    const id = el.dataset.readingId;
    const height = Math.max(el.getBoundingClientRect().height, sizes[id] || 0);
    el.style.minHeight = `${Math.ceil(height)}px`;
    el.dataset.mathReserved = 'true';
  }
  let saveTimer;
  const resize = new ResizeObserver((entries) => {
    for (const { target } of entries) {
      if (target.dataset.readingId) sizes[target.dataset.readingId] = Math.ceil(target.getBoundingClientRect().height);
    }
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { sessionStorage.setItem(key, JSON.stringify(sizes)); } catch { /* quota */ }
      document.dispatchEvent(new CustomEvent('site:layout-change'));
    }, 100);
  });
  blocks.forEach((el) => resize.observe(el));
  const scheduled = new WeakSet();
  config.options = {
    ...config.options,
    lazyMargin: `${Math.max(300, innerHeight * 0.75)}px`,
    renderActions: {
      // MathJax 4.1.1 ui/lazy's MathItem flags. Compile TeX in document order
      // for numbering/forward references, but leave expensive SVG output lazy.
      compileReferences: [15, (doc) => {
        for (const item of doc.math) if ('lazyCompile' in item) item.lazyCompile = false;
        if (!scheduled.has(doc)) {
          scheduled.add(doc);
          const compile = doc.compileMath.bind(doc);
          let sliceStart = performance.now();
          doc.compileMath = (item) => {
            // Use MathJax's own retry protocol: completed items retain their
            // state and numbering, while the browser can paint between slices.
            if (item.state() < 20 && performance.now() - sliceStart > 12) {
              const retry = new Error('Yield formula compilation');
              retry.retry = new Promise((resolve) => setTimeout(() => {
                sliceStart = performance.now(); resolve();
              }, 0));
              throw retry;
            }
            return compile(item);
          };
        }
      }, '', false],
    },
  };
  config.startup = { ...config.startup, elements: [root] };
  let started = false;
  async function start() {
    if (started) return;
    started = true;
    try {
      await loadScript(src);
      await window.MathJax.startup.promise;
      root.dataset.mathReady = 'true';
      document.dispatchEvent(new CustomEvent('site:layout-change'));
    } catch (error) {
      // Keep the failed attempt latched: several nearby blocks must not each
      // start a request and insert a new notice. Only explicit retry resets it.
      const notice = document.createElement('p');
      notice.className = 'resource-error';
      notice.setAttribute('role', 'status');
      notice.append('公式暂时无法排版，原文仍可阅读。');
      const retry = document.createElement('button');
      retry.type = 'button'; retry.textContent = '重试';
      retry.addEventListener('click', () => { started = false; notice.remove(); void start(); }, { once: true });
      notice.append(retry); root.prepend(notice);
    }
  }
  observeNear(blocks, start);
  // Forward equation links can point to output that has not entered the viewport.
  root.addEventListener('click', (event) => {
    const link = event.target.closest?.('a');
    const href = link?.getAttribute('href') || link?.getAttribute('xlink:href');
    if (!href?.startsWith('#mjx-eqn')) return;
    let id;
    try { id = decodeURIComponent(href.slice(1)); } catch { return; }
    if (document.getElementById(id)) return;
    const label = id.replace(/^mjx-eqn:/, '');
    const block = labels.get(label);
    if (block) { event.preventDefault(); block.scrollIntoView({ behavior: 'instant', block: 'center' }); }
  });
  window.addEventListener('resize', () => {
    key = `math-sizes:${location.pathname}:${innerWidth}`;
    sizes = {};
    // A different width invalidates measured line wrapping. Let CSS reflow first.
    for (const el of blocks) el.style.minHeight = '';
    requestAnimationFrame(() => {
      for (const el of blocks) el.style.minHeight = `${Math.ceil(el.getBoundingClientRect().height)}px`;
    });
  });
}
