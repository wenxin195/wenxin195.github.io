/**
 * @fileoverview 唯一允许的加载器全局对象：`window.Lazyload`。
 * 以经典（非模块）脚本从 base 加载，供 Liquid 等直接调用。
 * 应用 ESM 模块应优先 `import { getLazyload } from '@/utils/lazyload.js'`。
 */
(function () {
  const doc = document;
  const head = doc.head || doc.getElementsByTagName('head')[0];

  /** @const {number} */
  const STATE_PENDING = 1;
  /** @const {number} */
  const STATE_LOADED = 2;
  /** @const {number} */
  const STATE_ERROR = 3;

  const sources = { js: {}, css: {} };
  const queue = { js: [], css: [] };

  const api = {
    /**
     * 超时时间（毫秒）；0 表示不超时。
     * @type {number}
     */
    timeout: 15000,
    /**
     * @param {string|!Array<string>} urls
     * @param {function(): undefined=} callback
     * @return {!Promise<undefined>}
     */
    js: function (urls, callback) {
      return load('js', urls, callback);
    },
    /**
     * @param {string|!Array<string>} urls
     * @param {function(): undefined=} callback
     * @return {!Promise<undefined>}
     */
    css: function (urls, callback) {
      return load('css', urls, callback);
    },
    /**
     * @param {string} url
     * @return {boolean}
     */
    isLoaded: function (url) {
      return sources.js[url] === STATE_LOADED || sources.css[url] === STATE_LOADED;
    },
    /**
     * @param {string} url
     * @return {string}
     */
    getState: function (url) {
      const state = sources.js[url] || sources.css[url];
      if (state === STATE_PENDING) return 'pending';
      if (state === STATE_LOADED) return 'loaded';
      if (state === STATE_ERROR) return 'error';
      return 'unregistered';
    },
  };

  /**
   * @param {string|!Array<string>|!Set<string>|undefined} input
   * @return {!Set<string>}
   */
  function toSet(input) {
    if (typeof input === 'string') return new Set([input]);
    return new Set(input || []);
  }

  /**
   * @param {!Set<string>} a
   * @param {!Set<string>} b
   * @return {boolean}
   */
  function isSetEqual(a, b) {
    if (a.size !== b.size) return false;
    for (const item of a) {
      if (!b.has(item)) return false;
    }
    return true;
  }

  /**
   * @param {!Array<*>} queueList
   * @param {!Set<string>} urlSet
   * @return {?Object}
   */
  function findMatchingTask(queueList, urlSet) {
    for (const task of queueList) {
      if (isSetEqual(urlSet, task.urls)) return task;
    }
    return null;
  }

  function settleTask(task, sourceMap) {
    if (task.settled) return;

    for (const url of task.urls) {
      if (sourceMap[url] === STATE_ERROR) {
        task.settled = true;
        const error = new Error('[Lazyload] Failed to load: ' + url);
        task.rejects.forEach(function (fn) { fn(error); });
        task.callbacks.length = 0;
        task.resolves.length = 0;
        task.rejects.length = 0;
        return;
      }
    }

    for (const url of task.urls) {
      if (sourceMap[url] !== STATE_LOADED) return;
    }

    task.settled = true;
    task.callbacks.forEach(function (fn) { fn(); });
    task.resolves.forEach(function (fn) { fn(); });
    task.callbacks.length = 0;
    task.resolves.length = 0;
    task.rejects.length = 0;
  }

  function createNode(tagName, attrs) {
    const node = doc.createElement(tagName);
    for (const key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key)) {
        node.setAttribute(key, attrs[key]);
      }
    }
    return node;
  }

  function isAlreadyInDOM(type, url) {
    if (type === 'js') {
      return !!doc.querySelector('script[src="' + url + '"]');
    }
    return !!doc.querySelector('link[href="' + url + '"]');
  }

  function onResourceDone(type, url, success) {
    const sourceMap = sources[type];
    if (sourceMap[url] === STATE_LOADED || sourceMap[url] === STATE_ERROR) return;

    sourceMap[url] = success ? STATE_LOADED : STATE_ERROR;

    for (const task of queue[type]) {
      if (!task.settled && task.urls.has(url)) {
        settleTask(task, sourceMap);
      }
    }
  }

  /**
   * @param {string} type
   * @param {string|!Array<string>} urls
   * @param {function(): undefined=} callback
   * @return {!Promise<undefined>}
   */
  function load(type, urls, callback) {
    const urlSet = toSet(urls);
    const sourceMap = sources[type];
    const queueList = queue[type];
    const existingTask = findMatchingTask(queueList, urlSet);

    return new Promise(function (resolve, reject) {
      if (existingTask) {
        if (existingTask.settled) {
          let errorUrl = null;
          for (const url of existingTask.urls) {
            if (sourceMap[url] === STATE_ERROR) {
              errorUrl = url;
              break;
            }
          }
          if (errorUrl) {
            reject(new Error('[Lazyload] Failed to load: ' + errorUrl));
          } else {
            if (callback) callback();
            resolve();
          }
        } else {
          if (callback) existingTask.callbacks.push(callback);
          existingTask.resolves.push(resolve);
          existingTask.rejects.push(reject);
        }
        return;
      }

      const task = {
        urls: urlSet,
        callbacks: callback ? [callback] : [],
        resolves: [resolve],
        rejects: [reject],
        settled: false,
      };

      queueList.push(task);

      for (const url of urlSet) {
        if (sourceMap[url] !== undefined) continue;

        if (isAlreadyInDOM(type, url)) {
          sourceMap[url] = STATE_LOADED;
          continue;
        }

        let node;
        if (type === 'js') {
          node = createNode('script', { src: url });
          node.async = true;
        } else {
          node = createNode('link', { rel: 'stylesheet', href: url });
        }

        sourceMap[url] = STATE_PENDING;

        node.onload = function () {
          onResourceDone(type, url, true);
        };

        node.onerror = function () {
          console.error('[Lazyload] Failed to load: ' + url);
          onResourceDone(type, url, false);
        };

        head.appendChild(node);

        const timeout = api.timeout;
        if (timeout > 0) {
          setTimeout(function () {
            if (sourceMap[url] === STATE_PENDING) {
              console.warn('[Lazyload] Timeout (' + timeout + 'ms): ' + url);
              onResourceDone(type, url, false);
            }
          }, timeout);
        }
      }

      settleTask(task, sourceMap);
    });
  }

  window.Lazyload = api;
})();
