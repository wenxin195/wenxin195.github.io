import { Modal } from '@/lib/modal.js';
import { getBaseUrl } from '@/utils/baseUrl.js';
import { isFormElement } from '@/utils/dom.js';
import { getLazyload } from '@/utils/lazyload.js';
import { SITE_EVENTS } from '@/features/events.js';

const SEARCH_HOTKEYS = new Set(['s', 'S', '/']);
const SEARCH_PLACEHOLDER = '搜索文章标题和内容...';

/**
 * 站点搜索弹层（Pagefind Modular UI，预加载 + 占位输入框）。
 * @param {{
 *   modalEl: (?Element|undefined),
 *   lockRoot: (?Element|undefined),
 *   scrollElement: (?Element|undefined),
 *   toggleEls: (!NodeList<!Element>|!Array<!Element>|undefined)
 * }=} options
 * @return {{destroy: function(): undefined}|null}
 */
export function init(options = {}) {
  const searchModalEl = options.modalEl
    ?? document.querySelector('.js-search-modal');
  if (!searchModalEl) return null;

  const searchModal = new Modal(searchModalEl, {
    hideWhenWindowScroll: true,
    closeOnBackdropClick: true,
    trapFocus: false,
    lockRoot: options.lockRoot ?? document.querySelector('.js-shell'),
    scrollElement: options.scrollElement ?? document.querySelector('.js-shell-main'),
  });

  searchModal.on('beforeShow', () => {
    document.dispatchEvent(
      new CustomEvent(SITE_EVENTS.DRAWER_OPEN, { detail: { source: 'search' } }),
    );
  });

  /** @type {?Promise<undefined>} */
  let pagefindLoadPromise = null;
  let idleCallbackId = 0;
  let idleTimeoutId = 0;

  function getPagefindInput() {
    return document.querySelector('#pagefind-search-input input');
  }

  function focusSearchInput() {
    const input = getPagefindInput();
    if (input) input.focus();
  }

  function clearPagefindSearch() {
    const input = getPagefindInput();
    if (input) {
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function mountPagefindUI() {
    if (typeof PagefindModularUI === 'undefined') {
      throw new Error('PagefindModularUI missing');
    }

    const inputRoot = document.querySelector('#pagefind-search-input');
    const pendingValue = inputRoot?.querySelector('input')?.value ?? '';
    const pagefindInstance = new PagefindModularUI.Instance({
      bundlePath: getBaseUrl() + '/pagefind/',
      resetStyles: false,
    });

    inputRoot?.replaceChildren();

    pagefindInstance.add(new PagefindModularUI.Input({
      containerElement: '#pagefind-search-input',
      placeholder: SEARCH_PLACEHOLDER,
    }));

    pagefindInstance.add(new PagefindModularUI.Summary({
      containerElement: '#pagefind-search-summary',
    }));

    pagefindInstance.add(new PagefindModularUI.ResultList({
      containerElement: '#pagefind-search-results',
      showImages: false,
    }));

    if (pendingValue) {
      const input = getPagefindInput();
      if (input) {
        input.value = pendingValue;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  }

  function initPagefindUI() {
    if (pagefindLoadPromise) return pagefindLoadPromise;

    const baseUrl = getBaseUrl();
    const lazyload = getLazyload();

    lazyload.css(baseUrl + '/pagefind/pagefind-modular-ui.css');

    pagefindLoadPromise = lazyload.js(baseUrl + '/pagefind/pagefind-modular-ui.js')
      .then(() => {
        mountPagefindUI();
      })
      .catch((err) => {
        pagefindLoadPromise = null;
        throw err;
      });

    return pagefindLoadPromise;
  }

  function prefetchPagefind() {
    initPagefindUI().catch((err) => {
      console.error('Pagefind 加载失败:', err);
    });
  }

  const onAfterShow = async () => {
    focusSearchInput();
    try {
      await initPagefindUI();
    } catch (err) {
      console.error('Pagefind 加载失败:', err);
    }
    focusSearchInput();
  };

  const onAfterHide = () => {
    setTimeout(() => {
      clearPagefindSearch();
      document.dispatchEvent(new CustomEvent(SITE_EVENTS.AFFIX_REFRESH));
    }, 400);
  };

  searchModal.on('afterShow', onAfterShow);
  searchModal.on('afterHide', onAfterHide);

  const searchToggleEls = options.toggleEls
    ?? document.querySelectorAll('.js-search-toggle');
  const handleToggleClick = () => searchModal.toggle();
  const handlePrefetch = () => prefetchPagefind();

  searchToggleEls.forEach((el) => {
    el.addEventListener('click', handleToggleClick);
    el.addEventListener('pointerenter', handlePrefetch);
    el.addEventListener('focus', handlePrefetch);
  });

  const handleGlobalKeydown = (e) => {
    if (searchModal.visible) return;
    if (isFormElement(e.target || e.srcElement)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (SEARCH_HOTKEYS.has(e.key)) prefetchPagefind();
  };

  const handleGlobalKeyup = (e) => {
    if (searchModal.visible) return;
    if (isFormElement(e.target || e.srcElement)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (SEARCH_HOTKEYS.has(e.key)) {
      searchModal.show();
    }
  };

  window.addEventListener('keydown', handleGlobalKeydown);
  window.addEventListener('keyup', handleGlobalKeyup);

  if (typeof requestIdleCallback === 'function') {
    idleCallbackId = requestIdleCallback(() => prefetchPagefind(), { timeout: 2000 });
  } else {
    idleTimeoutId = setTimeout(prefetchPagefind, 1500);
  }

  return {
    destroy() {
      searchModal.off('afterShow', onAfterShow);
      searchModal.off('afterHide', onAfterHide);
      searchModal.destroy();
      window.removeEventListener('keydown', handleGlobalKeydown);
      window.removeEventListener('keyup', handleGlobalKeyup);
      if (idleCallbackId && typeof cancelIdleCallback === 'function') {
        cancelIdleCallback(idleCallbackId);
      }
      if (idleTimeoutId) clearTimeout(idleTimeoutId);
      searchToggleEls.forEach((el) => {
        el.removeEventListener('click', handleToggleClick);
        el.removeEventListener('pointerenter', handlePrefetch);
        el.removeEventListener('focus', handlePrefetch);
      });
    },
  };
}
