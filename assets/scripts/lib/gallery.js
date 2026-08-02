import { Swiper } from './swiper.js';

/**
 * 图片图库：支持滑动切换与捏合/双击缩放。
 */
export class Gallery {
  /**
   * @const {!Object<string, *>}
   */
  static DEFAULTS = Object.freeze({
    minZoom: 0.5,  // 最小缩放
    maxZoom: 4,  // 最大缩放
    doubleTapZoom: 2,  // 双击放大倍数
    doubleTapInterval: 300,  // 双击判定间隔(ms)
    disabled: false,
    swiperOptions: {},  // 透传给 Swiper 的配置
  });

  /** @const {number} */
  static DEFAULT_ZOOM = 1;

  /** @const {{x: number, y: number}} */
  static DEFAULT_TRANSLATE = Object.freeze({ x: 0, y: 0 });

  /**
   * @param {!Element} root
   * @param {!Array<{src: string, alt: (string|undefined), caption: (string|undefined)}>} items
   * @param {{
   *   minZoom: (number|undefined),
   *   maxZoom: (number|undefined),
   *   doubleTapZoom: (number|undefined),
   *   doubleTapInterval: (number|undefined),
   *   disabled: (boolean|undefined),
   *   swiperOptions: (!Object<string, *>|undefined)
   * }=} options
   */
  constructor(root, items, options = {}) {
    if (!root || !(root instanceof Element)) {
      throw new Error('Gallery: root Element is required.');
    }

    this._root = root;

    this._items = Array.isArray(items) ? items : [];
    this._options = { ...Gallery.DEFAULTS, ...options };

    // DOM 引用
    this._swiperEl = null;
    this._wrapper = null;
    this._swiper = null;
    this._slideEls = [];
    this._imgEls = [];
    this._activeContent = null;  // 当前 slide 内的 .gallery-item__content
    this._counterEl = null;  // 计数器
    this._captionEl = null;  // 标题

    // 布局尺寸
    this._contentWidth = 0;
    this._contentHeight = 0;

    // 状态
    this._disabled = this._options.disabled;
    this._curIndex = 0;

    // 缩放 / 平移状态
    this._zoom = Gallery.DEFAULT_ZOOM;
    this._lastZoom = Gallery.DEFAULT_ZOOM;
    this._translate = { ...Gallery.DEFAULT_TRANSLATE };
    this._lastTranslate = null;
    this._touchCenter = null;
    this._lastTouchCenter = null;
    this._zoomRect = null;  // 修复：不再重复赋值 lastZoomRect
    this._lastZoomRect = null;

    // 双击检测
    this._lastTapTime = 0;

    // 事件管理
    this._boundHandlers = [];
    this._resizeTimer = null;
    this._destroyed = false;

    this._init();
  }

  /** 刷新底层 swiper 与图片尺寸。 */
  refresh() {
    this._swiper?.refresh();
    this._resizeImages();
  }

  /**
   * @param {number} index
   * @param {boolean=} animate
   */
  slideTo(index, animate = true) {
    this._swiper?.slideTo(index, animate);
  }

  /**
   * @param {{
   *   disabled: (boolean|undefined),
   *   swiperOptions: (!Object<string, *>|undefined)
   * }=} options
   */
  setOptions(options = {}) {
    if (options.disabled !== undefined) {
      this._disabled = options.disabled;
    }
    if (options.swiperOptions) {
      this._swiper?.setOptions(options.swiperOptions);
    }
  }

  /** 销毁实例并移除全部事件与 DOM。 */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;

    for (const { target, event, handler, opts } of this._boundHandlers) {
      target.removeEventListener(event, handler, opts);
    }
    this._boundHandlers = [];

    clearTimeout(this._resizeTimer);

    this._swiper?.destroy();
    this._swiper = null;

