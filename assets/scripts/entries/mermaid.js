/**
 * @fileoverview Mermaid 入口——rem 字号、contain 适配，主题切换时重渲染。
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
