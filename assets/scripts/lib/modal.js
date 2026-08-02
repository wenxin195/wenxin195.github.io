/**
 * 弹层原语：不硬编码 `.js-*` 查询。
 * 需要锁定页面滚动时，由调用方传入 lockRoot / scrollElement。
 */
export class Modal {
  /** @type {number} */
  static activeCount = 0;

  /** @const {string} */
  static FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  /**
   * @param {!Element} element 弹层根节点
   * @param {{
   *   initialVisible: (boolean|undefined),
   *   onChange: ((function(*): *)|undefined),
   *   hideWhenWindowScroll: (boolean|undefined),
   *   closeOnBackdropClick: (boolean|undefined),
   *   trapFocus: (boolean|undefined),
   *   focusDelay: (number|undefined),
   *   lockRoot: (?Element|undefined),
   *   scrollElement: (?Element|undefined),
   *   lockClass: (string|undefined),
   *   bodyLockClass: (string|undefined)
   * }=} options
   */
  constructor(element, options = {}) {
    if (!element || !(element instanceof Element)) {
      throw new Error('Modal: element (Element) is required');
    }

    this.$root = element;

    this._visible = false;
    this._destroyed = false;
    this._scrollTop = 0;
    this._previousActiveElement = null;
    this._focusTimer = null;

    this._handleKeydown = null;
    this._handleScroll = null;
    this._handleBackdropClick = null;

    this._listeners = {};

    this._lockRoot = null;
    this._scrollElement = null;
    this._lockClass = 'show-modal';
    this._bodyLockClass = 'of-hidden';
    this._focusDelay = 0;

    this._applyOptions(options);
    this._init();
  }

  _applyOptions(options) {
    const {
      initialVisible = false,
      onChange = null,
      hideWhenWindowScroll = false,
      closeOnBackdropClick = true,
      trapFocus = true,
      focusDelay = 0,
      lockRoot = null,
      scrollElement = null,
      lockClass = 'show-modal',
      bodyLockClass = 'of-hidden',
    } = options;

    this._initialVisible = initialVisible;
    this._hideWhenWindowScroll = hideWhenWindowScroll;
    this._closeOnBackdropClick = closeOnBackdropClick;
    this._trapFocus = trapFocus;
    this._focusDelay = Math.max(0, Number(focusDelay) || 0);
    this._lockRoot = lockRoot instanceof Element ? lockRoot : null;
    this._scrollElement = scrollElement instanceof Element ? scrollElement : null;
    this._lockClass = lockClass || 'show-modal';
    this._bodyLockClass = bodyLockClass || 'of-hidden';

    if (typeof onChange === 'function') {
      this.on('change', onChange);
    }
  }

  _init() {
    this.$root.setAttribute('role', 'dialog');
    this.$root.setAttribute('aria-modal', 'true');
    this._setAriaHidden(true);

    if (this._initialVisible) {
      this.show();
    }
  }

  /** 显示弹层。 */
  show() {
    if (this._destroyed || this._visible) return;
    if (this.emit('beforeShow') === false) return;

    this._visible = true;
    Modal.activeCount++;

    this._saveScrollPosition();
    this._addModalClass();
    this._lockPage();
    this._bindEvents();
    this._setAriaHidden(false);

    // Defer focus so scrollIntoView cannot interrupt panel slide-in (TOC drawer).
    this._clearFocusTimer();
    if (this._focusDelay > 0) {
      this._previousActiveElement = document.activeElement;
      this._focusTimer = setTimeout(() => {
        this._focusTimer = null;
        if (this._visible) this._pushFocus({ rememberPrevious: false });
      }, this._focusDelay);
    } else {
      this._pushFocus();
    }

    this.emit('change', true);
    this.emit('afterShow');
  }

  /**
   * 隐藏弹层。
   * @param {{ restoreScroll: (boolean|undefined) }=} options
   *   restoreScroll — 默认 true；TOC 点链跳转时应传 false，避免拽回打开时的滚动位置
   */
  hide(options = {}) {
    if (this._destroyed || !this._visible) return;
    if (this.emit('beforeHide') === false) return;

    const restoreScroll = options.restoreScroll !== false;

    this._visible = false;
    if (Modal.activeCount > 0) Modal.activeCount--;

    this._clearFocusTimer();
    this._removeModalClass();
    this._unbindEvents();
    this._unlockPage();
    if (restoreScroll) {
      this._restoreScrollPosition();
    }
    this._setAriaHidden(true);
    this._popFocus();

    this.emit('change', false);
    this.emit('afterHide');
  }

  /** 切换弹层显示状态。 */
  toggle() {
    this._visible ? this.hide() : this.show();
  }

