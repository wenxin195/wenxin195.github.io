/**
 * 水平滑动轮播原语。
 */
export class Swiper {
  /**
   * @const {!Object<string, *>}
   */
  static DEFAULTS = {
    initialSlide: 0,
    animation: true,
    animationDuration: 400,
    criticalAngle: Math.PI / 3,
    dampingFactor: 0.3,  // 边界阻尼系数
    loop: false,  // 循环模式
    autoPlay: 0,  // 自动轮播间隔(0 = 关闭)
    pagination: false,  // 分页指示器
    keyboard: false,  // 键盘导航
    onChange: null,
    onChangeEnd: null,
  };

  /**
   * @param {!Element} root
   * @param {{
   *   initialSlide: (number|undefined),
   *   animation: (boolean|undefined),
   *   animationDuration: (number|undefined),
   *   criticalAngle: (number|undefined),
   *   dampingFactor: (number|undefined),
   *   loop: (boolean|undefined),
   *   autoPlay: (number|undefined),
   *   pagination: (boolean|undefined),
   *   keyboard: (boolean|undefined),
   *   onChange: ((function(*): undefined)|undefined),
   *   onChangeEnd: ((function(*): undefined)|undefined)
   * }=} options
   */
  constructor(root, options = {}) {
    if (!root || !(root instanceof Element)) {
      throw new Error('Swiper: root Element is required.');
    }

    this._root = root;

    // 合并配置
    this._options = { ...Swiper.DEFAULTS, ...options };

    // 内部状态
    this._rootWidth = 0;
    this._count = 0;
    this._prevIndex = 0;
    this._curIndex = 0;
    this._translateX = 0;
    this._cachedAnimState = undefined; // 动画类缓存
    this._autoPlayTimer = null;
    this._destroyed = false;

    // 事件记录，用于 destroy 时统一移除
    this._boundHandlers = [];

    // DOM 引用
    this._wrapper = null;
    this._slides = [];
    this._btnPrev = null;
    this._btnNext = null;
    this._paginationEl = null;
    this._paginationDots = [];

    this._init();
  }

  /**
   * 将给定配置合并进当前选项。
   * @param {!Object<string, *>=} options
   */
  setOptions(options = {}) {
    for (const key of Object.keys(Swiper.DEFAULTS)) {
      if (options[key] !== undefined) {
        this._options[key] = options[key];
      }
    }
    this._applyCSSVariables();
  }

  /** 切换到上一张。 */
  previous() {
    this._move('prev');
  }

  /** 切换到下一张。 */
  next() {
    this._move('next');
  }

  /**
   * 跳转到指定幻灯片索引。
   * @param {number} index
   * @param {boolean=} animate
   */
  slideTo(index, animate = true) {
    const clamped = this._clampIndex(index);
    this._transition(clamped, { animation: animate });
  }

  /** 刷新布局，不重置当前索引。 */
  refresh() {
    this._measure();
    this._translateX = this._calcTranslateX(this._curIndex);
    this._setAnimationClass(false);
    this._applyTransform();
    this._updateButtonState();
    this._updatePagination();
  }

  /** 销毁实例并移除全部事件监听。 */
  destroy() {
    if (this._destroyed) return;
    this._destroyed = true;
    this._stopAutoPlay();

    for (const { target, event, handler, options } of this._boundHandlers) {
      target.removeEventListener(event, handler, options);
    }
    this._boundHandlers = [];

    if (this._paginationEl) {
      this._paginationEl.innerHTML = '';
      this._paginationDots = [];
    }
  }

  // 初始化
  _init() {
    this._queryElements();
    this._validate();
    this._applyCSSVariables();
    this._measure();

    this._curIndex = this._clampIndex(this._options.initialSlide);
    this._prevIndex = this._curIndex;
    this._translateX = this._calcTranslateX(this._curIndex);

    this._setAnimationClass(this._options.animation);
    this._applyTransform();
    this._activateSlide(this._curIndex);
    this._updateButtonState();

    if (this._options.pagination) {
      this._createPagination();
    }

    this._bindEvents();
    this._startAutoPlay();
  }

