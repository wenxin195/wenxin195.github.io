/**
 * @fileoverview 灯箱 / 图库入口。
 */
import { init as initLightbox } from '@/features/lightbox.js';

document.addEventListener('DOMContentLoaded', () => {
  initLightbox({
    modalEl: document.querySelector('.js-lightbox-modal'),
    contentEl: document.querySelector('.js-article-body'),
    lockRoot: document.querySelector('.js-shell'),
    scrollElement: document.querySelector('.js-shell-main'),
  });
});
