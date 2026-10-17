import { init as initArticleAnchors } from '@/features/article-anchors.js';
import { init as initClipboard } from '@/features/clipboard.js';
import { init as initFloatingActions } from '@/features/floating-actions.js';
import { init as initFlyoutImages } from '@/features/flyout-images.js';
import { init as initReadingLayout } from '@/features/reading-layout.js';
import { observeNear } from '@/utils/near-viewport.js';

/**
 * @fileoverview 文章页入口——编排锚点、剪贴板、悬浮操作。
 */
document.addEventListener('DOMContentLoaded', () => {
  const articleBody = document.querySelector('.js-article-body');
  const shellMain = document.querySelector('.js-shell-main');
  initReadingLayout(articleBody);

  initArticleAnchors({ container: articleBody });
  initClipboard({ root: articleBody || document });
  initFloatingActions({ mountRoot: shellMain });
  initFlyoutImages({ root: document });
  observeNear(articleBody?.querySelectorAll('.js-swiper') || [], async (el) => {
    const { init } = await import('@/features/swiper.js');
    init({ root: el });
  });
});
