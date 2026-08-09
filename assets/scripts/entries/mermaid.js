/**
 * @fileoverview Mermaid 入口——按站点主题渲染 / 重渲染图示。
 */
import { init as initMermaid } from '@/features/mermaid.js';

const entryScript = document.querySelector('script[data-mermaid-src]');
const mermaidSrc = entryScript?.getAttribute('data-mermaid-src');

if (mermaidSrc) {
  document.addEventListener('DOMContentLoaded', () => {
    initMermaid({
      src: mermaidSrc,
      root: document.querySelector('.js-article-body') ?? document,
    });
  });
}
