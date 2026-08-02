/**
 * @fileoverview 主题切换入口。
 */
import { init as initTheme } from '@/features/theme.js';

document.addEventListener('DOMContentLoaded', () => {
  const rootTheme = document.documentElement.getAttribute('data-theme');

  initTheme({
    toggleEl: document.querySelector('.js-theme-toggle'),
    storageKey: 'site-theme',
    defaultTheme: rootTheme,
  });
});
