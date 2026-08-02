/**
 * 创建节流函数：在 `wait` 毫秒内最多调用一次 `func`。
 * 返回的函数还带有 `cancel` 与 `flush` 辅助方法。
 * @param {function(...*): *} func
 * @param {number} wait
 * @param {{
 *   leading: (boolean|undefined),
 *   trailing: (boolean|undefined)
 * }=} options
 * @return {function(...*): *}
 */
export function throttle(func, wait, options = {}) {
  const { leading = true, trailing = true } = options;

  if (!leading && !trailing) {
    throw new Error('throttle: leading 和 trailing 不能同时为 false');
  }

  let savedArgs = null;
  let savedThis = null;
  let result;
  let timeoutId = null;
  let lastCalledTime = 0;

  function invokeFunc() {
    const args = savedArgs;
    const thisArg = savedThis;

    savedArgs = null;
    savedThis = null;

    lastCalledTime = Date.now();
    result = func.apply(thisArg, args);

    return result;
  }

  function trailingCallback() {
    timeoutId = null;

    if (trailing && savedArgs) {
      invokeFunc();
    } else {
      savedArgs = null;
      savedThis = null;
    }
  }

  function startTimer(remaining) {
    timeoutId = setTimeout(trailingCallback, remaining);
  }

  function throttled(...args) {
    const now = Date.now();
    const elapsed = now - lastCalledTime;
    const remaining = wait - elapsed;

    savedArgs = args;
    savedThis = this;

    if (remaining <= 0 || remaining > wait) {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (leading) {
        invokeFunc();
      } else {
        lastCalledTime = now;
        startTimer(wait);
      }
    } else if (timeoutId === null && trailing) {
      startTimer(remaining);
    }

    return result;
  }

  throttled.cancel = function () {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastCalledTime = 0;
    savedArgs = null;
    savedThis = null;
  };

  throttled.flush = function () {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;

      if (savedArgs) {
        invokeFunc();
      }
    }

    return result;
  };

  return throttled;
}
