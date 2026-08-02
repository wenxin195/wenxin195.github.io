import { throttle } from '@/utils/throttle.js';
import { scrollToHeading } from './anchor.js';

/**
 * 为文章标题构建并同步目录。
 */
export class Toc {
  /**
   * @const {!Object<string, *>}
   */
  static DEFAULTS = {
    selectors: 'h1,h2,h3',
    /** @type {(?Element|string)} 标题扫描根节点——调用方应传入 Element */
    container: null,
    scrollTarget: window,
    offset: 0,
    tolerance: 10,
    scrollDuration: 400,
    throttleInterval: 200,
    nested: false,
    syncHash: false,
    emptyText: '',
    disabled: false,
    onActiveChange: null,
  };

  /**
   * easeInOutQuad 缓动辅助函数。
   * @param {number} t
   * @return {number}
   */
  static easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  /**
   * @param {!Element} root
   * @param {{
   *   selectors: (string|undefined),
   *   container: (?Element|string|undefined),
   *   scrollTarget: (!EventTarget|undefined),
   *   offset: (number|undefined),
   *   tolerance: (number|undefined),
   *   scrollDuration: (number|undefined),
   *   throttleInterval: (number|undefined),
   *   nested: (boolean|undefined),
   *   syncHash: (boolean|undefined),
   *   emptyText: (string|undefined),
   *   disabled: (boolean|undefined),
   *   onActiveChange: ((function(number, ?Element): undefined)|undefined)
   * }=} options
   */
  constructor(root, options = {}) {
    if (!root || !(root instanceof Element)) {
      console.warn('[Toc] root Element is required.');
      return;
    }

    this.root = root;

    // 合并配置
    this._options = { ...Toc.DEFAULTS };
    this._mergeOptions(options);

    // 状态
    this.tocUl = null;
    this.tocItems = [];  // 与 headings 一一对应
    this.headings = [];
    this.headingsPos = [];
    this.activeIndex = -1;  // 当前激活索引，-1 表示无
    this.scrolling = false;  // 正在执行点击跳转的平滑滚动
    this._rendered = false;
    this._inited = false;
    this._rafId = null;  // 当前 rAF id，用于取消动画
    this._observer = null;

    // 预绑定事件处理函数(保存引用用于 removeEventListener)
    this._bindedOnScroll = throttle(() => this._onScroll(), this._options.throttleInterval);
    this._bindedOnResize = throttle(() => this._onResize(), this._options.throttleInterval);
    this._bindedOnClick = (e) => this._onClick(e);

    if (!this._options.disabled) {
      this.init();
    }
  }

  /** 初始化：渲染 → 测量 → 绑定 → 激活。 */
  init() {
    if (this._inited) return;

    this._resolveHeadings();
    this._render();
    this._bindEvents();
    this._calcPositions();
    this._updateActiveByScroll();

    this._inited = true;
  }

  /** 销毁实例：解绑事件、清理 DOM、重置状态。 */
  destroy() {
    this._unbindEvents();
    this._clearDOM();

    // 取消进行中的动画
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }

