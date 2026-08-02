/**
 * @fileoverview 站点搜索入口。
 */
import { init as initSearch } from '@/features/search.js';

document.addEventListener('DOMContentLoaded', () => {
  initSearch({
    modalEl: document.querySelector('.js-search-modal'),
    lockRoot: document.querySelector('.js-shell'),
    scrollElement: document.querySelector('.js-shell-main'),
    toggleEls: document.querySelectorAll('.js-search-toggle'),
  });
});
