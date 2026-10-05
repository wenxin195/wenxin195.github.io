/**
 * UI strings from `window.__t` (injected from `_data/locale.yml`).
 * @param {string} key
 * @param {string=} fallback
 * @return {string}
 */
export function t(key, fallback) {
  const dict = (typeof window !== 'undefined' && window.__t) || {};
  const value = dict[key];
  if (typeof value === 'string' && value.length > 0) return value;
  return fallback ?? key;
}
