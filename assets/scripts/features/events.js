/**
 * 跨功能 DOM 事件名（不使用业务向的 `window.*` 全局变量）。
 * @const {!Object<string, string>}
 */
export const SITE_EVENTS = Object.freeze({
  AFFIX_REFRESH: 'site:affix-refresh',
  /** @type {string} detail: `{ open: boolean }` — 导航左抽屉 */
  NAV_DRAWER_CHANGE: 'site:nav-drawer-change',
  /** @type {string} detail: `{ open: boolean }` — TOC 右抽屉 */
  TOC_DRAWER_CHANGE: 'site:toc-drawer-change',
  /** @type {string} detail: `{ source: 'nav'|'toc'|'search' }` — 供互斥关闭 */
  DRAWER_OPEN: 'site:drawer-open',
});
