/**
 * Mermaid 图渲染：按正文 rem 字号排版，含主题切换与 contain 适配。
 *
 * 模型：useMaxWidth=false 保留内在尺寸 → 再按容器宽与 max-height contain 缩放。
 * 字号：读 CSS 变量 --mermaid-font-size（默认 1rem），解析为 px 后交给 Mermaid。
 */

/** @const {string} */
const SOURCE_ATTR = 'data-mermaid-source';

/** @const {string} */
const ORIENT_ATTR = 'data-mermaid-orientation';

/** @const {string} */
const FIT_ATTR = 'data-mermaid-fit';

/** @const {string} */
const IW_ATTR = 'data-mermaid-iw';

/** @const {string} */
const IH_ATTR = 'data-mermaid-ih';

/** @const {string} */
const SELECTOR = '.mermaid, code.language-mermaid';

/** @const {RegExp} */
const DIRECTION_RE =
  /(?:^|[\n\r])\s*(?:flowchart|graph)\s+(TD|TB|BT|LR|RL)\b/i;

/** @const {!Object<string, string>} */
const DARK_TEXT_VARIABLES = Object.freeze({
  primaryTextColor: '#ffffff',
  secondaryTextColor: '#ffffff',
  tertiaryTextColor: '#ffffff',
  textColor: '#ffffff',
  nodeTextColor: '#ffffff',
});

/**
 * @return {boolean}
 */
function isDarkTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark';
}

/**
 * @param {!Element} el
 * @param {string} prop
 * @param {string} fallback
 * @return {string}
 */
function readCssVar(el, prop, fallback) {
  const raw = getComputedStyle(el).getPropertyValue(prop).trim();
  return raw || fallback;
}

/**
 * 把任意 CSS 长度解析为 px（相对 el 的计算环境）。
 * @param {!Element} el
 * @param {string} value
 * @return {number}
 */
function cssLengthToPx(el, value) {
  if (!value) return 0;
  if (value.endsWith('px')) return parseFloat(value) || 0;

  const probe = document.createElement('div');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText =
    `position:absolute;visibility:hidden;pointer-events:none;height:${value};width:0;`;
  el.appendChild(probe);
  const px = probe.offsetHeight;
  probe.remove();
  return px || 0;
}

/**
 * @param {!Element} el
 * @return {{fontSize: string, fontFamily: string, maxHeightPx: number}}
 */
function readDiagramTokens(el) {
  const fontSizeRaw = readCssVar(el, '--mermaid-font-size', '1rem');
  const fontFamily = readCssVar(
    el,
    '--mermaid-font-family',
    'Comic Sans MS, cursive, sans-serif',
  );
  const maxHeightRaw = readCssVar(el, '--mermaid-max-height', '70vh');
  const fontSizePx = cssLengthToPx(el, fontSizeRaw) || cssLengthToPx(el, '1rem') || 16;

  return {
    fontSize: `${fontSizePx}px`,
    fontFamily,
    maxHeightPx: cssLengthToPx(el, maxHeightRaw) || window.innerHeight * 0.7,
  };
}

/**
 * @param {string} fontSize
 * @param {string} fontFamily
 * @return {!Object<string, string>}
 */
function themeVariables(fontSize, fontFamily) {
  const base = { fontFamily, fontSize };
  return isDarkTheme() ? { ...base, ...DARK_TEXT_VARIABLES } : base;
}

/**
 * @param {string} source
 * @param {number} width
 * @param {number} height
 * @return {'horizontal'|'vertical'}
 */
function resolveOrientation(source, width, height) {
  const match = source.match(DIRECTION_RE);
  if (match) {
    const dir = match[1].toUpperCase();
    if (dir === 'LR' || dir === 'RL') return 'horizontal';
    return 'vertical';
  }
  return width >= height ? 'horizontal' : 'vertical';
}

/**
 * @param {!Element} el
 * @return {'contain'|'width'|'none'}
 */
function fitModeOf(el) {
  const mode = (el.getAttribute(FIT_ATTR) || 'contain').toLowerCase();
  if (mode === 'width' || mode === 'none' || mode === 'contain') return mode;
  return 'contain';
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
  el.removeAttribute(IW_ATTR);
  el.removeAttribute(IH_ATTR);
  el.removeAttribute(ORIENT_ATTR);
  el.textContent = source;
}

/**
 * @param {!SVGSVGElement} svg
 * @return {{width: number, height: number}|null}
 */
