import { isOverallScroller } from '@/utils/dom.js';
import { throttle } from '@/utils/throttle.js';

/**
 * 在滚动容器内将元素吸顶/吸底于上下边界之间。
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
   *   container: (?Element|undefined),
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
    this.placeholder = null;  // 占位元素(防止 fixed 时页面跳动)
    this.state = null;  // 当前状态
    this.isInitialized = false;
    this.isDisabled = false;

    // 内部标记
    this._rafPending = false;  // rAF 节流标记
    this._rafId = null;
    this._isUpdating = false;  // 防止 ResizeObserver 循环
    this._resizeObserver = null;

    // 默认配置
    this.target = window;  // 滚动事件目标
    this.container = null;  // 边界容器
    this.offsetTop = 0;  // fixed 时距顶部距离
    this.offsetBottom = 0;  // 触发 bottom 的底部偏移
    this.onChange = null;  // 状态变化回调

    // 缓存的滚动方法(根据 target 类型一次性确定，避免重复判断)
    this._getScrollTop = null;
    this._getScrollLeft = null;
    this._getScrollHeight = null;

    // 绑定事件处理器(方便移除)
    this._handleScroll = this._handleScroll.bind(this);
    this._handleResize = throttle(this._handleResize.bind(this), 200);

    // 应用配置并初始化
    this._applyOptions(options);
    if (!this.isDisabled) this.init();
  }

  _applyOptions(options) {
    if (options.target != null) this.target = options.target;

    if (options.container != null) this.container = options.container;

    if (options.offsetTop !== undefined) this.offsetTop = Number(options.offsetTop) || 0;

    if (options.offsetBottom !== undefined) this.offsetBottom = Number(options.offsetBottom) || 0;

    if (options.disabled !== undefined) this.isDisabled = !!options.disabled;

    if (options.onChange !== undefined) this.onChange = options.onChange;

    this._isOverallScroller = isOverallScroller(this.target);
    this._bindScrollHelpers();
  }

  // 根据 target 类型一次性绑定滚动读取方法，避免每次 scroll 事件都做条件判断
  _bindScrollHelpers() {
    if (this._isOverallScroller) {
      this._getScrollTop = () => window.scrollY;
      this._getScrollLeft = () => window.scrollX;

      this._getScrollHeight = () => Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      );
    } else {
      const el = this.target;
      
      this._getScrollTop = () => el.scrollTop;
      this._getScrollLeft = () => el.scrollLeft;
      this._getScrollHeight = () => el.scrollHeight;
    }
  }

  _measure() {
    // 位置参考元素选择
    // FIXED 状态：root 脱离文档流，用 placeholder 的位置
    // BOTTOM 状态：root 有 relative 偏移，需减去偏移量
    // TOP 状态：root 在正常文档流中，直接测量
    const { STATE } = Affix;
    const refEl = (this.state === STATE.FIXED && this.placeholder) ? this.placeholder : this.root;

    const rect = refEl.getBoundingClientRect();
    const scrollTop = this._getScrollTop();
    const scrollLeft = this._getScrollLeft();

    // 原始宽高
    this._rootWidth = refEl.offsetWidth;
    this._rootHeight = this.root.offsetHeight; // 始终取 root 实际高度

    // 原始文档流位置
    this._rootTop = rect.top + scrollTop;

    if (this.state === STATE.BOTTOM && !this.placeholder) {
      // 减去当前的 relative 偏移，还原真实文档位置
      this._rootTop -= (parseFloat(this.root.style.top) || 0);
    }

    this._rootLeft = rect.left + (this._isOverallScroller ? 0 : scrollLeft);

    // 计算底部边界
    let bottomBoundary;

    if (this.container) {
      // 以 container 底边为基准
      const containerRect = this.container.getBoundingClientRect();
      bottomBoundary = containerRect.bottom + scrollTop - this.offsetBottom;
    } else {
      bottomBoundary = this._getScrollHeight() - this.offsetBottom;
    }

    // scrollTop 超过此值时切换到 BOTTOM
    this._scrollBottomLimit = bottomBoundary - this._rootHeight;

    // BOTTOM 状态时的 relative top 偏移
    this._bottomRelativeOffset = this._scrollBottomLimit - this._rootTop;
  }

  _applyState(newState) {
    if (this.state === newState) return;

    const oldState = this.state;
    const { STATE } = Affix;

    this._isUpdating = true;  // 防止 ResizeObserver 循环

    switch (newState) {
      case STATE.TOP:
        this._removePlaceholder();
        this.root.classList.remove('fixed');

        Object.assign(this.root.style, {
          position: '', left: '', top: '', width: '',
        });
        break;

      case STATE.FIXED:
        this._insertPlaceholder();
        this.root.classList.add('fixed');

        Object.assign(this.root.style, {
          position: '',  // 由 .fixed class 控制 position:fixed
          left: `${this._rootLeft}px`,
          top: `${this.offsetTop}px`,  // offsetTop 支持
          width: `${this._rootWidth}px`,  // 宽度同步
        });
        break;

      case STATE.BOTTOM:
        this._removePlaceholder();
        this.root.classList.remove('fixed');

        Object.assign(this.root.style, {
          position: 'relative',  // 让 top 偏移生效
          left: '',
          top: `${this._bottomRelativeOffset}px`,
          width: '',
        });
        break;
    }

    this.state = newState;
    this._isUpdating = false;

    // 状态变化回调
    if (typeof this.onChange === 'function') {
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

    // 考虑 offsetTop 计算 fixed 触发点
    const fixStart = this._rootTop - this.offsetTop;

    if (scrollTop < fixStart) {
      this._applyState(STATE.TOP);
    } else if (scrollTop <= this._scrollBottomLimit) {
      this._applyState(STATE.FIXED);
    } else {
      this._applyState(STATE.BOTTOM);
    }
  }

  _insertPlaceholder() {
    if (this.placeholder) return;

    this.placeholder = document.createElement('div');
    this.placeholder.className = 'affix-placeholder';

    Object.assign(this.placeholder.style, {
      width: `${this._rootWidth}px`,
      height: `${this._rootHeight}px`,
      visibility: 'hidden',
      pointerEvents: 'none',
    });

    this.root.parentNode?.insertBefore(this.placeholder, this.root);
  }

  _removePlaceholder() {
    if (!this.placeholder) return;

    this.placeholder.remove();
    this.placeholder = null;
  }

  // requestAnimationFrame 节流 scroll 回调
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
      this._measure();
      this._updateState();
    } catch (e) {
      console.warn('Affix: initialization failed', e);
      return;
    }

    // scroll 事件(passive 提升性能)
    this.target.addEventListener('scroll', this._handleScroll, { passive: true });

    // resize 事件(已节流)
    window.addEventListener('resize', this._handleResize);

    // ResizeObserver 替代 setInterval 轮询
    this._initResizeObserver();

    this.isInitialized = true;
  }

  // 用 ResizeObserver 精准监听尺寸变化，替代 setInterval 轮询
  _initResizeObserver() {
    if (typeof ResizeObserver === 'undefined') return;

    const handleResize = throttle(() => {
      if (this.isDisabled || this._isUpdating) return;
      this._measure();
      this._updateState();
    }, 200);

    this._resizeObserver = new ResizeObserver(handleResize);

    // 监听 root 本身(高度可能因内容变化)
    this._resizeObserver.observe(this.root);

    // 监听容器或上层元素(页面内容高度变化 → 影响 scrollHeight)
    const parentTarget = this.container || this.root.parentElement;
    
    if (parentTarget && parentTarget !== this.root) {
      this._resizeObserver.observe(parentTarget);
    }
  }

  /** 外部布局变化后手动刷新测量。 */
  refresh() {
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
    // 取消 rAF
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }

    // 移除事件监听
    this.target.removeEventListener('scroll', this._handleScroll);
    window.removeEventListener('resize', this._handleResize);

    // 断开 ResizeObserver
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }

    // 还原样式
    this._applyState(Affix.STATE.TOP);
    this.state = null;
    this.isInitialized = false;
  }
}
