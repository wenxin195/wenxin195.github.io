/**
 * Mermaid 图渲染：亮色保持 default 样式，暗色文字为白；主题切换时重渲染。
 */

/** @const {!Object<string, string>} */
const BASE_THEME_VARIABLES = Object.freeze({
  fontFamily: 'Comic Sans MS, cursive, sans-serif',
  fontSize: '24px',
});

/** @const {!Object<string, string>} */
const DARK_TEXT_VARIABLES = Object.freeze({
  primaryTextColor: '#ffffff',
  secondaryTextColor: '#ffffff',
  tertiaryTextColor: '#ffffff',
  textColor: '#ffffff',
  nodeTextColor: '#ffffff',
});

/** @const {string} */
const SOURCE_ATTR = 'data-mermaid-source';

/** @const {string} */
const SELECTOR = '.mermaid, code.language-mermaid';

/**
 * @return {boolean}
 */
function isDarkTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

/**
 * @return {!Object<string, string>}
 */
function themeVariables() {
  return isDarkTheme()
    ? { ...BASE_THEME_VARIABLES, ...DARK_TEXT_VARIABLES }
    : { ...BASE_THEME_VARIABLES };
}

/**
 * @param {!ParentNode} root
 * @return {!Array<!Element>}
 */
function collectNodes(root) {
  return [...root.querySelectorAll(SELECTOR)];
}

/**
 * @param {!Element} el
 */
function ensureSource(el) {
  if (!el.hasAttribute(SOURCE_ATTR)) {
    el.setAttribute(SOURCE_ATTR, el.textContent.trim());
  }
}

/**
 * @param {!Element} el
 */
function restoreSource(el) {
  const source = el.getAttribute(SOURCE_ATTR);
  if (source == null) return;
  el.removeAttribute('data-processed');
  el.textContent = source;
}

/**
 * @param {{
 *   src: string,
 *   root: (?ParentNode|undefined)
 * }} options
 * @return {!Promise<{
 *   destroy: function(): undefined,
 *   render: function(): !Promise<undefined>
 * }|null>}
 */
export async function init(options) {
  const src = options.src;
  if (!src) return null;

  const root = options.root ?? document;
  const { default: mermaid } = await import(src);

  let rendering = false;
  let queued = false;

  /** @return {!Promise<undefined>} */
  async function render() {
    if (rendering) {
      queued = true;
      return;
    }

    rendering = true;
    try {
      do {
        queued = false;
        const nodes = collectNodes(root);
        if (!nodes.length) continue;

        nodes.forEach(ensureSource);
        nodes.forEach(restoreSource);

        mermaid.initialize({
          startOnLoad: false,
          look: 'handDrawn',
          theme: 'default',
          themeVariables: themeVariables(),
        });

        await mermaid.run({ nodes });
      } while (queued);
    } finally {
      rendering = false;
    }
  }

  const observer = new MutationObserver((mutations) => {
    if (mutations.some((m) => m.attributeName === 'data-theme')) {
      render();
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  await render();

  return {
    render,
    destroy() {
      observer.disconnect();
    },
  };
}