    this._swiperEl?.remove();
    this._counterEl?.remove();
    this._captionEl?.remove();
  }

  _init() {
    this._buildDOM();
    this._resizeImages();  // 首次计算并应用图片尺寸
    this._initSwiper();
    this._bindEvents();
    this._setInitialActiveContent();
    this._updateCounter();
    this._updateCaption();
  }

  // DOM 构建 — 全部使用 DOM API，杜绝 HTML 拼接
  _buildDOM() {
    // --- Swiper 容器 ---
    this._swiperEl = this._createElement('div', 'swiper gallery__swiper');
    this._wrapper = this._createElement('div', 'swiper__wrapper');

    for (let i = 0; i < this._items.length; i++) {
      const { slideEl, imgEl } = this._createSlide(this._items[i], i);
      this._slideEls.push(slideEl);
      this._imgEls.push(imgEl);
      this._wrapper.appendChild(slideEl);
    }

    const btnPrev = this._createElement(
      'div',
      'swiper__button swiper__button--prev fas fa-chevron-left'
    );
    const btnNext = this._createElement(
      'div',
      'swiper__button swiper__button--next fas fa-chevron-right'
    );

    this._swiperEl.append(this._wrapper, btnPrev, btnNext);

    // 计数器 & 标题
    this._counterEl = this._createElement('div', 'gallery__counter');
    this._captionEl = this._createElement('div', 'gallery__caption');

    this._root.append(this._swiperEl, this._counterEl, this._captionEl);
  }

  // 创建单个 slide(含 loading / error 状态)
  _createSlide(item, index) {
    const slide = this._createElement('div', 'swiper__slide');
    const galleryItem = this._createElement('div', 'gallery-item gallery-item--loading');
    const content = this._createElement('div', 'gallery-item__content');
    const img = document.createElement('img');

    img.alt = item.title || item.caption || `Image ${index + 1}`;

    // 图片加载状态
    img.addEventListener('load', () => {
      galleryItem.classList.remove('gallery-item--loading');
      galleryItem.classList.add('gallery-item--loaded');
    });
    img.addEventListener('error', () => {
      galleryItem.classList.remove('gallery-item--loading');
      galleryItem.classList.add('gallery-item--error');
    });

    // 先绑监听再设 src，保证捕获事件
    img.src = item.src;

    content.appendChild(img);
    galleryItem.appendChild(content);
    slide.appendChild(galleryItem);

    return { slideEl: slide, imgEl: img };
  }

  // 工具：创建带 className 的元素
  _createElement(tag, className) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    return el;
  }

  // 图片尺寸计算 | resize 只处理图片 | 防抖
  _measureContent() {
    this._contentWidth = this._wrapper?.clientWidth || 0;
    this._contentHeight = this._wrapper?.clientHeight || 0;
  }

  _calculateImageSize(w, h) {
    let scale = 1;

    if (this._contentWidth > 0 && this._contentHeight > 0 && w > 0 && h > 0) {
      scale = Math.min(
        Math.min(w, this._contentWidth) / w,
        Math.min(h, this._contentHeight) / h
      );
    }
    return {
      w: Math.floor(w * scale),
      h: Math.floor(h * scale),
    };
  }

  _resizeImages() {
    this._measureContent();
    for (let i = 0; i < this._items.length; i++) {
      const item = this._items[i];
      const size = this._calculateImageSize(item.w, item.h);
      const img = this._imgEls[i];
      if (img) {
        img.style.width = `${size.w}px`;
        img.style.height = `${size.h}px`;
      }
    }
  }

  // Swiper 集成 | 回调签名适配 | 独立引入 | 键盘委托
  _initSwiper() {
    if (!this._swiperEl) return;

    this._swiper = new Swiper(this._swiperEl, {
      animation: true,
      keyboard: true,   // 键盘导航交由 Swiper 内置处理
      ...this._options.swiperOptions,

      // 适配新 Swiper 的回调签名(对象参数)
      onChange: (detail) => this._handleChange(detail),
      onChangeEnd: (detail) => this._handleChangeEnd(detail),
    });
  }

  // slide 开始切换时立即更新计数器 / 标题
  _handleChange({ currentIndex }) {
    this._curIndex = currentIndex;
    this._updateCounter();
    this._updateCaption();
  }

  // 修复 zoomRect 重复赋值,适配新回调签名,slide 过渡结束后重置缩放状态
  _handleChangeEnd({ currentIndex, currentSlide, previousSlide }) {
    this._curIndex = currentIndex;

    // 重置前一张 slide 的 transform
    const prevContent = previousSlide?.querySelector('.gallery-item__content');
    if (prevContent) {
      this._applyTransform(prevContent, Gallery.DEFAULT_ZOOM, Gallery.DEFAULT_TRANSLATE);
      prevContent.classList.remove('zoom');
    }

    // 设置新的 activeContent
    this._activeContent = currentSlide?.querySelector('.gallery-item__content') || null;

    // 正确重置两个不同的变量
    this._resetZoomState();
  }

  _setInitialActiveContent() {
    const firstSlide = this._slideEls[0];
    if (firstSlide) {
      this._activeContent = firstSlide.querySelector('.gallery-item__content');
    }
  }

  // 计数器 / 标题
  _updateCounter() {
    if (!this._counterEl || this._items.length === 0) return;
    this._counterEl.textContent = `${this._curIndex + 1} / ${this._items.length}`;
  }

  _updateCaption() {
    if (!this._captionEl) return;
    const item = this._items[this._curIndex];
    const text = item?.title || item?.caption || '';
    this._captionEl.textContent = text;
    this._captionEl.classList.toggle('d-none', !text);
  }

  // GPU 合成层加速
  _applyTransform(el, zoom, translate) {
    if (!el) return;
    const { x, y } = translate;
    el.style.transform = `scale3d(${zoom},${zoom},1) translate3d(${x}px,${y}px,0)`;
  }

  // 正确重置(zoomRect 与 lastZoomRect 分别赋值)
  _resetZoomState() {
    this._zoom = Gallery.DEFAULT_ZOOM;
    this._lastZoom = Gallery.DEFAULT_ZOOM;
    this._translate = { ...Gallery.DEFAULT_TRANSLATE };
    this._lastTranslate = null;
    this._touchCenter = null;
    this._lastTouchCenter = null;
    this._zoomRect = null;
    this._lastZoomRect = null;
  }

  // 限制缩放范围
  _clampZoom(zoom) {
    return Math.max(this._options.minZoom, Math.min(this._options.maxZoom, zoom));
  }

  _computeZoom() {
    if (!this._zoomRect || !this._lastZoomRect) return;

    const newW = this._zoomRect.w + this._zoomRect.h;
    const oldW = this._lastZoomRect.w + this._lastZoomRect.h;
    if (oldW === 0) return;

    this._zoom = this._clampZoom((newW / oldW) * this._lastZoom);

    // 空值保护
    if (this._activeContent) {
      this._activeContent.classList.toggle('zoom', this._zoom > Gallery.DEFAULT_ZOOM);
    }
  }

  _computeTranslate() {
    if (!this._touchCenter || !this._lastTouchCenter) {
      this._translate = { ...Gallery.DEFAULT_TRANSLATE };
      return;
    }
    const prev = this._lastTranslate || Gallery.DEFAULT_TRANSLATE;
    const z = this._zoom || 1;
    this._translate = {
      x: (this._touchCenter.x - this._lastTouchCenter.x) / z + prev.x,
      y: (this._touchCenter.y - this._lastTouchCenter.y) / z + prev.y,
    };
  }

  // 双击缩放
  _handleDoubleTap() {
    if (!this._activeContent) return;

    if (this._zoom > Gallery.DEFAULT_ZOOM) {
      // 已放大 → 还原
      this._zoom = Gallery.DEFAULT_ZOOM;
      this._translate = { ...Gallery.DEFAULT_TRANSLATE };
    } else {
      // 未放大 → 放大到 doubleTapZoom
      this._zoom = this._clampZoom(this._options.doubleTapZoom);
      this._translate = { ...Gallery.DEFAULT_TRANSLATE };
    }

    this._lastZoom = this._zoom;
    this._lastTranslate = { ...this._translate };

    this._activeContent.classList.toggle('zoom', this._zoom > Gallery.DEFAULT_ZOOM);

    // 加过渡动画使双击缩放平滑
    this._activeContent.style.transition = 'transform 0.3s ease';
    this._applyTransform(this._activeContent, this._zoom, this._translate);

    // 过渡结束后清除 transition，避免影响手势拖拽
    const onEnd = () => {
      this._activeContent.style.transition = '';
      this._activeContent.removeEventListener('transitionend', onEnd);
    };
    this._activeContent.addEventListener('transitionend', onEnd);
  }

  // 统一注册事件，便于 destroy 时批量移除
  _on(target, event, handler, opts) {
    target.addEventListener(event, handler, opts);
    this._boundHandlers.push({ target, event, handler, opts });
  }

  _bindEvents() {
    // resize：只处理图片，带防抖
    this._on(window, 'resize', () => {
      if (this._disabled) return;
      clearTimeout(this._resizeTimer);
      this._resizeTimer = setTimeout(() => this._resizeImages(), 150);
    });

    // 缩放 / 平移手势
    this._bindZoomEvents();

    // 阻止画廊内页面滚动(横向拖拽时)
    this._on(this._root, 'touchmove', (e) => {
      if (!this._disabled && e.cancelable) { // 修复 & → &&(此处为新逻辑，无原始 bug)
        e.preventDefault();
      }
    }, { passive: false });
  }

  // 双指缩放 + 单指平移(仅放大状态) + 双击缩放
  _bindZoomEvents() {
    let startFingerCount = 0;
    let singleFingerMoved = false; // 标记单指是否有移动(用于区分 tap 与 pan)

    const getRect = (t0, t1) => ({
      o: { x: (t0.pageX + t1.pageX) / 2, y: (t0.pageY + t1.pageY) / 2 },
      w: Math.abs(t0.pageX - t1.pageX),
      h: Math.abs(t0.pageY - t1.pageY),
    });

    // touchstart
    this._on(this._wrapper, 'touchstart', (e) => {
      if (this._disabled) return;
      startFingerCount = e.touches.length;
      singleFingerMoved = false;

      if (startFingerCount > 1) {
        const rect = getRect(e.touches[0], e.touches[1]);
        this._lastZoomRect = { w: rect.w, h: rect.h };
        this._lastTouchCenter = rect.o;
      } else {
        const t = e.touches[0];
        this._lastTouchCenter = { x: t.pageX, y: t.pageY };
      }
    }, { passive: true }); // touchstart 不需要 preventDefault

    // touchmove
    this._on(this._wrapper, 'touchmove', (e) => {
      if (this._disabled) return;
      if (startFingerCount !== e.touches.length) return;

      if (startFingerCount > 1) {
        // 双指：缩放 + 平移
        const rect = getRect(e.touches[0], e.touches[1]);
        this._zoomRect = { w: rect.w, h: rect.h };
        this._touchCenter = rect.o;
        this._computeZoom();
        this._computeTranslate();
        this._applyTransform(this._activeContent, this._zoom, this._translate);
      } else if (this._zoom > Gallery.DEFAULT_ZOOM) {
        // 单指且已放大：平移
        singleFingerMoved = true;
        const t = e.touches[0];
        this._touchCenter = { x: t.pageX, y: t.pageY };
        this._computeTranslate();
        this._applyTransform(this._activeContent, this._zoom, this._translate);
      }
    });

    // touchend
    this._on(this._wrapper, 'touchend', (e) => {
      if (this._disabled) return;

      this._lastZoom = this._zoom;
      this._lastTranslate = this._translate ? { ...this._translate } : null;
      this._lastTouchCenter = null;

      // 双击检测(仅单指 tap，无明显移动)
      if (startFingerCount === 1 && !singleFingerMoved) {
        const now = Date.now();
        if (now - this._lastTapTime < this._options.doubleTapInterval) {
          this._handleDoubleTap();
          this._lastTapTime = 0; // 防止三连击
        } else {
          this._lastTapTime = now;
        }
      }

      startFingerCount = 0;
    });

    this._on(this._wrapper, 'touchcancel', () => {
      this._lastZoom = this._zoom;
      this._lastTranslate = this._translate ? { ...this._translate } : null;
      startFingerCount = 0;
    });
  }
}