  // 统一使用: scope > .swiper__slide
  _queryElements() {
    this._wrapper = this._root.querySelector('.swiper__wrapper');
    this._slides = this._wrapper ? Array.from(this._wrapper.querySelectorAll(':scope > .swiper__slide')) : [];
    this._btnPrev = this._root.querySelector('.swiper__button--prev');
    this._btnNext = this._root.querySelector('.swiper__button--next');
    this._paginationEl = this._root.querySelector('.swiper__pagination');
  }

  // 校验必要 DOM
  _validate() {
    if (!this._wrapper) {
      throw new Error('Swiper: .swiper__wrapper not found.');
    }
    if (this._slides.length === 0) {
      console.warn('Swiper: no .swiper__slide found inside .swiper__wrapper.');
    }
  }

  // 仅做尺寸测量，不动 _curIndex
  _measure() {
    this._rootWidth = this._root.clientWidth;
    this._count = this._slides.length;

    if (this._count < 2 && !this._options.loop) {
      this._btnPrev?.classList.add('d-none');
      this._btnNext?.classList.add('d-none');
    }
  }

  // 暴露 CSS 自定义属性
  _applyCSSVariables() {
    this._root.style.setProperty(
      '--swiper-duration',
      `${this._options.animationDuration}ms`
    );
  }

  // 核心运动逻辑
  _clampIndex(index) {
    if (this._count === 0) return 0;
    return Math.max(0, Math.min(index, this._count - 1));
  }

  // 清晰的方向 → 下一索引
  _resolveNextIndex(direction) {
    const { loop } = this._options;
    const { _curIndex: cur, _count: total } = this;

    if (direction === 'prev') {
      if (cur > 0) return cur - 1;
      return loop ? total - 1 : cur;
    }
    if (direction === 'next') {
      if (cur < total - 1) return cur + 1;
      return loop ? 0 : cur;
    }
    return cur; // 'cur' → 回弹
  }

  // 简化后的 _move
  _move(direction) {
    const nextIndex = this._resolveNextIndex(direction);
    const unstable = this._translateX % this._rootWidth !== 0;

    if (nextIndex !== this._curIndex || unstable) {
      this._transition(nextIndex, { animation: true });
    }
  }

  // 统一的过渡入口
  _transition(index, { animation } = {}) {
    const animate = animation !== undefined ? animation : this._options.animation;

    this._prevIndex = this._curIndex;
    this._curIndex = index;
    this._translateX = this._calcTranslateX(this._curIndex);

    this._setAnimationClass(animate);
    this._applyTransform();
    this._updateActiveSlide(animate);
    this._updateButtonState();
    this._updatePagination();
  }

  _calcTranslateX(index) {
    return index <= 0 ? 0 : -this._rootWidth * index;
  }

  // DOM 更新方法，用 toggle 替代 if-add-else-remove
  _setAnimationClass(animate) {
    if (this._cachedAnimState === animate) return;

    this._wrapper.classList.toggle('swiper__wrapper--animation', animate);
    this._cachedAnimState = animate;
  }

  _applyTransform() {
    this._wrapper.style.transform = `translate(${this._translateX}px, 0)`;
  }

  // 只给一个 slide 加 active(初始化用)
  _activateSlide(index) {
    this._slides[index]?.classList.add('active');
  }

  // 修复回调参数，用 transitionend 替代 setTimeout，切换 active 并触发 onChange
  _updateActiveSlide(animate) {
    if (this._prevIndex === this._curIndex) return;

    const prevSlide = this._slides[this._prevIndex];
    const curSlide = this._slides[this._curIndex];

    prevSlide?.classList.remove('active');
    curSlide?.classList.add('active');

    // onChange 参数修正：传对象，语义清晰
    this._options.onChange?.({
      currentIndex: this._curIndex,
      currentSlide: curSlide,
      previousIndex: this._prevIndex,
      previousSlide: prevSlide,
    });

    // 非动画模式下直接触发 onChangeEnd
    if (!animate) {
      this._fireChangeEnd();
    }
    // 有动画时由 transitionend 事件触发
  }

