/**
 * Mermaid 图：按正文 rem 字号渲染；把 SVG 收成内容 viewBox；尺寸交给 CSS contain。
 *
 * JS 只负责：取源、交给 Mermaid、收紧 viewBox、去掉会撑出空白的宽高样式。
 * 缩放不在 JS 里算。SVG 保留内在宽高比，由 max-width / max-height + height:auto 做 contain。
 * 视口变化无需回写像素高；仅主题或根 rem 变化时整图重渲染。
 */

/** @const {string} */
const SOURCE_ATTR = 'data-mermaid-source';

/** @const {string} */
const SELECTOR = '.mermaid';

/** @const {!Object<string, string>} */
const DARK_TEXT_VARIABLES = Object.freeze({
  primaryTextColor: '#ffffff',
  secondaryTextColor: '#ffffff',
  tertiaryTextColor: '#ffffff',
  textColor: '#ffffff',
  nodeTextColor: '#ffffff',
});

/**
 * Mermaid 11 各图种的 useMaxWidth 默认 true，会写成 width:100% 并把 height 绑死。
 * 一律关掉，让 CSS 按 viewBox 纵横比适配。
 * @const {!Object<string, {useMaxWidth: boolean}>}
 */
const DIAGRAM_LAYOUT = Object.freeze(
  Object.fromEntries(
    [
      'flowchart',
      'sequence',
      'class',
      'state',
      'er',
      'journey',
      'gantt',
      'pie',
      'quadrantChart',
      'requirement',
      'gitGraph',
      'c4',
      'mindmap',
      'timeline',
      'zenuml',
      'sankey',
      'xychart',
      'block',
      'packet',
      'architecture',
      'kanban',
      'radar',
      'treemap',
    ].map((type) => [type, { useMaxWidth: false }]),
  ),
);

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
 * @return {{fontSize: string, fontFamily: string, viewboxPaddingPx: number}}
 */
function readDiagramTokens(el) {
  const fontSizeRaw = readCssVar(el, '--mermaid-font-size', '1rem');
  const fontFamily = readCssVar(
    el,
    '--mermaid-font-family',
    'Comic Sans MS, cursive, sans-serif',
  );
  const padRaw = readCssVar(el, '--mermaid-viewbox-padding', '8px');
  const fontSizePx = cssLengthToPx(el, fontSizeRaw) || cssLengthToPx(el, '1rem') || 16;

  return {
    fontSize: `${fontSizePx}px`,
    fontFamily,
    viewboxPaddingPx: cssLengthToPx(el, padRaw) || 8,
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
 * @param {!DOMRect} a
 * @param {!DOMRect|{x: number, y: number, width: number, height: number}} b
 * @return {{x: number, y: number, width: number, height: number}}
 */
function unionBox(a, b) {
  const minX = Math.min(a.x, b.x);
  const minY = Math.min(a.y, b.y);
  const maxX = Math.max(a.x + a.width, b.x + b.width);
  const maxY = Math.max(a.y + a.height, b.y + b.height);
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/**
 * 内容包围盒：只合顶层 <g>，避开 Mermaid 写在 <svg> 上的虚高 viewBox / 背景 rect。
 * @param {!SVGSVGElement} svg
 * @return {{x: number, y: number, width: number, height: number}|null}
 */
function contentBox(svg) {
  const boxes = [];

  svg.querySelectorAll(':scope > g').forEach((group) => {
    try {
      const box = group.getBBox();
      if (box.width > 0 && box.height > 0) boxes.push(box);
    } catch {
      // 未插入文档或空组
    }
  });

  if (boxes.length) {
    return boxes.reduce((acc, box) => unionBox(acc, box));
  }

  try {
    const box = svg.getBBox();
    if (box.width > 0 && box.height > 0) {
      return { x: box.x, y: box.y, width: box.width, height: box.height };
    }
  } catch {
    // 未插入文档 / 空 bbox
  }

  return null;
}

/**
 * 去掉 Mermaid 内联尺寸，避免和 CSS height:auto 抢优先级。
 * @param {!SVGSVGElement} svg
 */
function stripLayoutStyles(svg) {
  svg.removeAttribute('style');
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.style.removeProperty('width');
  svg.style.removeProperty('height');
  svg.style.removeProperty('max-width');
  svg.style.removeProperty('max-height');
}

/**
 * 把 viewBox 收到内容盒 + padding。宽高只写属性（内在尺寸），不写 style。
 * CSS height:auto 会盖过 height 呈现属性，max-width 收缩时高度跟着比走。
 * @param {!SVGSVGElement} svg
 * @param {number} paddingPx
 */
function tightenViewBox(svg, paddingPx) {
  const box = contentBox(svg);
  if (!box) return;

  const pad = paddingPx > 0 ? paddingPx : 0;
  const x = box.x - pad;
  const y = box.y - pad;
  const width = box.width + pad * 2;
  const height = box.height + pad * 2;

  svg.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
}

/**
 * @param {!Array<!Element>} nodes
 * @param {number} paddingPx
 */
function prepareAll(nodes, paddingPx) {
  nodes.forEach((el) => {
    const svg = el.querySelector('svg');
    if (!svg) return;
    stripLayoutStyles(/** @type {!SVGSVGElement} */ (svg));
    tightenViewBox(/** @type {!SVGSVGElement} */ (svg), paddingPx);
  });
}

/**
 * 等两帧，让 handDrawn / foreignObject 布局完成后再量 bbox。
 * @return {!Promise<undefined>}
 */
function afterPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

/**
 * @param {{
 *   src: string,
 *   root: (?ParentNode|undefined),
 *   onRendered: ((function(): undefined)|undefined)
 * }} options
 * @return {!Promise<{
 *   destroy: function(): undefined,
 *   render: function(): !Promise<undefined>
 * }|null>}
 */
export async function init(options) {
  const src = options.src;
  if (!src) return null;
  const onRendered = typeof options.onRendered === 'function'
    ? options.onRendered
    : null;

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
          ...DIAGRAM_LAYOUT,
        });

        await mermaid.run({ nodes });
        await afterPaint();
        prepareAll(nodes, tokens.viewboxPaddingPx);
        onRendered?.();
      } while (queued);
    } finally {
      rendering = false;
    }
  }

  /** CSS 负责适配；只在 rem 解析出的字号变了时重渲染。 */
  function onLayoutChange() {
    const { fontSize } = readDiagramTokens(tokenRoot);
    if (fontSize !== lastFontSize) {
      render();
    }
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
