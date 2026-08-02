/**
 * 获取唯一允许的加载器全局对象（`window.Lazyload`）。
 * 引导脚本：`assets/scripts/boot/lazyload.js`（经典非模块脚本）。
 * Liquid 等可直接调用 `window.Lazyload`；应用模块优先使用本辅助函数。
 *
 * @return {{
 *   timeout: number,
 *   js: function((string|!Array<string>), (function(): undefined)=): !Promise<undefined>,
 *   css: function((string|!Array<string>), (function(): undefined)=): !Promise<undefined>,
 *   isLoaded: function(string): boolean,
 *   getState: function(string): string
 * }}
 */
export function getLazyload() {
  const api = window.Lazyload;
  if (!api || typeof api.js !== 'function' || typeof api.css !== 'function') {
    throw new Error('[lazyload] boot script not loaded (window.Lazyload missing)');
  }
  return api;
}
