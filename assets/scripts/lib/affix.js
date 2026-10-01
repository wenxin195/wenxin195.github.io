import { isOverallScroller } from '@/utils/dom.js';
import { throttle } from '@/utils/throttle.js';

/**
 * 将元素钉在滚动过程中的上/中/下三段：
 *   TOP    — `position:absolute; top:0`（相对 stretch 列）
 *   PINNED — `.is-pinned` → `position:fixed`（left/width/top 来自 CSS 变量，同规则原子生效）
 *   BOTTOM — `position:absolute; bottom:offsetBottom`（相对 stretch 列）
 *
 * 专为侧栏 TOC：container 为 stretch 列；面板须自带 max-height + 内部滚动。
 *
 * 左右闪的根因：`.aside-toc { left:0; width:100% }` 在 absolute 下表示「贴右列」，
 * 一旦先变成 fixed，同一套值就变成「贴视口左边 / 拉满宽」。解决办法是让
 * `position:fixed` 与正确的 left/width **写在同一条 `.is-pinned` 规则里**
 * （通过 `--affix-*` 变量），先写变量再挂 class，避免中间帧。
 */
export class Affix {
  /**
   * Affix 状态常量。
   * @const {!Object<string, string>}
   */
  static STATE = Object.freeze({
    TOP: 'top',
    PINNED: 'pinned',
    BOTTOM: 'bottom',
  });

  /** CSS class toggled while PINNED (fixed + viewport max-height). */
  static PINNED_CLASS = 'is-pinned';

  /**
   * @param {!Element} element
   * @param {{
   *   target: (!EventTarget|undefined),
   *   container: (!Element|undefined),
   *   offsetTop: (number|undefined),
   *   offsetBottom: (number|undefined),
   *   disabled: (boolean|undefined),
   *   onChange: ((function(string, ?string): undefined)|undefined)
   * }=} options
   */
  constructor(element, options = {}) {
    if (!element || !(element instanceof Element)) {
      throw new Error('Affix: element (Element) is required');
    }

    this.root = element;
    this.state = null;
    this.isInitialized = false;
    this.isDisabled = false;

    this._rafPending = false;
    this._rafId = null;
    this._isUpdating = false;
    this._resizeObserver = null;

    this.target = window;
    this.container = null;
    this.offsetTop = 0;
    this.offsetBottom = 0;
    this.onChange = null;

    this._getScrollTop = null;

    this._handleScroll = this._handleScroll.bind(this);
    this._handleResize = throttle(this._handleResize.bind(this), 200);

    this._applyOptions(options);
    if (!this.isDisabled) this.init();
  }

  _applyOptions(options) {
    if (options.target != null) this.target = options.target;

    if (options.container != null) this.container = options.container;

    if (options.offsetTop !== undefined) this.offsetTop = Number(options.offsetTop) || 0;

    if (options.offsetBottom !== undefined) {
      this.offsetBottom = Number(options.offsetBottom) || 0;
    }

    if (options.disabled !== undefined) this.isDisabled = !!options.disabled;

    if (options.onChange !== undefined) this.onChange = options.onChange;

    this._isOverallScroller = isOverallScroller(this.target);
    this._bindScrollHelpers();
  }

  _bindScrollHelpers() {
    if (this._isOverallScroller) {
      this._getScrollTop = () => window.scrollY;
    } else {
      const el = this.target;
      this._getScrollTop = () => el.scrollTop;
    }
  }

  /**
   * @return {!Element}
   */
  _resolveContainer() {
    if (this.container && this.container instanceof Element) {
      return this.container;
    }
    const parent = this.root.parentElement;
    if (!parent) {
      throw new Error('Affix: container (Element) is required');
    }
    return parent;
  }

  /**
   * Cache stretch-column geometry. Call on init / resize / layout refresh —
   * not required every scroll frame while PINNED (fixed handles vertical).
   */
  _measure() {
    const container = this._resolveContainer();
    const scrollTop = this._getScrollTop();
    const containerRect = container.getBoundingClientRect();

    this._containerTop = containerRect.top + scrollTop;
    this._containerBottom = containerRect.bottom + scrollTop;

    this._capturePinnedBox(container, containerRect);

    // Clamped panel height (CSS max-height + overflow); never raw content height.
    this._rootHeight = this.root.offsetHeight;

    this._pinStart = this._containerTop - this.offsetTop;
    this._scrollBottomLimit =
      this._containerBottom
      - this.offsetBottom
      - this.offsetTop
      - this._rootHeight;
  }

  /**
   * Viewport-horizontal box for PINNED (`position:fixed` containing block).
   * @param {!Element=} container
   * @param {DOMRect=} containerRect
   */
  _capturePinnedBox(container, containerRect) {
    const el = container ?? this._resolveContainer();
    const rect = containerRect ?? el.getBoundingClientRect();
    this._rootLeft = Math.round(rect.left);
    this._rootWidth = Math.round(el.clientWidth) || Math.round(rect.width);
  }