  // 按钮状态
  _updateButtonState() {
    if (this._count < 2) return;
    const { loop } = this._options;

    this._btnPrev?.classList.toggle('disabled', !loop && this._curIndex <= 0);
    this._btnNext?.classList.toggle('disabled', !loop && this._curIndex >= this._count - 1);
  }

  // 统一的 onChangeEnd 触发
  _fireChangeEnd() {
    this._options.onChangeEnd?.({
      currentIndex: this._curIndex,
      currentSlide: this._slides[this._curIndex],
      previousIndex: this._prevIndex,
      previousSlide: this._slides[this._prevIndex],
    });
  }

  // 分页指示器
  _createPagination() {
    if (!this._paginationEl) return;

    this._paginationEl.innerHTML = '';
    this._paginationDots = [];

    for (let i = 0; i < this._count; i++) {
      const dot = document.createElement('span');
      dot.className = 'swiper__pagination-dot';
      if (i === this._curIndex) dot.classList.add('active');
      dot.dataset.index = String(i);
      this._paginationEl.appendChild(dot);
      this._paginationDots.push(dot);
    }

    // 事件委托
    this._on(this._paginationEl, 'click', (e) => {
      const dot = e.target.closest('.swiper__pagination-dot');
      if (dot) this.slideTo(Number(dot.dataset.index));
    });
  }

  _updatePagination() {
    for (let i = 0; i < this._paginationDots.length; i++) {
      this._paginationDots[i].classList.toggle('active', i === this._curIndex);
    }
  }

  // 自动轮播(鼠标悬停 / 触摸时暂停)
  _startAutoPlay() {
    const { autoPlay, loop } = this._options;
    if (!autoPlay || autoPlay <= 0) return;

    this._stopAutoPlay();
    this._autoPlayTimer = setInterval(() => {
      if (this._curIndex >= this._count - 1 && !loop) {
        this.slideTo(0);
      } else {
        this.next();
      }
    }, autoPlay);
  }

  _stopAutoPlay() {
    if (this._autoPlayTimer) {
      clearInterval(this._autoPlayTimer);
      this._autoPlayTimer = null;
    }
  }

  // 统一注册事件，方便 destroy 移除
  _on(target, event, handler, options) {
    target.addEventListener(event, handler, options);
    this._boundHandlers.push({ target, event, handler, options });
  }

  _bindEvents() {
    // 按钮
    if (this._btnPrev) {
      this._on(this._btnPrev, 'click', (e) => {
        e.stopPropagation();
        this._move('prev');
      });
    }
    if (this._btnNext) {
      this._on(this._btnNext, 'click', (e) => {
        e.stopPropagation();
        this._move('next');
      });
    }

    // resize 防抖
    let resizeTimer = null;
    this._on(window, 'resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => this.refresh(), 150);
    });

    // transitionend 替代 setTimeout
    this._on(this._wrapper, 'transitionend', (e) => {
      // 只响应 wrapper 自身的 transform 过渡
      if (e.target !== this._wrapper || e.propertyName !== 'transform') return;
      if (this._prevIndex !== this._curIndex) {
        this._fireChangeEnd();
      }
    });

    // 键盘导航
    if (this._options.keyboard) {
      this._on(document, 'keydown', (e) => {
        if (e.key === 'ArrowLeft') this._move('prev');
        else if (e.key === 'ArrowRight') this._move('next');
      });
    }

    // autoPlay 悬停暂停
    if (this._options.autoPlay) {
      this._on(this._root, 'mouseenter', () => this._stopAutoPlay());
      this._on(this._root, 'mouseleave', () => this._startAutoPlay());
    }

