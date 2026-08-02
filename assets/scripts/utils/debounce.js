/**
 * 创建防抖函数：自上次调用起经过 `delay` 毫秒后才执行 `fn`。
 * 返回的函数带有 `cancel` 辅助方法。
 * @param {function(...*): *} fn
 * @param {number} delay
 * @param {boolean=} immediate
 * @return {function(...*): undefined}
 */
export function debounce(fn, delay, immediate = false) {
  let timer = null;

  const debounced = function (...args) {
    const callNow = immediate && !timer;
    clearTimeout(timer);

    timer = setTimeout(() => {
      timer = null;
      if (!immediate) fn.apply(this, args);
    }, delay);

    if (callNow) fn.apply(this, args);
  };

  debounced.cancel = () => {
    clearTimeout(timer);
    timer = null;
  };

  return debounced;
}
