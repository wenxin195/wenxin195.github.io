import { Modal } from '@/lib/modal.js';
import { Swiper } from '@/lib/swiper.js';

/**
 * 正文 Mermaid 图点击放大，并在同一篇文章的图之间切换。
 * @param {{
 *   root: (?ParentNode|undefined),
 *   modalEl: (?Element|undefined),
 *   stageEl: (?Element|undefined),
 *   closeEl: (?Element|undefined),
 *   lockRoot: (?Element|undefined),
 *   scrollElement: (?Element|undefined)
 * }=} options
 * @return {{destroy: function(): undefined, refresh: function(): undefined}|null}
 */
export function init(options = {}) {
  const root = options.root
    ?? document.querySelector('.js-article-body')
    ?? document;
  const modalEl = options.modalEl
    ?? document.querySelector('.js-mermaid-zoom-modal');
  const stageEl = options.stageEl
    ?? modalEl?.querySelector('.js-mermaid-zoom-stage')
    ?? null;
  const closeEl = options.closeEl
    ?? modalEl?.querySelector('.js-mermaid-zoom-close')
    ?? null;
  const wrapperEl = stageEl?.querySelector('.js-mermaid-zoom-wrapper');
  const counterEl = modalEl?.querySelector('.js-mermaid-zoom-counter');

  if (!modalEl || !stageEl || !wrapperEl || !counterEl || !(root instanceof Node)) return null;

  /** @type {!Element[]} */
  let hosts = [];
  /** @type {?Swiper} */
  let swiper = null;
  let currentIndex = 0;
  let cloneSerial = 0;

  const modal = new Modal(modalEl, {
    closeOnBackdropClick: true,
    trapFocus: true,
    lockRoot: options.lockRoot ?? document.querySelector('.js-shell'),
    scrollElement: options.scrollElement ?? document.querySelector('.js-shell-main'),
    onChange: (visible) => {
      document.body.classList.toggle('overflow-hidden', visible);
      if (!visible) {
        swiper?.destroy();
        swiper = null;
        wrapperEl.replaceChildren();
        hosts = [];
        counterEl.textContent = '';
      }
    },
  });

  /**
   * Clone SVG ids so marker / fill url(#id) still resolve inside the overlay.
   * @param {!SVGSVGElement} svg
   * @param {string} prefix
   * @return {undefined}
   */
  function retargetSvgIds(svg, prefix) {
    const nodes = [...svg.querySelectorAll('[id]')];
    const ids = nodes
      .map((el) => el.getAttribute('id'))
      .filter((id) => Boolean(id))
      .sort((a, b) => b.length - a.length);
    if (!ids.length) return;

    /** @type {!Map<string, string>} */
    const idMap = new Map(ids.map((id) => [id, `${prefix}${id}`]));

    nodes.forEach((el) => {
      const id = el.getAttribute('id');
      const next = id ? idMap.get(id) : null;
      if (next) el.setAttribute('id', next);
    });

    /**
     * @param {string} value
     * @return {string}
     */
    function rewrite(value) {
      let next = value;
      idMap.forEach((to, from) => {
        next = next.split(`#${from}`).join(`#${to}`);
      });
      return next;
    }

    svg.querySelectorAll('*').forEach((el) => {
      for (const attr of [...el.attributes]) {
        if (attr.value.includes('#')) {
          el.setAttribute(attr.name, rewrite(attr.value));
        }
      }
    });
    svg.querySelectorAll('style').forEach((style) => {
      style.textContent = rewrite(style.textContent || '');
    });
  }

  /**
   * @param {number} index
   * @return {undefined}
   */
  function fillSlide(index) {
    const slide = wrapperEl.children[index];
    const svg = hosts[index]?.querySelector('svg');
    if (!slide || !svg || slide.firstChild) return;

    cloneSerial += 1;
    const clone = /** @type {!SVGSVGElement} */ (svg.cloneNode(true));
    retargetSvgIds(clone, `mz${cloneSerial}-`);
    clone.removeAttribute('style');
    slide.appendChild(clone);
  }

  /** @param {number} index */
  function showSlide(index) {
    currentIndex = index;
    fillSlide(index);
    counterEl.textContent = `${index + 1} / ${hosts.length}`;
  }

  /**
   * @param {!Element} host
   * @return {undefined}
   */
  function open(host) {
    const scope = root instanceof Element ? root : document;
    hosts = [...scope.querySelectorAll('.mermaid[data-processed]')]
      .filter((el) => el.querySelector('svg'));
    const index = hosts.indexOf(host);
    if (index < 0) return;

    wrapperEl.replaceChildren(...hosts.map(() => {
      const slide = document.createElement('div');
      slide.className = 'swiper__slide';
      return slide;
    }));
    stageEl.querySelectorAll('.swiper__button').forEach((button) => {
      button.classList.remove('d-none');
    });
    showSlide(index);
    swiper = new Swiper(stageEl, {
      initialSlide: index,
      keyboard: false,
      onChange: ({ currentIndex: nextIndex }) => showSlide(nextIndex),
    });
    counterEl.classList.toggle('d-none', hosts.length < 2);
    modal.show();
    swiper.refresh();
  }

  function markHosts() {
    const scope = root instanceof Element ? root : document;
    scope.querySelectorAll('.mermaid[data-processed]').forEach((el) => {
      el.setAttribute('title', '点击放大');
    });
  }

  function refresh() {
    markHosts();
    if (!modal.visible) return;
    if (hosts.some((host) => !root.contains(host))) {
      modal.hide();
      return;
    }
    [...wrapperEl.children].forEach((slide) => slide.replaceChildren());
    fillSlide(currentIndex);
  }

  /** @param {!KeyboardEvent} event */
  function onArrowKey(event) {
    if (!modal.visible || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
    event.preventDefault();
    event.stopPropagation();
    if (event.key === 'ArrowLeft') swiper?.previous();
    else swiper?.next();
  }

  /**
   * @param {!Event} event
   * @return {undefined}
   */
  function onRootClick(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('a[href], button, [role="button"]')) return;

    const host = target.closest('.mermaid');
    if (!host || !root.contains(host)) return;
    if (!host.hasAttribute('data-processed')) return;
    if (!host.querySelector('svg')) return;

    event.preventDefault();
    open(host);
  }

  /**
   * @param {!Event} event
   * @return {undefined}
   */
  function onCloseClick(event) {
    event.preventDefault();
    event.stopPropagation();
    modal.hide();
  }

  const contentRoot = root instanceof Element ? root : document;
  contentRoot.addEventListener('click', onRootClick);
  closeEl?.addEventListener('click', onCloseClick);
  window.addEventListener('keydown', onArrowKey, true);

  return {
    refresh,
    destroy() {
      contentRoot.removeEventListener('click', onRootClick);
      closeEl?.removeEventListener('click', onCloseClick);
      window.removeEventListener('keydown', onArrowKey, true);
      modal.destroy();
      swiper?.destroy();
      swiper = null;
      wrapperEl.replaceChildren();
      hosts = [];
      document.body.classList.remove('overflow-hidden');
    },
  };
}