    // 拖拽(Touch + Mouse)
    this._bindDragEvents();
  }

  _bindDragEvents() {
    const { criticalAngle, dampingFactor } = this._options;

    let lastX = 0;
    let lastY = 0;
    let velocityX = 0;
    let lastTimestamp = 0;
    let dragStartTranslateX = 0;
    let touching = false;  // 正在横向拖拽
    let pressing = false;  // 鼠标按下
    let dragged = false;   // 发生过拖拽(用于拦截 click)

    const getPoint = (e) => (e.touches ? e.touches[0] : e);

    const handleStart = (e) => {
      const point = getPoint(e);
      lastX = point.pageX;
      lastY = point.pageY;
      velocityX = 0;
      lastTimestamp = e.timeStamp || Date.now();
      dragStartTranslateX = this._translateX;
      this._stopAutoPlay();
    };

    const handleMove = (e) => {
      if (e.touches && e.touches.length > 1) return;

      const point = getPoint(e);
      const deltaX = point.pageX - lastX;
      const deltaY = point.pageY - lastY;
      const now = e.timeStamp || Date.now();
      const dt = now - lastTimestamp || 1;

      velocityX = deltaX / dt;
      lastTimestamp = now;

      const angle = Math.abs(Math.atan(deltaY / (deltaX || 1)));
      if (e.cancelable && angle < criticalAngle) {
        touching = true;

        // 边界阻尼：超出范围时衰减移动量
        const minTx = -this._rootWidth * (this._count - 1);
        let adjustedDelta = deltaX;

        if (this._translateX > 0 || (this._translateX === 0 && deltaX > 0)) {
          adjustedDelta = deltaX * dampingFactor;
        } else if (this._translateX < minTx || (this._translateX === minTx && deltaX < 0)) {
          adjustedDelta = deltaX * dampingFactor;
        }

        // 拖拽过程中只更新 transform，不执行多余逻辑
        this._translateX += adjustedDelta;
        this._setAnimationClass(false);
        this._applyTransform();
      }

      lastX = point.pageX;
      lastY = point.pageY;
    };

    const handleEnd = () => {
      touching = false;

      const totalDelta = this._translateX - dragStartTranslateX;
      const projected = totalDelta + velocityX * this._rootWidth;

      if (Math.abs(projected) > this._rootWidth / 2) {
        this._move(projected > 0 ? 'prev' : 'next');
      } else {
        // 回弹到当前 slide
        this._transition(this._curIndex, { animation: true });
      }

      this._startAutoPlay();
    };

    // Touch 事件，touchstart 不需要 preventDefault，标记为 passive
    this._on(this._wrapper, 'touchstart', handleStart, { passive: true });
    this._on(this._wrapper, 'touchmove', handleMove);
    this._on(this._wrapper, 'touchend', handleEnd);
    this._on(this._wrapper, 'touchcancel', handleEnd);

    // Mouse 模拟 Touch
    this._on(this._wrapper, 'mousedown', (e) => {
      pressing = true;
      dragged = false;

      handleStart(e);
    });

    this._on(this._wrapper, 'mousemove', (e) => {
      if (!pressing) return;

      e.preventDefault();

      dragged = true;
      handleMove(e);
    });

    this._on(this._wrapper, 'mouseup', () => {
      if (!pressing) return;

      pressing = false;
      handleEnd();
    });

    this._on(this._wrapper, 'mouseleave', () => {
      if (!pressing) return;
      
      pressing = false;
      handleEnd();
    });

    // 拖拽后拦截 click
    this._on(this._wrapper, 'click', (e) => {
      if (dragged) {
        e.stopPropagation();
        dragged = false;
      }
    }, true);

    // 阻止页面在横向滑动时滚动
    this._on(this._root, 'touchmove', (e) => {
      if (e.cancelable && touching) {
        e.preventDefault();
      }
    }, { passive: false });
  }
}
