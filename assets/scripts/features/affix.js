import { Affix } from '@/lib/affix.js';
import { throttle } from '@/utils/throttle.js';
import { SITE_EVENTS } from '@/features/events.js';
import { matches, subscribe } from '@/utils/breakpoints.js';

/**
 * TOC 相对页脚的吸顶（affix）。仅 `≥ lg` 启用。
 * 必须挂在 `.js-aside-toc`（内容高度），不能挂 stretch 的 aside 列。
 *
 * @param {{
 *   element: (?Element|undefined),
 *   aside: (?Element|undefined),
 *   footer: (?Element|undefined)
 * }=} options
 * @return {{
 *   destroy: function(): undefined,
 *   refresh: function(): undefined,
 *   enable: function(): undefined,
 *   disable: function(): undefined
 * }|null}
 */
export function init(options = {}) {
  // Prefer TOC root — aside column is stretch-tall and breaks FIXED math.
  const affixEl = options.element
    ?? options.aside
    ?? document.querySelector('.js-aside-toc')
    ?? document.querySelector('.js-article-aside');
  const pageFooter = options.footer
    ?? document.querySelector('.js-site-footer');

  if (!affixEl || !pageFooter) return null;

  let affix = null;
  let footerObserver = null;

  try {
    affix = new Affix(affixEl, {
      offsetBottom: pageFooter.offsetHeight,
      disabled: !matches('upLg'),
    });
  } catch (e) {
    console.warn('[affix] init failed', e);
    return null;
  }

  if (typeof ResizeObserver !== 'undefined') {
    footerObserver = new ResizeObserver(
      throttle(function () {
        if (!affix) return;
        affix.offsetBottom = pageFooter.offsetHeight;
        affix.refresh();
      }, 200),
    );
    footerObserver.observe(pageFooter);
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
      if (footerObserver) {
        footerObserver.disconnect();
        footerObserver = null;
      }
    },
  };
}
