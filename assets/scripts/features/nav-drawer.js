import { Modal } from '@/lib/modal.js';
import { SITE_EVENTS } from '@/features/events.js';
import { matches, subscribe } from '@/utils/breakpoints.js';
import { setIcon } from '@/lib/icons.js';

/**
 * 站点导航左抽屉（`< md`）。与 TOC / 搜索互斥。
 *
 * @param {{
 *   drawerEl: (?Element|undefined),
 *   toggleEls: (!NodeList<!Element>|!Array<!Element>|undefined),
 *   lockRoot: (?Element|undefined),
 *   scrollElement: (?Element|undefined)
 * }=} options
 * @return {{destroy: function(): undefined, hide: function(): undefined}|null}
 */
export function init(options = {}) {
  const drawerEl = options.drawerEl
    ?? document.querySelector('.js-nav-drawer');
  if (!drawerEl) return null;

  const toggleEls = Array.from(
    options.toggleEls ?? document.querySelectorAll('.js-nav-toggle'),
  );

  const modal = new Modal(drawerEl, {
    closeOnBackdropClick: true,
    trapFocus: true,
    hideWhenWindowScroll: false,
    lockRoot: options.lockRoot ?? document.querySelector('.js-shell'),
    scrollElement: options.scrollElement ?? document.querySelector('.js-shell-main'),
  });

  const cleanups = [];

  /**
   * @param {boolean} open
   */
  function syncToggleUi(open) {
    toggleEls.forEach((el) => {
      el.setAttribute('aria-expanded', String(open));
      if (el.classList.contains('site-header__menu-toggle')) {
        el.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
        const icon = el.querySelector('[data-icon], .icon-lucide');
        if (icon) {
          setIcon(icon, open ? 'x' : 'menu');
        }
      }
    });
  }

  modal.on('beforeShow', () => {
    if (matches('upMd')) return false;
    document.dispatchEvent(
      new CustomEvent(SITE_EVENTS.DRAWER_OPEN, { detail: { source: 'nav' } }),
    );
  });

  modal.on('change', (open) => {
    syncToggleUi(!!open);
    document.dispatchEvent(
      new CustomEvent(SITE_EVENTS.NAV_DRAWER_CHANGE, { detail: { open: !!open } }),
    );
  });

  const onToggleClick = (event) => {
    event.preventDefault();
    if (matches('upMd')) return;
    modal.toggle();
  };

  toggleEls.forEach((el) => {
    el.addEventListener('click', onToggleClick);
  });
  cleanups.push(() => {
    toggleEls.forEach((el) => el.removeEventListener('click', onToggleClick));
  });

  const onLinkClick = (event) => {
    const link = event.target.closest?.('a[href]');
    if (!link || !drawerEl.contains(link)) return;
    modal.hide();
  };
  drawerEl.addEventListener('click', onLinkClick);
  cleanups.push(() => drawerEl.removeEventListener('click', onLinkClick));

  const onDrawerOpen = (event) => {
    if (event.detail?.source !== 'nav') modal.hide();
  };
  document.addEventListener(SITE_EVENTS.DRAWER_OPEN, onDrawerOpen);
  cleanups.push(() => document.removeEventListener(SITE_EVENTS.DRAWER_OPEN, onDrawerOpen));

  cleanups.push(
    subscribe('upMd', (isDesktopNav) => {
      if (isDesktopNav) modal.hide();
    }),
  );

  syncToggleUi(false);

  return {
    hide() {
      modal.hide();
    },
    destroy() {
      cleanups.forEach((fn) => fn());
      cleanups.length = 0;
      modal.destroy();
    },
  };
}
