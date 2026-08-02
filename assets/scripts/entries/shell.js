/**
 * @fileoverview 壳层入口——外链加固 + 导航抽屉。
 */
import { init as initShellLinks } from '@/features/shell-links.js';
import { init as initNavDrawer } from '@/features/nav-drawer.js';

document.addEventListener('DOMContentLoaded', () => {
  initShellLinks();
  initNavDrawer({
    drawerEl: document.querySelector('.js-nav-drawer'),
    toggleEls: document.querySelectorAll('.js-nav-toggle'),
    lockRoot: document.querySelector('.js-shell'),
    scrollElement: document.querySelector('.js-shell-main'),
  });
});