    // 销毁 IntersectionObserver(预留)
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }

    this.tocItems = [];
    this.headings = [];
    this.headingsPos = [];
    this.activeIndex = -1;
    this.scrolling = false;
    this._rendered = false;
    this._inited = false;
  }

  /** 重新扫描标题并渲染（适用于动态内容）。 */
  refresh() {
    const wasInited = this._inited;
    this.destroy();

    if (wasInited) {
      this.init();
    }
  }

  _mergeOptions(options) {
    const keys = Object.keys(Toc.DEFAULTS);

    keys.forEach((key) => {
      if (key in options) {
        this._options[key] = options[key];
      }
    });
  }

  // 解析容器，获取所有带 id 的标题元素
  _resolveHeadings() {
    const { container, selectors } = this._options;
    const containerEl = typeof container === 'string' ? document.querySelector(container) : container;

    if (containerEl) {
      this.headings = Array.from(containerEl.querySelectorAll(selectors)).filter((h) => h.id);
    } else {
      this.headings = [];
    }
  }

  // 渲染 TOC DOM
  _render() {
    if (this._rendered) return;

    // 空状态
    if (this.headings.length === 0) {
      this._renderEmpty();
      this._rendered = true;
      return;
    }

    this.tocItems = [];
    this.tocUl = this._options.nested ? this._buildNestedList() : this._buildFlatList();
    this.root.appendChild(this.tocUl);

    this._rendered = true;
  }

  // 构建扁平列表
  _buildFlatList() {
    const ul = document.createElement('ul');
    ul.className = 'toc toc--flat toc--ellipsis';

    this.headings.forEach((heading) => {
      const li = this._createTocItem(heading);

      ul.appendChild(li);
      this.tocItems.push(li);
    });

    return ul;
  }

  // 构建嵌套列表(h1 > h2 > h3 多级嵌套)
  _buildNestedList() {
    const rootUl = document.createElement('ul');
    rootUl.className = 'toc toc--nested toc--ellipsis';

    // stack: { level, ul }
    const stack = [{ level: 0, ul: rootUl }];

    this.headings.forEach((heading) => {
      const level = parseInt(heading.tagName[1], 10);

      // 回退到合适的父级
      while (stack.length > 1 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      let parent = stack[stack.length - 1];

      // 如果需要向下嵌套(处理跳级情况，如 h1 → h3)
      while (parent.level < level - 1) {
        const bridgeUl = document.createElement('ul');
        const lastLi = parent.ul.lastElementChild;

        if (lastLi && lastLi.tagName === 'LI') {
          lastLi.appendChild(bridgeUl);
        } else {
          // 没有 li，创建一个空壳 li 作为容器
          const wrapperLi = document.createElement('li');

          wrapperLi.className = 'toc-bridge';
          wrapperLi.appendChild(bridgeUl);
          parent.ul.appendChild(wrapperLi);
        }
        const bridgeLevel = parent.level + 1;

        stack.push({ level: bridgeLevel, ul: bridgeUl });
        parent = stack[stack.length - 1];
      }

      // 创建当前级别的 ul(如果还不存在)
      if (parent.level < level) {
        const newUl = document.createElement('ul');
        const lastLi = parent.ul.lastElementChild;

        if (lastLi && lastLi.tagName === 'LI') {
          lastLi.appendChild(newUl);
        } else {
          const wrapperLi = document.createElement('li');

          wrapperLi.className = 'toc-bridge';
          wrapperLi.appendChild(newUl);
          parent.ul.appendChild(wrapperLi);
        }

        stack.push({ level, ul: newUl });
        parent = stack[stack.length - 1];
      }

      const li = this._createTocItem(heading);

      parent.ul.appendChild(li);
      this.tocItems.push(li);
    });

    return rootUl;
  }

  // 创建单个 TOC 条目 <li><a>…</a></li>
  _createTocItem(heading) {
    const li = document.createElement('li');
    li.className = `toc-item toc-${heading.tagName.toLowerCase()}`;

    const a = document.createElement('a');
    a.textContent = heading.textContent.trim();
    a.href = `#${heading.id}`;
    a.title = heading.textContent.trim();

    li.appendChild(a);
    return li;
  }

  // 渲染空状态
  _renderEmpty() {
    const { emptyText } = this._options;

    if (!emptyText) {
      this.root.style.display = 'none';
      return;
    }

    const p = document.createElement('p');

    p.className = 'toc-empty';
    p.textContent = emptyText;
    this.root.appendChild(p);
  }

  // 清除 TOC DOM
  _clearDOM() {
    if (this.tocUl && this.tocUl.parentNode) {
      this.tocUl.parentNode.removeChild(this.tocUl);
    }

    this.tocUl = null;

    // 清理空状态
    const emptyEl = this.root.querySelector('.toc-empty');
    if (emptyEl) emptyEl.remove();

    // 恢复 display
    this.root.style.display = '';
  }

  // 绑定所有事件
  _bindEvents() {
    const scrollEl = this._getScrollElement();

    if (scrollEl) {
      scrollEl.addEventListener('scroll', this._bindedOnScroll, { passive: true });
    }

    window.addEventListener('resize', this._bindedOnResize);

    if (this.tocUl) {
      this.tocUl.addEventListener('click', this._bindedOnClick);
    }
  }

  // 解绑所有事件
  _unbindEvents() {
    const scrollEl = this._getScrollElement();

    if (scrollEl) {
      scrollEl.removeEventListener('scroll', this._bindedOnScroll);
    }

    window.removeEventListener('resize', this._bindedOnResize);

    if (this.tocUl) {
      this.tocUl.removeEventListener('click', this._bindedOnClick);
    }
  }

  // scroll 事件处理
  _onScroll() {
    if (this._options.disabled || this.scrolling) return;

    this._updateActiveByScroll();
  }

  // resize 事件处理
  _onResize() {
    if (this._options.disabled) return;
    this._calcPositions();
    this._updateActiveByScroll();
  }

  // TOC 点击事件(事件委托)
  _onClick(e) {
    const link = e.target.closest('a');
    if (!link) return;

    e.preventDefault();

    const href = link.getAttribute('href');
    if (!href || href.length < 2) return;

    // 使用 getElementById 避免特殊字符导致 querySelector 报错
    const targetId = href.slice(1);  // 去掉 '#'
    const targetHeading = document.getElementById(targetId);
    if (!targetHeading) return;

    history.replaceState(null, '', '#' + targetId);

    const li = link.closest('li');
    const index = this.tocItems.indexOf(li);
    if (index === -1) return;

    this.scrolling = true;
    this._setActive(index);

    this._scrollToHeading(targetHeading, () => {
      // 滚动结束后重新校准，防止位置偏差
      this._calcPositions();
      this.scrolling = false;
    });
  }

  // 获取当前 scrollTop
  _getScrollTop() {
    const target = this._options.scrollTarget;
    if (target === window) {
      return window.scrollY || window.pageYOffset;
    }
    return target ? target.scrollTop : 0;
  }

  // 获取实际绑定 scroll 事件的元素
  _getScrollElement() {
    const target = this._options.scrollTarget;
    return target === window ? window : target;
  }

  // 计算所有标题的绝对滚动位置
  _calcPositions() {
    const scrollTop = this._getScrollTop();
    const { offset } = this._options;

    this.headingsPos = this.headings.map((heading) => {
      const rect = heading.getBoundingClientRect();
      return Math.floor(rect.top + scrollTop - offset);
    });
  }

  // 根据当前滚动位置查找应激活的索引
  _findActiveIndex() {
    if (this.headingsPos.length === 0) return -1;

    const scrollTop = this._getScrollTop();
    const { tolerance } = this._options;
    let activeIndex = 0; // 默认第一个

    for (let i = 0; i < this.headingsPos.length; i++) {
      if (scrollTop >= this.headingsPos[i] - tolerance) {
        activeIndex = i;
      } else {
        break;
      }
    }

    return activeIndex;
  }

  // 根据滚动位置更新 active 状态
  _updateActiveByScroll() {
    const index = this._findActiveIndex();

    if (index !== -1) {
      this._setActive(index);
    }
  }

  // 设置指定索引为 active
  _setActive(index) {
    if (this._options.disabled) return;
    if (index === this.activeIndex) return;
    if (index < 0 || index >= this.tocItems.length) return;

    // 移除旧激活
    if (this.activeIndex >= 0 && this.tocItems[this.activeIndex]) {
      this.tocItems[this.activeIndex].classList.remove('active');
    }

    // 设置新激活
    this.activeIndex = index;
    this.tocItems[index].classList.add('active');

    // TOC 自身滚动跟随
    this._scrollFollowActive();

    // URL hash 同步
    if (this._options.syncHash && !this.scrolling) {
      this._syncHash(this.headings[index]);
    }

    // 触发回调
    if (typeof this._options.onActiveChange === 'function') {
      this._options.onActiveChange(this.headings[index], index);
    }
  }

  // 当 active 项超出 TOC 容器可视区时，自动滚动 TOC 使其可见
  _scrollFollowActive() {
    const activeEl = this.tocItems[this.activeIndex];
    if (!activeEl || !this.root) return;

    // 仅当 TOC 容器本身可滚动时才处理
    if (this.root.scrollHeight <= this.root.clientHeight) return;

    const containerRect = this.root.getBoundingClientRect();
    const itemRect = activeEl.getBoundingClientRect();

    const isAbove = itemRect.top < containerRect.top;
    const isBelow = itemRect.bottom > containerRect.bottom;

    if (isAbove || isBelow) {
      activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  // 更新 URL hash(不触发页面跳转)
  _syncHash(heading) {
    if (!heading || !heading.id) return;
    
    const hash = `#${heading.id}`;
    if (window.location.hash !== hash) {
      history.replaceState(null, '', hash);
    }
  }

  // 滚动到指定标题
  _scrollToHeading(heading, callback) {
    if (this._supportsNativeSmoothScroll() && this._options.offset === 0) {
      scrollToHeading(heading, { highlight: false });
      setTimeout(() => {
        if (callback) callback();
      }, this._options.scrollDuration + 50);
      return;
    }

    if (this._supportsNativeSmoothScroll()) {
      const targetPos = heading.getBoundingClientRect().top + this._getScrollTop() - this._options.offset;
      this._smoothScrollTo(targetPos, this._options.scrollDuration);

      setTimeout(() => {
        if (callback) callback();
      }, this._options.scrollDuration + 50);
      return;
    }

    // 降级：自定义平滑滚动
    const targetPos = heading.getBoundingClientRect().top + this._getScrollTop() - this._options.offset;
    this._smoothScrollTo(targetPos, this._options.scrollDuration, callback);
  }

  // 检测是否支持原生 smooth scroll
  _supportsNativeSmoothScroll() {
    return 'scrollBehavior' in document.documentElement.style;
  }

  // 自定义平滑滚动动画
  _smoothScrollTo(targetPos, duration = 400, callback) {
    // 取消之前未完成的滚动动画
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }

    const start = this._getScrollTop();
    const distance = targetPos - start;

    // 距离为 0，无需动画
    if (Math.abs(distance) < 1) {
      if (callback) callback();
      return;
    }

    const scrollTarget = this._options.scrollTarget;
    let startTime = null;

    const animate = (time) => {
      if (!startTime) startTime = time;

      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const scrollPos = start + distance * Toc.easeInOutQuad(progress);

      if (scrollTarget === window) {
        window.scrollTo(0, scrollPos);
      } else if (scrollTarget) {
        scrollTarget.scrollTop = scrollPos;
      }

      if (progress < 1) {
        this._rafId = requestAnimationFrame(animate);
      } else {
        this._rafId = null;
        if (callback) callback();
      }
    };

    this._rafId = requestAnimationFrame(animate);
  }

  /** 启用目录交互与同步。 */
  enable() {
    if (!this._options.disabled) return;
    this._options.disabled = false;

    if (!this._inited) {
      this.init();
    } else {
      this._calcPositions();
      this._updateActiveByScroll();
    }
  }

  /** 禁用目录交互并清除当前激活项。 */
  disable() {
    if (this._options.disabled) return;
    this._options.disabled = true;

    // 清除当前激活
    if (this.activeIndex >= 0 && this.tocItems[this.activeIndex]) {
      this.tocItems[this.activeIndex].classList.remove('active');
    }
    this.activeIndex = -1;
  }
}
