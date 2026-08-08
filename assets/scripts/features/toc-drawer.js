import { Modal } from '@/lib/modal.js';
import { SITE_EVENTS } from '@/features/events.js';
import { matches, subscribe } from '@/utils/breakpoints.js';
import { iconEl } from '@/lib/icons.js';

/** Match `$animation.duration` (panel slide) so focus lands after motion. */
const TOC_DRAWER_FOCUS_DELAY_MS = 400;

/**
 * TOC 右抽屉（`< lg`）：Modal + FAB + 点链关闭；与导航 / 搜索互斥。
 * `.modal` 写在 HTML 里（与 nav-drawer 一样），关闭态可先绘制；打开前 double-rAF
 * 再加 `modal--show`，避免面板过渡被跳过而「蹦出」。
 *
 * @param {{
 *   drawerEl: (?Element|undefined),
 *   mountRoot: (?Element|undefined),
 *   shellEl: (?Element|undefined),
 *   lockRoot: (?Element|undefined),
 *   scrollElement: (?Element|undefined)
 * }=} options
 * @return {{destroy: function(): undefined, hide: function(): undefined}|null}
 */
export function init(options = {}) {
  const drawerEl = options.drawerEl
    ?? document.querySelector('.js-toc-drawer');
  if (!drawerEl) return null;

  const mountRoot = options.mountRoot
    ?? document.querySelector('.js-shell-main')
    ?? document.body;

  const shellEl = options.shellEl
    ?? document.querySelector('.js-shell')
    ?? document.body;

  const homeParent = drawerEl.parentNode;
  const homeNext = drawerEl.nextSibling;

  const modal = new Modal(drawerEl, {
    closeOnBackdropClick: true,
    trapFocus: true,
    hideWhenWindowScroll: false,
    focusDelay: TOC_DRAWER_FOCUS_DELAY_MS,
    lockRoot: options.lockRoot ?? document.querySelector('.js-shell'),
    scrollElement: options.scrollElement ?? document.querySelector('.js-shell-main'),
  });

  const cleanups = [];
  let openRaf1 = 0;
  let openRaf2 = 0;

  function cancelScheduledOpen() {
    if (openRaf1) cancelAnimationFrame(openRaf1);
    if (openRaf2) cancelAnimationFrame(openRaf2);
    openRaf1 = 0;
    openRaf2 = 0;
  }

  /**
   * @param {boolean} isDesktop
   */
  function syncPortal(isDesktop) {
    if (isDesktop) {
      // Desktop sidebar must not keep overlay .modal chrome.
      drawerEl.classList.remove('modal');
      if (homeParent && drawerEl.parentNode !== homeParent) {
        homeParent.insertBefore(drawerEl, homeNext);
      }
      return;
    }

    drawerEl.classList.add('modal');
    if (drawerEl.parentNode !== shellEl) {
      shellEl.appendChild(drawerEl);
    }
  }

  let floatingHost = mountRoot.querySelector('.floating-actions');
  let createdHost = false;
  if (!floatingHost) {
    floatingHost = document.createElement('div');
    floatingHost.className = 'floating-actions';
    mountRoot.appendChild(floatingHost);
    createdHost = true;
  }

  const tocButton = document.createElement('button');
  tocButton.type = 'button';
  tocButton.className = 'float-btn float-btn--toc js-toc-toggle visible';
  tocButton.setAttribute('aria-label', '打开目录');
  tocButton.setAttribute('aria-controls', 'article-toc-panel');
  tocButton.setAttribute('aria-expanded', 'false');
  tocButton.appendChild(iconEl('list'));
  floatingHost.insertBefore(tocButton, floatingHost.firstChild);

  /**
   * @param {boolean} open
   */
  function syncToggleUi(open) {
    document.querySelectorAll('.js-toc-toggle').forEach((el) => {
      el.setAttribute('aria-expanded', String(open));
    });
    tocButton.setAttribute('aria-label', open ? '关闭目录' : '打开目录');
  }

  /**
   * @param {boolean} isDesktop
   */
  function syncBreakpoint(isDesktop) {
    cancelScheduledOpen();
    syncPortal(isDesktop);

    if (isDesktop) {
      modal.hide();
      drawerEl.removeAttribute('role');
      drawerEl.removeAttribute('aria-modal');
      drawerEl.removeAttribute('aria-hidden');
    } else {
      drawerEl.setAttribute('role', 'dialog');
      drawerEl.setAttribute('aria-modal', 'true');
      drawerEl.setAttribute('aria-hidden', String(!modal.visible));
    }
  }

  /**
   * Ensure closed drawer (opacity 0 + panel off-screen) is painted, then show.
   */
  function scheduleOpen() {
    if (matches('upLg') || modal.visible) return;

    syncPortal(false);
    cancelScheduledOpen();

    openRaf1 = requestAnimationFrame(() => {
      openRaf1 = 0;
      openRaf2 = requestAnimationFrame(() => {
        openRaf2 = 0;
        if (!matches('upLg') && !modal.visible) {
          modal.show();
        }
      });
    });
  }

  modal.on('beforeShow', () => {
    if (matches('upLg')) return false;
    syncPortal(false);
    document.dispatchEvent(
      new CustomEvent(SITE_EVENTS.DRAWER_OPEN, { detail: { source: 'toc' } }),
    );
  });

  modal.on('change', (open) => {
    syncToggleUi(!!open);
    if (!matches('upLg')) {
      drawerEl.setAttribute('aria-hidden', String(!open));
    }
    document.dispatchEvent(
      new CustomEvent(SITE_EVENTS.TOC_DRAWER_CHANGE, { detail: { open: !!open } }),
    );
  });

  const onFabClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (matches('upLg')) return;

    if (modal.visible) {
      cancelScheduledOpen();
      modal.hide();
      return;
    }

    scheduleOpen();
  };
  tocButton.addEventListener('click', onFabClick);
  cleanups.push(() => tocButton.removeEventListener('click', onFabClick));

  const onCloseClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    cancelScheduledOpen();
    modal.hide();
  };
  drawerEl.querySelectorAll('.article-aside__close.js-toc-toggle').forEach((btn) => {
    btn.addEventListener('click', onCloseClick);
    cleanups.push(() => btn.removeEventListener('click', onCloseClick));
  });

  const tocRoot = drawerEl.querySelector('.js-aside-toc');
  const onTocLinkClickCapture = (event) => {
    const link = event.target.closest?.('a[href^="#"]');
    if (!link || !tocRoot?.contains(link)) return;
    cancelScheduledOpen();
    modal.hide({ restoreScroll: false });
  };
  if (tocRoot) {
    tocRoot.addEventListener('click', onTocLinkClickCapture, true);
    cleanups.push(() => {
      tocRoot.removeEventListener('click', onTocLinkClickCapture, true);
    });
  }

  const onDrawerOpen = (event) => {
    if (event.detail?.source !== 'toc') {
      cancelScheduledOpen();
      modal.hide();
    }
  };
  document.addEventListener(SITE_EVENTS.DRAWER_OPEN, onDrawerOpen);
  cleanups.push(() => document.removeEventListener(SITE_EVENTS.DRAWER_OPEN, onDrawerOpen));

  cleanups.push(
    subscribe('upLg', (isDesktop) => {
      syncBreakpoint(isDesktop);
    }),
  );

  syncBreakpoint(matches('upLg'));
  syncToggleUi(false);

  return {
    hide() {
      cancelScheduledOpen();
      modal.hide();
    },
    destroy() {
      cancelScheduledOpen();
      cleanups.forEach((fn) => fn());
      cleanups.length = 0;
      tocButton.remove();
      if (createdHost) floatingHost.remove();
      modal.destroy();
      if (homeParent && drawerEl.parentNode !== homeParent) {
        homeParent.insertBefore(drawerEl, homeNext);
      }
    },
  };
}
