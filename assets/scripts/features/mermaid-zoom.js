import { Modal } from '@/lib/modal.js';

/**
 * 正文 Mermaid 图点击放大：克隆 SVG 到独立全屏层（不走图片 Gallery）。
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

  if (!modalEl || !stageEl || !(root instanceof Node)) return null;

  /** @type {?Element} */
  let sourceHost = null;
  let cloneSerial = 0;

  const modal = new Modal(modalEl, {
    closeOnBackdropClick: true,
    trapFocus: true,
    lockRoot: options.lockRoot ?? document.querySelector('.js-shell'),
    scrollElement: options.scrollElement ?? document.querySelector('.js-shell-main'),
    onChange: (visible) => {
      document.body.classList.toggle('overflow-hidden', visible);
      if (!visible) {
        stageEl.replaceChildren();
        sourceHost = null;
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
   * @param {?Element} host
   * @return {undefined}
   */
  function fillStage(host) {
    const svg = host?.querySelector('svg');
    if (!svg) {
      stageEl.replaceChildren();
      return;
    }

    cloneSerial += 1;
    const clone = /** @type {!SVGSVGElement} */ (svg.cloneNode(true));
    retargetSvgIds(clone, `mz${cloneSerial}-`);
    clone.removeAttribute('style');
    stageEl.replaceChildren(clone);
  }

  /**
   * @param {!Element} host
   * @return {undefined}
   */
  function open(host) {
    sourceHost = host;
    fillStage(host);
    if (!stageEl.querySelector('svg')) return;
    modal.show();
  }

  function markHosts() {
    const scope = root instanceof Element ? root : document;
    scope.querySelectorAll('.mermaid[data-processed]').forEach((el) => {
      el.setAttribute('title', '点击放大');
    });
  }

  function refresh() {
    markHosts();
    if (!modal.visible || !sourceHost) return;
    if (!root.contains(sourceHost)) {
      modal.hide();
      return;
    }
    fillStage(sourceHost);
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

  return {
    refresh,
    destroy() {
      contentRoot.removeEventListener('click', onRootClick);
      closeEl?.removeEventListener('click', onCloseClick);
      modal.destroy();
      stageEl.replaceChildren();
      sourceHost = null;
      document.body.classList.remove('overflow-hidden');
    },
  };
}
