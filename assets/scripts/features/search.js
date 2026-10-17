import { Modal } from '@/lib/modal.js';
import { getBaseUrl } from '@/utils/baseUrl.js';
import { isFormElement } from '@/utils/dom.js';
import { getLazyload } from '@/utils/lazyload.js';
import { SITE_EVENTS } from '@/features/events.js';
import { t } from '@/utils/i18n.js';

const SEARCH_HOTKEYS = new Set(['s', 'S', '/']);

class StableResultList {
  constructor(containerElement) {
    this.container = document.querySelector(containerElement);
    this.renderVersion = 0;
  }

  register(instance) {
    instance.on('loading', () => {
      this.renderVersion += 1;
      this.container?.setAttribute('aria-busy', 'true');
    });

    instance.on('results', (searchResult) => {
      const renderVersion = ++this.renderVersion;
      const results = searchResult?.results ?? [];

      Promise.all(results.map((result) => result.data()))
        .then((loadedResults) => {
          if (renderVersion !== this.renderVersion || !this.container) return;

          const fragment = document.createDocumentFragment();
          loadedResults.forEach((result) => {
            const item = document.createElement('li');
            item.className = 'pagefind-modular-list-result';

            const inner = document.createElement('div');
            inner.className = 'pagefind-modular-list-inner';
            const title = document.createElement('p');
            title.className = 'pagefind-modular-list-title';
            const link = document.createElement('a');
            link.className = 'pagefind-modular-list-link';
            link.textContent = result.meta?.title ?? '';
            link.href = result.meta?.url || result.url;
            title.append(link);

            const excerpt = document.createElement('p');
            excerpt.className = 'pagefind-modular-list-excerpt';
            excerpt.innerHTML = result.excerpt ?? '';
            inner.append(title, excerpt);
            item.append(inner);
            fragment.append(item);
          });

          this.container.replaceChildren(fragment);
          this.container.setAttribute('aria-busy', 'false');
        })
        .catch((error) => {
          if (renderVersion !== this.renderVersion) return;
          this.container?.setAttribute('aria-busy', 'false');
          console.error('Pagefind 搜索结果加载失败:', error);
        });
    });
  }
}

/**
 * 站点搜索弹层（Pagefind Modular UI）。库仅在打开/悬停/快捷键时加载，不空闲预拉。
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
  /** @type {?HTMLInputElement} */
  let compositionInput = null;
  /** @type {?Element} */
  let compositionRoot = null;
  let isComposingSearchInput = false;

  function handleSearchInputDuringComposition(event) {
    if (isComposingSearchInput || event.isComposing) {
      event.stopImmediatePropagation();
    }
  }

  function handleSearchCompositionStart() {
    isComposingSearchInput = true;
  }

  function handleSearchCompositionEnd() {
    isComposingSearchInput = false;
    // Search once the IME commits its final text, rather than searching each
    // intermediate pinyin value. The final native input event, if any, is
    // coalesced by Pagefind's debounce.
    compositionInput?.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function bindSearchInputComposition(input) {
    if (!input || input === compositionInput) return;
    unbindSearchInputComposition();
    const root = input.closest('#pagefind-search-input');
    if (!root) return;
    compositionInput = input;
    compositionRoot = root;
    // Capture on the stable parent so we can stop Pagefind's input listener
    // before it sees intermediate IME text, including browsers that omit
    // InputEvent.isComposing.
    compositionRoot.addEventListener('compositionstart', handleSearchCompositionStart, true);
    compositionRoot.addEventListener('compositionend', handleSearchCompositionEnd, true);
    compositionRoot.addEventListener('input', handleSearchInputDuringComposition, true);
  }

  function unbindSearchInputComposition() {
    if (compositionRoot) {
      compositionRoot.removeEventListener('compositionstart', handleSearchCompositionStart, true);
      compositionRoot.removeEventListener('compositionend', handleSearchCompositionEnd, true);
      compositionRoot.removeEventListener('input', handleSearchInputDuringComposition, true);
    }
    compositionInput = null;
    compositionRoot = null;
    isComposingSearchInput = false;
  }

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
      placeholder: t('SEARCH_PLACEHOLDER', 'Search titles and content...'),
      debounceTimeoutMs: 400,
    }));
    bindSearchInputComposition(getPagefindInput());

    pagefindInstance.add(new PagefindModularUI.Summary({
      containerElement: '#pagefind-search-summary',
    }));

    pagefindInstance.add(new StableResultList('#pagefind-search-results'));

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

  return {
    destroy() {
      searchModal.off('afterShow', onAfterShow);
      searchModal.off('afterHide', onAfterHide);
      searchModal.destroy();
      unbindSearchInputComposition();
      window.removeEventListener('keydown', handleGlobalKeydown);
      window.removeEventListener('keyup', handleGlobalKeyup);
      searchToggleEls.forEach((el) => {
        el.removeEventListener('click', handleToggleClick);
        el.removeEventListener('pointerenter', handlePrefetch);
        el.removeEventListener('focus', handlePrefetch);
      });
    },
  };
}
