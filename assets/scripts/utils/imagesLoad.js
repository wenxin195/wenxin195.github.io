/**
 * @param {*|!IArrayLike<*>} arrayLike
 * @return {!Array<*>}
 */
function toArray(arrayLike) {
  if (Array.isArray(arrayLike)) return arrayLike;
  return Array.prototype.slice.call(arrayLike);
}

/**
 * 等待一组图片加载完成（失败或超时也会结束）。
 * @param {(string|!IArrayLike<!HTMLImageElement>|!Array<!HTMLImageElement>)=} images
 * @param {{
 *   timeout: (number|undefined),
 *   onProgress: ((function({
 *     loaded: !Array<!HTMLImageElement>,
 *     failed: !Array<!HTMLImageElement>,
 *     total: number,
 *     loadedCount: number,
 *     failedCount: number,
 *     timedOut: boolean
 *   }): undefined)|undefined)
 * }=} options
 * @return {{
 *   then: function(function({
 *     loaded: !Array<!HTMLImageElement>,
 *     failed: !Array<!HTMLImageElement>,
 *     total: number,
 *     loadedCount: number,
 *     failedCount: number,
 *     timedOut: boolean
 *   }): *=): *,
 *   add: function((string|!HTMLElement|!IArrayLike<!HTMLImageElement>)=): *,
 *   promise: !Promise<*>
 * }}
 */
export function imagesLoad(images, options) {
  options = options || {};

  if (typeof images === 'string') {
    images = document.querySelectorAll(images);
  }
  images = images || document.getElementsByTagName('img');
  images = toArray(images);

  let total = 0;
  let loadedCount = 0;
  let failedCount = 0;
  let done = false;
  let timedOut = false;
  let timeoutId = null;

  const loadedImages = [];
  const failedImages = [];
  const callbacks = [];

  let resolvePromise;
  const nativePromise = new Promise(function (resolve) {
    resolvePromise = resolve;
  });

  function buildResult() {
    return {
      loaded: loadedImages.slice(),
      failed: failedImages.slice(),
      total: total,
      loadedCount: loadedCount,
      failedCount: failedCount,
      timedOut: timedOut,
    };
  }

  function notifyProgress() {
    if (typeof options.onProgress === 'function') {
      options.onProgress(buildResult());
    }
  }

  function flushCallbacks(result) {
    const fns = callbacks.slice();
    callbacks.length = 0;
    for (let i = 0; i < fns.length; i++) {
      fns[i](result);
    }
  }

  function clearTimer() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  function checkComplete() {
    if (done) return;
    if (loadedCount + failedCount < total) return;

    done = true;
    clearTimer();

    const result = buildResult();
    flushCallbacks(result);

    if (resolvePromise) {
      resolvePromise(result);
      resolvePromise = null;
    }
  }

  function trackImage(img) {
    function onLoad() {
      cleanup();
      loadedImages.push(img);
      loadedCount++;
      notifyProgress();
      checkComplete();
    }

    function onError() {
      cleanup();
      failedImages.push(img);
      failedCount++;
      notifyProgress();
      checkComplete();
    }

    function cleanup() {
      img.removeEventListener('load', onLoad);
      img.removeEventListener('error', onError);
    }

    if (img.complete) {
      if (img.naturalWidth > 0) {
        onLoad();
      } else {
        onError();
      }
    } else {
      img.addEventListener('load', onLoad);
      img.addEventListener('error', onError);
    }
  }

  function handleTimeout() {
    if (done) return;

    timedOut = true;
    done = true;
    timeoutId = null;

    const result = buildResult();
    flushCallbacks(result);

    if (resolvePromise) {
      resolvePromise(result);
      resolvePromise = null;
    }
  }

  if (options.timeout > 0) {
    timeoutId = setTimeout(handleTimeout, options.timeout);
  }

  total = images.length;

  if (total === 0) {
    done = true;
    clearTimer();
    const emptyResult = buildResult();

    if (resolvePromise) {
      resolvePromise(emptyResult);
      resolvePromise = null;
    }

    setTimeout(function () {
      flushCallbacks(emptyResult);
    }, 0);
  } else {
    for (let i = 0; i < total; i++) {
      trackImage(images[i]);
    }
  }

  const instance = {
    then: function (cb) {
      if (typeof cb === 'function') {
        if (done) {
          cb(buildResult());
        } else {
          callbacks.push(cb);
        }
      }
      return instance;
    },

    add: function (newImages) {
      if (typeof newImages === 'string') {
        newImages = document.querySelectorAll(newImages);
      }
      if (newImages instanceof HTMLElement) {
        newImages = [newImages];
      }
      newImages = toArray(newImages);

      if (newImages.length === 0) return instance;

      if (done) {
        done = false;
        if (options.timeout > 0) {
          clearTimer();
          timeoutId = setTimeout(handleTimeout, options.timeout);
        }
      }

      total += newImages.length;

      for (let k = 0; k < newImages.length; k++) {
        trackImage(newImages[k]);
      }

      return instance;
    },

    promise: nativePromise,
  };

  return instance;
}
