import { Modal } from '@/lib/modal.js';
import { getBaseUrl } from '@/utils/baseUrl.js';
import { isFormElement } from '@/utils/dom.js';
import { getLazyload } from '@/utils/lazyload.js';
import { SITE_EVENTS } from '@/features/events.js';

const SEARCH_HOTKEYS = new Set(['s', 'S', '/']);

/**
 * 站点搜索弹层（Pagefind Modular UI，懒加载）。
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

  let pagefindLoaded = false;

  function initPagefindUI() {
    if (pagefindLoaded) return Promise.resolve();

    const baseUrl = getBaseUrl();
    const lazyload = getLazyload();

    return Promise.all([
      lazyload.css(baseUrl + '/pagefind/pagefind-modular-ui.css'),
      lazyload.js(baseUrl + '/pagefind/pagefind-modular-ui.js'),
    ]).then(() => {
      const pagefindInstance = new PagefindModularUI.Instance({
        bundlePath: baseUrl + '/pagefind/',
        resetStyles: false,
      });

      pagefindInstance.add(new PagefindModularUI.Input({
        containerElement: '#pagefind-search-input',
        placeholder: '搜索文章标题和内容...',
      }));

      pagefindInstance.add(new PagefindModularUI.Summary({
        containerElement: '#pagefind-search-summary',
      }));

      pagefindInstance.add(new PagefindModularUI.ResultList({
        containerElement: '#pagefind-search-results',
        showImages: false,
      }));

      pagefindLoaded = true;
    });
  }

  function getPagefindInput() {
    return document.querySelector('#pagefind-search-input input');
  }

  function clearPagefindSearch() {
    const input = getPagefindInput();
    if (input) {
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  const onAfterShow = async () => {
    try {
      await initPagefindUI();
    } catch (err) {
      console.error('Pagefind 加载失败:', err);
    }
    setTimeout(() => {
      const input = getPagefindInput();
      if (input) input.focus();
    }, 100);
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

  searchToggleEls.forEach((el) => {
    el.addEventListener('click', handleToggleClick);
  });

  const handleGlobalKeyup = (e) => {
    if (searchModal.visible) return;
    if (isFormElement(e.target || e.srcElement)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (SEARCH_HOTKEYS.has(e.key)) {
      searchModal.show();
    }
  };

  window.addEventListener('keyup', handleGlobalKeyup);

  return {
    destroy() {
      searchModal.off('afterShow', onAfterShow);
      searchModal.off('afterHide', onAfterHide);
      searchModal.destroy();
      window.removeEventListener('keyup', handleGlobalKeyup);
      searchToggleEls.forEach((el) => {
        el.removeEventListener('click', handleToggleClick);
      });
    },
  };
}
