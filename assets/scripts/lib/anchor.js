/** @const {string} */
export const HEADING_SELECTOR = 'h1[id], h2[id], h3[id], h4[id]';

/** @const {string} */
export const ANCHOR_HIGHLIGHT_CLASS = 'anchor-highlight';

/**
 * 滚动到指定标题，并可高亮显示。
 * @param {!Element} heading
 * @param {{
 *   behavior: (string|undefined),
 *   block: (string|undefined),
 *   highlight: (boolean|undefined)
 * }=} options
 */
export function scrollToHeading(heading, options = {}) {
  const { behavior = 'smooth', block = 'start', highlight = true } = options;

  heading.scrollIntoView({ behavior, block });

  if (!highlight) return;

  heading.classList.add(ANCHOR_HIGHLIGHT_CLASS);
  heading.addEventListener('animationend', () => {
    heading.classList.remove(ANCHOR_HIGHLIGHT_CLASS);
  }, { once: true });
}

/**
 * 根据 location hash 解析对应的标题元素。
 * @param {string} hash
 * @param {!Element} container
 * @param {string=} selector
 * @return {?Element}
 */
export function getHeadingByHash(hash, container, selector = HEADING_SELECTOR) {
  if (!hash || !container) return null;

  const targetId = decodeURIComponent(hash.slice(1));
  const targetElement = document.getElementById(targetId);

  return targetElement
    && targetElement.matches(selector)
    && container.contains(targetElement)
    ? targetElement
    : null;
}

/**
 * 在内容容器内绑定标题锚点链接。
 * @param {!Element} container
 * @param {{
 *   selector: (string|undefined),
 *   onNavigate: ((function(!Element): undefined)|undefined)
 * }=} options
 * @return {?function(): undefined} 销毁函数
 */
export function initHeadingAnchors(container, options = {}) {
  const {
    selector = HEADING_SELECTOR,
    onNavigate = null,
  } = options;

  if (!container || !(container instanceof Element)) return null;

  container.querySelectorAll(selector).forEach((heading) => {
    const anchor = document.createElement('a');
    heading.appendChild(anchor);

    anchor.className = 'anchor d-print-none';
    anchor.setAttribute('aria-hidden', 'true');
    anchor.innerHTML = '<i class="fas fa-anchor"></i>';
    anchor.href = '#' + heading.id;
  });

  const initialTarget = getHeadingByHash(location.hash, container, selector);
  if (initialTarget) {
    requestAnimationFrame(() => scrollToHeading(initialTarget));
  }

  const handleClick = (event) => {
    const anchor = event.target.closest('.anchor');
    if (!anchor) return;

    const heading = anchor.closest(selector);
    if (!heading) return;

    event.preventDefault();
    scrollToHeading(heading);
    history.replaceState(null, '', '#' + heading.id);

    if (typeof onNavigate === 'function') {
      onNavigate(heading);
    }
  };

  container.addEventListener('click', handleClick);

  return () => {
    container.removeEventListener('click', handleClick);
  };
}