function intrinsicSize(svg) {
  const vb = svg.viewBox && svg.viewBox.baseVal;
  if (vb && vb.width > 0 && vb.height > 0) {
    return { width: vb.width, height: vb.height };
  }

  const attrW = parseFloat(svg.getAttribute('width') || '');
  const attrH = parseFloat(svg.getAttribute('height') || '');
  if (attrW > 0 && attrH > 0) {
    return { width: attrW, height: attrH };
  }

  try {
    const box = svg.getBBox();
    if (box.width > 0 && box.height > 0) {
      return { width: box.width, height: box.height };
    }
  } catch (_) {
    // Not in document / empty bbox
  }

  return null;
}

/**
 * @param {!Element} el
 * @param {number} maxHeightPx
 */
function fitElement(el, maxHeightPx) {
  const svg = el.querySelector('svg');
  if (!svg) return;

  let width = parseFloat(el.getAttribute(IW_ATTR) || '');
  let height = parseFloat(el.getAttribute(IH_ATTR) || '');

  if (!(width > 0 && height > 0)) {
    const size = intrinsicSize(/** @type {!SVGSVGElement} */ (svg));
    if (!size) return;
    width = size.width;
    height = size.height;
    el.setAttribute(IW_ATTR, String(width));
    el.setAttribute(IH_ATTR, String(height));
  }

  const source = el.getAttribute(SOURCE_ATTR) || '';
  el.setAttribute(ORIENT_ATTR, resolveOrientation(source, width, height));

  const mode = fitModeOf(el);
  if (mode === 'none') {
    svg.style.width = `${width}px`;
    svg.style.height = `${height}px`;
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    return;
  }

  const containerWidth = el.clientWidth || el.parentElement?.clientWidth || width;
  let scale = containerWidth > 0 ? Math.min(1, containerWidth / width) : 1;

  if (mode === 'contain' && maxHeightPx > 0 && height > 0) {
    scale = Math.min(scale, maxHeightPx / height);
  }

  svg.style.width = `${width * scale}px`;
  svg.style.height = `${height * scale}px`;
  svg.removeAttribute('width');
  svg.removeAttribute('height');
}

/**
 * @param {!Array<!Element>} nodes
 * @param {!Element} tokenRoot
 */
function fitAll(nodes, tokenRoot) {
  const { maxHeightPx } = readDiagramTokens(tokenRoot);
  nodes.forEach((el) => fitElement(el, maxHeightPx));
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
  const tokenRoot =
    root instanceof Element
      ? root
      : document.querySelector('.js-article-body') ?? document.documentElement;

  const { default: mermaid } = await import(src);

  let rendering = false;
  let queued = false;
  /** @type {string} */
  let lastFontSize = '';

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

        const tokens = readDiagramTokens(tokenRoot);
        lastFontSize = tokens.fontSize;

        mermaid.initialize({
          startOnLoad: false,
          look: 'handDrawn',
          theme: 'default',
          themeVariables: themeVariables(tokens.fontSize, tokens.fontFamily),
          flowchart: { useMaxWidth: false },
          sequence: { useMaxWidth: false },
          class: { useMaxWidth: false },
          state: { useMaxWidth: false },
          er: { useMaxWidth: false },
          journey: { useMaxWidth: false },
          gantt: { useMaxWidth: false },
          pie: { useMaxWidth: false },
          sankey: { useMaxWidth: false },
          mindmap: { useMaxWidth: false },
          timeline: { useMaxWidth: false },
          quadrantChart: { useMaxWidth: false },
          requirement: { useMaxWidth: false },
          architecture: { useMaxWidth: false },
        });

        await mermaid.run({ nodes });
        fitAll(nodes, tokenRoot);
      } while (queued);
    } finally {
      rendering = false;
    }
  }

  /** Refit only; re-render when rem-resolved font size changed. */
  function onLayoutChange() {
    const { fontSize } = readDiagramTokens(tokenRoot);
    if (fontSize !== lastFontSize) {
      render();
      return;
    }
    fitAll(collectNodes(root), tokenRoot);
  }

  const themeObserver = new MutationObserver((mutations) => {
    if (mutations.some((m) => m.attributeName === 'data-theme')) {
      render();
    }
  });

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  /** @type {ResizeObserver|undefined} */
  let resizeObserver;
  if (typeof ResizeObserver !== 'undefined') {
    let frame = 0;
    resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(onLayoutChange);
    });
    if (tokenRoot instanceof Element) {
      resizeObserver.observe(tokenRoot);
    }
  } else {
    window.addEventListener('resize', onLayoutChange);
  }

  await render();

  return {
    render,
    destroy() {
      themeObserver.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener('resize', onLayoutChange);
    },
  };
}
