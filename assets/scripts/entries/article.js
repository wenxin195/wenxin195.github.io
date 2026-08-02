import { init as initArticleAnchors } from '@/features/article-anchors.js';
import { init as initClipboard } from '@/features/clipboard.js';
import { init as initFloatingActions } from '@/features/floating-actions.js';

/**
 * @fileoverview 文章页入口——编排锚点、剪贴板、悬浮操作。
 */
document.addEventListener('DOMContentLoaded', () => {
  const articleBody = document.querySelector('.js-article-body');
  const shellMain = document.querySelector('.js-shell-main');

  initArticleAnchors({ container: articleBody });
  initClipboard({ root: articleBody || document });
  initFloatingActions({ mountRoot: shellMain });
});
