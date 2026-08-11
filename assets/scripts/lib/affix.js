import { isOverallScroller } from '@/utils/dom.js';
import { throttle } from '@/utils/throttle.js';

/**
 * 将元素钉在滚动过程中的上/中/下三段：
 *   TOP    — `position:absolute; top:0`（相对 container）
 *   FIXED  — `position:fixed`（视口）
 *   BOTTOM — `position:absolute; bottom:0`（相对 container）
 *
 * 专为侧栏 TOC 设计：container 为 stretch 列；面板须自带 max-height + 内部滚动。
 * 测量使用钳制后的 `offsetHeight`，不使用未裁剪内容高度；不插入占位节点，
 * 也不使用 `relative + top`（避免撑出文档可滚动溢出）。
 */
export class Affix {
  /**
   * Affix 状态常量。
   * @const {!Object<string, string>}
   */
  static STATE = Object.freeze({
    TOP: 'top',
    FIXED: 'fixed',
    BOTTOM: 'bottom',
  });

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
    this._getScrollLeft = null;

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
      this._getScrollLeft = () => window.scrollX;
    } else {
      const el = this.target;
      this._getScrollTop = () => el.scrollTop;
      this._getScrollLeft = () => el.scrollLeft;
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

  _measure() {
    const container = this._resolveContainer();
    const scrollTop = this._getScrollTop();
    const scrollLeft = this._getScrollLeft();
    const containerRect = container.getBoundingClientRect();

    this._containerTop = containerRect.top + scrollTop;
    this._containerBottom = containerRect.bottom + scrollTop;

    // Width follows the stretch column (stable across TOP / FIXED / BOTTOM).
    this._rootWidth = container.clientWidth;
    // Clamped panel height (CSS max-height + overflow); never raw content height.
    this._rootHeight = this.root.offsetHeight;

    this._rootLeft = containerRect.left + (this._isOverallScroller ? 0 : scrollLeft);

    // scrollTop thresholds (document / scroller coordinates).
    this._fixStart = this._containerTop - this.offsetTop;
    this._scrollBottomLimit =
      this._containerBottom
      - this.offsetBottom
      - this.offsetTop
      - this._rootHeight;
  }

  _clearInlinePinStyles() {
    Object.assign(this.root.style, {
      position: '',
      left: '',
      top: '',
      bottom: '',
      width: '',
    });
  }

  _applyState(newState) {
    const oldState = this.state;
    const stateChanged = oldState !== newState;
    const { STATE } = Affix;

    this._isUpdating = true;

    // Always rewrite pin styles so refresh/resize updates left/width while FIXED.
    switch (newState) {
      case STATE.TOP:
        this.root.classList.remove('fixed');
        this._clearInlinePinStyles();
        break;

      case STATE.FIXED:
        this.root.classList.add('fixed');
        Object.assign(this.root.style, {
          position: '', // `.fixed` → position:fixed
          left: `${this._rootLeft}px`,
          top: `${this.offsetTop}px`,
          bottom: '',
          width: `${this._rootWidth}px`,
        });
        break;

      case STATE.BOTTOM:
        this.root.classList.remove('fixed');
        Object.assign(this.root.style, {
          position: 'absolute',
          left: '0',
          top: 'auto',
          bottom: `${this.offsetBottom}px`,
          width: '100%',
        });
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

    if (scrollTop < this._fixStart) {
      this._applyState(STATE.TOP);
    } else if (scrollTop <= this._scrollBottomLimit) {
      this._applyState(STATE.FIXED);
    } else {
      this._applyState(STATE.BOTTOM);
    }
  }

  _handleScroll() {
    if (this._rafPending || this.isDisabled) return;

    this._rafPending = true;
    this._rafId = requestAnimationFrame(() => {
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
    this._resizeObserver.observe(this.root);

    try {
      const container = this._resolveContainer();
      if (container !== this.root) {
        this._resizeObserver.observe(container);
      }
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
