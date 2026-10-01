import { init as initToc } from '@/features/toc.js';
import { init as initTocDrawer } from '@/features/toc-drawer.js';

/**
 * @fileoverview 文章侧栏入口——目录 + 窄屏 TOC 抽屉。
 * 契约：`≥ lg` 侧栏 + CSS `position:sticky`（无 Affix / 无 fixed pin）；
 * `< lg` 右抽屉 + FAB。TOC 以 max-height 钳制，内部滚动。
 */
document.addEventListener('DOMContentLoaded', () => {
  const aside = document.querySelector('.js-article-aside');
  const tocRoot = document.querySelector('.js-aside-toc');
  const articleBody = document.querySelector('.js-article-body');
  const shellMain = document.querySelector('.js-shell-main');

  // Drawer first (strip modal on ≥ lg), then TOC hydrate.
  // Desktop pin is pure CSS sticky — do not init Affix.
  initTocDrawer({
    drawerEl: aside,
    mountRoot: shellMain,
    lockRoot: document.querySelector('.js-shell'),
    scrollElement: shellMain,
  });
  initToc({ tocRoot, articleBody });
});
