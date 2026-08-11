import { Affix } from '@/lib/affix.js';
import { SITE_EVENTS } from '@/features/events.js';
import { matches, subscribe } from '@/utils/breakpoints.js';

/**
 * TOC 侧栏吸顶。仅 `≥ lg` 启用。
 *
 * 契约：
 * - Affix 挂在 `.js-aside-toc`（视口钳制后的面板），container 为 `.js-article-aside`
 *   （与正文同高的 stretch 列）。
 * - TOC 内容再长也只在面板内滚动；BOTTOM 为列内 absolute 贴底，不拉长文档滚动。
 *
 * @param {{
 *   element: (?Element|undefined),
 *   aside: (?Element|undefined),
 *   container: (?Element|undefined),
 *   offsetTop: (number|undefined),
 *   offsetBottom: (number|undefined)
 * }=} options
 * @return {{
 *   destroy: function(): undefined,
 *   refresh: function(): undefined,
 *   enable: function(): undefined,
 *   disable: function(): undefined
 * }|null}
 */
export function init(options = {}) {
  const affixEl = options.element
    ?? document.querySelector('.js-aside-toc');
  const container = options.container
    ?? options.aside
    ?? document.querySelector('.js-article-aside');

  if (!affixEl || !container) return null;

  let affix = null;

  try {
    affix = new Affix(affixEl, {
      container,
      offsetTop: options.offsetTop ?? 0,
      offsetBottom: options.offsetBottom ?? 0,
      disabled: !matches('upLg'),
    });
  } catch (e) {
    console.warn('[affix] init failed', e);
    return null;
  }

  const onRefreshRequest = () => {
    affix?.refresh();
  };

  document.addEventListener(SITE_EVENTS.AFFIX_REFRESH, onRefreshRequest);

  const unsubBreakpoint = subscribe('upLg', (isDesktop) => {
    if (!affix) return;
    if (isDesktop) {
      affix.enable();
    } else {
      affix.disable();
    }
  });

  // Panel size can change after TOC render / font load — refresh once laid out.
  requestAnimationFrame(() => {
    affix?.refresh();
  });

  return {
    refresh() {
      affix?.refresh();
    },
    enable() {
      affix?.enable();
    },
    disable() {
      affix?.disable();
    },
    destroy() {
      document.removeEventListener(SITE_EVENTS.AFFIX_REFRESH, onRefreshRequest);
      unsubBreakpoint();
      if (affix) {
        affix.destroy();
        affix = null;
      }
    },
  };
}
