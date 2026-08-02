import { Toc } from '@/lib/toc.js';

const DEFAULT_SELECTORS = 'h1,h2,h3';

/**
 * @param {?Element} tocRoot
 * @return {string}
 */
function resolveHeadingSelectors(tocRoot) {
  const fromData = tocRoot?.dataset?.tocSelectors?.trim();
  return fromData || DEFAULT_SELECTORS;
}

/**
 * 初始化文章目录（TOC）。
 * 窄屏抽屉显隐由 toc-drawer 负责；此处只要有 heading 即启用 scroll-spy。
 *
 * @param {{
 *   tocRoot: (?Element|undefined),
 *   articleBody: (?Element|undefined)
 * }=} options
 * @return {{destroy: function(): undefined}|null}
 */
export function init(options = {}) {
  const articleContent = options.articleBody
    ?? document.querySelector('.js-article-body');
  const tocRoot = options.tocRoot
    ?? document.querySelector('.js-aside-toc');

  if (!articleContent) {
    console.warn('[toc] article body not found');
    return null;
  }
  if (!tocRoot) {
    console.warn('[toc] toc root not found');
    return null;
  }

  const headingSelectors = resolveHeadingSelectors(tocRoot);
  const headingCount = articleContent.querySelectorAll(headingSelectors).length;
  if (headingCount === 0) {
    console.warn('[toc] no headings; skip render');
    return null;
  }

  const toc = new Toc(tocRoot, {
    selectors: headingSelectors,
    container: articleContent,
    disabled: false,
  });

  return {
    destroy() {
      toc.destroy();
    },
  };
}
