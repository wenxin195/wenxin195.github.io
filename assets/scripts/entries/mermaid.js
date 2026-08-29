/**
 * @fileoverview Mermaid 入口——rem 字号、viewBox 裁切、CSS contain，主题切换时重渲染。
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