  /** 销毁弹层实例并释放资源。 */
  destroy() {
    if (this._destroyed) return;

    this.hide();
    this._clearFocusTimer();

    this._listeners = {};
    this.$root = null;
    this._lockRoot = null;
    this._scrollElement = null;
    this._previousActiveElement = null;
    this._destroyed = true;
  }

  /** @return {boolean} */
  get visible() {
    return this._visible;
  }

  /** @return {?Element} */
  get el() {
    return this.$root;
  }

  /**
   * @param {string} event
   * @param {function(...*): *} callback
   * @return {!Modal}
   */
  on(event, callback) {
    (this._listeners[event] ??= []).push(callback);
    return this;
  }

  /**
   * @param {string} event
   * @param {function(...*): *} callback
   * @return {!Modal}
   */
  off(event, callback) {
    const list = this._listeners[event];
    if (!list) return this;

    this._listeners[event] = list.filter((fn) => fn !== callback);
    return this;
  }

  /**
   * @param {string} event
   * @param {...*} args
   * @return {boolean}
   */
  emit(event, ...args) {
    const list = this._listeners[event];
    if (!list || list.length === 0) return true;

    for (const fn of list) {
      if (fn(...args) === false) return false;
    }
    return true;
  }

  _addModalClass() {
    this.$root.classList.add('modal--show');
  }

  _removeModalClass() {
    this.$root.classList.remove('modal--show');
  }

  _setAriaHidden(hidden) {
    this.$root?.setAttribute('aria-hidden', String(hidden));
  }

  _saveScrollPosition() {
    this._scrollTop =
      window.scrollY || (this._scrollElement ? this._scrollElement.scrollTop : 0);
  }

  _restoreScrollPosition() {
    window.scrollTo(0, this._scrollTop);
  }

  _lockPage() {
    if (this._scrollElement) {
      this._scrollElement.scrollTop = this._scrollTop;
    }

    if (Modal.activeCount === 1) {
      if (this._lockRoot && this._lockClass) {
        this._lockRoot.classList.add(this._lockClass);
      }
      if (this._bodyLockClass) {
        document.body.classList.add(this._bodyLockClass);
      }
    }
  }

  _unlockPage() {
    if (Modal.activeCount === 0) {
      if (this._lockRoot && this._lockClass) {
        this._lockRoot.classList.remove(this._lockClass);
      }
      if (this._bodyLockClass) {
        document.body.classList.remove(this._bodyLockClass);
      }
    }
  }

  _bindEvents() {
    this._handleKeydown = (e) => {
      if (e.key === 'Escape') {
        this.hide();
      } else if (e.key === 'Tab' && this._trapFocus) {
        this._constrainTab(e);
      }
    };
    window.addEventListener('keydown', this._handleKeydown);

    if (this._hideWhenWindowScroll && 'ontouchstart' in window) {
      this._handleScroll = () => this.hide();

      window.addEventListener('scroll', this._handleScroll, {
        once: true,
        passive: true,
      });
    }

    if (this._closeOnBackdropClick) {
      this._handleBackdropClick = (e) => {
        if (e.target === this.$root) this.hide();
      };
      this.$root.addEventListener('click', this._handleBackdropClick);
    }
  }

  _unbindEvents() {
    if (this._handleKeydown) {
      window.removeEventListener('keydown', this._handleKeydown);
      this._handleKeydown = null;
    }

    if (this._handleScroll) {
      window.removeEventListener('scroll', this._handleScroll);
      this._handleScroll = null;
    }

    if (this._handleBackdropClick) {
      this.$root?.removeEventListener('click', this._handleBackdropClick);
      this._handleBackdropClick = null;
    }
  }

  _getFocusableElements() {
    if (!this.$root) return [];
    return Array.from(this.$root.querySelectorAll(Modal.FOCUSABLE_SELECTOR));
  }

  _clearFocusTimer() {
    if (this._focusTimer != null) {
      clearTimeout(this._focusTimer);
      this._focusTimer = null;
    }
  }

  /**
   * @param {{ rememberPrevious: (boolean|undefined) }=} options
   */
  _pushFocus(options = {}) {
    if (options.rememberPrevious !== false) {
      this._previousActiveElement = document.activeElement;
    }

    const targets = this._getFocusableElements();
    const focusEl = targets.length > 0 ? targets[0] : this.$root;
    if (targets.length === 0) {
      this.$root.setAttribute('tabindex', '-1');
    }
    try {
      focusEl.focus({ preventScroll: true });
    } catch (_) {
      focusEl.focus();
    }
  }

  _popFocus() {
    if (
      this._previousActiveElement && typeof this._previousActiveElement.focus === 'function'
    ) {
      this._previousActiveElement.focus();
    }

    this._previousActiveElement = null;
  }

  _constrainTab(e) {
    const focusable = this._getFocusableElements();
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const { activeElement } = document;

    if (e.shiftKey && activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}
