import { initHeadingAnchors } from '@/lib/anchor.js';

/**
 * 初始化正文标题锚点。
 * @param {{container: (?Element|undefined)}=} options
 * @return {{destroy: function(): undefined}|null}
 */
export function init(options = {}) {
  const container = options.container
    ?? document.querySelector('.js-article-body');

  if (!container) return null;

  const teardown = initHeadingAnchors(container);

  return {
    destroy() {
      if (typeof teardown === 'function') teardown();
    },
  };
}
