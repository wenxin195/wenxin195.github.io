import { init as initAffix } from '@/features/affix.js';
import { init as initToc } from '@/features/toc.js';
import { init as initTocDrawer } from '@/features/toc-drawer.js';
import { SITE_EVENTS } from '@/features/events.js';

/**
 * @fileoverview 文章侧栏入口——吸顶 + 目录 + 窄屏 TOC 抽屉。
 * 契约：`≥ lg` 侧栏 + affix（面板视口钳制、列内贴底）；`< lg` 右抽屉 + FAB。
 * TOC 内容高度不得影响 document.scrollHeight。
 */
document.addEventListener('DOMContentLoaded', () => {
  const aside = document.querySelector('.js-article-aside');
  const tocRoot = document.querySelector('.js-aside-toc');
  const articleBody = document.querySelector('.js-article-body');
  const shellMain = document.querySelector('.js-shell-main');

  // Drawer first (strip modal on ≥ lg), then TOC render, then Affix on toc panel.
  initTocDrawer({
    drawerEl: aside,
    mountRoot: shellMain,
    lockRoot: document.querySelector('.js-shell'),
    scrollElement: shellMain,
  });
  initToc({ tocRoot, articleBody });
  initAffix({ element: tocRoot, aside });
  document.dispatchEvent(new CustomEvent(SITE_EVENTS.AFFIX_REFRESH));
});
