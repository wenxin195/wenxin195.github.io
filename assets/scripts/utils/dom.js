/**
 * @param {*} node
 * @return {boolean}
 */
export function isNil(node) {
  return node === null || node === undefined;
}

/**
 * @param {string} event
 * @return {boolean}
 */
export function hasEvent(event) {
  return `on${event}` in document;
}

/**
 * @param {(?EventTarget|undefined)} node
 * @return {boolean}
 */
export function isOverallScroller(node) {
  if (isNil(node)) return false;
  return (
    node === document.documentElement ||
    node === document.body ||
    node === window
  );
}

/**
 * @param {(?EventTarget|undefined)} node
 * @return {boolean}
 */
export function isFormElement(node) {
  if (isNil(node) || !node.tagName) return false;

  const formTags = new Set([
    'INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'DATALIST', 'OUTPUT',
  ]);

  return formTags.has(node.tagName);
}

/**
 * @param {(?Element|Window|Document|undefined)} node
 * @return {number}
 */
export function getScrollTop(node) {
  if (isNil(node)) return 0;

  if (isOverallScroller(node)) {
    return window.scrollY
      ?? document.documentElement.scrollTop
      ?? document.body.scrollTop
      ?? 0;
  }

  return node.scrollTop ?? 0;
}