  /** Write pin geometry into CSS variables (must run before adding `.is-pinned`). */
  _setPinnedVars() {
    this.root.style.setProperty('--affix-left', `${this._rootLeft}px`);
    this.root.style.setProperty('--affix-width', `${this._rootWidth}px`);
    this.root.style.setProperty('--affix-top', `${this.offsetTop}px`);
  }

  _clearPinnedVars() {
    this.root.style.removeProperty('--affix-left');
    this.root.style.removeProperty('--affix-width');
    this.root.style.removeProperty('--affix-top');
  }

  /** Restore column-absolute defaults (no fixed, no pin vars, no bottom pin). */
  _clearInlinePinStyles() {
    this.root.classList.remove(Affix.PINNED_CLASS);
    this._clearPinnedVars();
    this.root.style.top = '';
    this.root.style.bottom = '';
    // Legacy cleanup if an older session left inline fixed geometry.
    this.root.style.position = '';
    this.root.style.left = '';
    this.root.style.width = '';
  }

  /**
   * @param {string} newState
   */
  _applyState(newState) {
    const oldState = this.state;
    const stateChanged = oldState !== newState;
    const { STATE } = Affix;

    this._isUpdating = true;

    switch (newState) {
      case STATE.TOP:
        // Drop `.is-pinned` first → instant return to absolute column `left:0`.
        this._clearInlinePinStyles();
        break;

      case STATE.PINNED:
        // Fresh horizontal box when entering / after layout measure.
        if (oldState !== STATE.PINNED) {
          this._capturePinnedBox();
        }
        // Vars first, then class — one cascade applies fixed + left + width together.
        this._setPinnedVars();
        this.root.style.top = '';
        this.root.style.bottom = '';
        this.root.style.position = '';
        this.root.style.left = '';
        this.root.style.width = '';
        this.root.classList.add(Affix.PINNED_CLASS);
        break;

      case STATE.BOTTOM:
        this.root.classList.remove(Affix.PINNED_CLASS);
        this._clearPinnedVars();
        this.root.style.position = '';
        this.root.style.left = '';
        this.root.style.width = '';
        this.root.style.top = 'auto';
        this.root.style.bottom = `${this.offsetBottom}px`;
        break;
    }

    this.state = newState;
    this._isUpdating = false;

    if (stateChanged && typeof this.onChange === 'function') {
      try {
        this.onChange(newState, oldState);
      } catch (e) {
        console.warn('Affix: onChange callback error', e);
      }
    }
  }

  _updateState() {
    const scrollTop = this._getScrollTop();
    const { STATE } = Affix;

    if (scrollTop < this._pinStart) {
      this._applyState(STATE.TOP);
    } else if (scrollTop <= this._scrollBottomLimit) {
      this._applyState(STATE.PINNED);
    } else {
      this._applyState(STATE.BOTTOM);
    }
  }

  _handleScroll() {
    if (this._rafPending || this.isDisabled) return;

    this._rafPending = true;
    this._rafId = requestAnimationFrame(() => {
      // Thresholds are cached; PINNED vertical is compositor-fixed.
      this._updateState();
      this._rafPending = false;
    });
  }

  _handleResize() {
    if (this.isDisabled) return;

    this._measure();
    this._updateState();
  }

  /** 初始化监听并计算初始吸顶状态。 */
  init() {
    if (this.isInitialized) return;

    try {
      this._resolveContainer();
      this._measure();
      this._updateState();
    } catch (e) {
      console.warn('Affix: initialization failed', e);
      return;
    }

    this.target.addEventListener('scroll', this._handleScroll, { passive: true });
    window.addEventListener('resize', this._handleResize);
    this._initResizeObserver();

    this.isInitialized = true;
  }

  _initResizeObserver() {
    if (typeof ResizeObserver === 'undefined') return;

    const handleResize = throttle(() => {
      if (this.isDisabled || this._isUpdating) return;
      this._measure();
      this._updateState();
    }, 200);

    this._resizeObserver = new ResizeObserver(handleResize);

    try {
      this._resizeObserver.observe(this._resolveContainer());
    } catch (_) {
      // container missing — init already warned
    }
  }

  /** 外部布局变化后手动刷新测量。 */
  refresh() {
    if (this.isDisabled) return;
    this._measure();
    this._updateState();
  }

  /** 启用吸顶行为。 */
  enable() {
    this.isDisabled = false;
    if (!this.isInitialized) {
      this.init();
    } else {
      this.refresh();
    }
  }

  /** 禁用吸顶并重置为顶部状态。 */
  disable() {
    this.isDisabled = true;
    this._applyState(Affix.STATE.TOP);
  }

  /** 销毁实例并清理监听与观察器。 */
  destroy() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }

    this.target.removeEventListener('scroll', this._handleScroll);
    window.removeEventListener('resize', this._handleResize);

    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }

    this._applyState(Affix.STATE.TOP);
    this.state = null;
    this.isInitialized = false;
  }
}
