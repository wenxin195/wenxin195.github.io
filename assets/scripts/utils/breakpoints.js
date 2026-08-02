/**
 * Viewport breakpoints — **must stay in sync** with `tokens/$responsive`
 * in `_sass/tokens/_scale.scss`.
 *
 * | name | min-width |
 * | ---- | --------- |
 * | sm   | 0         |
 * | md   | 768       |
 * | lg   | 1024      |
 * | xl   | 1440      |
 *
 * `down*` queries match Sass `media-breakpoint-down` (`max-width: min - 1`).
 */

/** @const {!Object<string, number>} */
export const BREAKPOINTS = Object.freeze({
  sm: 0,
  md: 768,
  lg: 1024,
  xl: 1440,
});

/** @const {!Object<string, string>} */
export const MQ = Object.freeze({
  upMd: `(min-width: ${BREAKPOINTS.md}px)`,
  upLg: `(min-width: ${BREAKPOINTS.lg}px)`,
  upXl: `(min-width: ${BREAKPOINTS.xl}px)`,
  downMd: `(max-width: ${BREAKPOINTS.md - 1}px)`,
  downLg: `(max-width: ${BREAKPOINTS.lg - 1}px)`,
  downXl: `(max-width: ${BREAKPOINTS.xl - 1}px)`,
});

/**
 * @param {string} queryKeyOrQuery `MQ` key or a raw media-query string
 * @return {string}
 */
function resolveQuery(queryKeyOrQuery) {
  if (Object.prototype.hasOwnProperty.call(MQ, queryKeyOrQuery)) {
    return MQ[queryKeyOrQuery];
  }
  return queryKeyOrQuery;
}

/**
 * @param {string} queryKeyOrQuery
 * @return {boolean}
 */
export function matches(queryKeyOrQuery) {
  return window.matchMedia(resolveQuery(queryKeyOrQuery)).matches;
}

/**
 * Subscribe to a breakpoint query. Invokes `callback` immediately with the
 * current match state, then on each change.
 *
 * @param {string} queryKeyOrQuery `MQ` key (e.g. `'upLg'`) or raw query
 * @param {function(boolean): void} callback
 * @return {function(): void} unsubscribe
 */
export function subscribe(queryKeyOrQuery, callback) {
  const mql = window.matchMedia(resolveQuery(queryKeyOrQuery));

  /** @param {MediaQueryListEvent|MediaQueryList} eventOrList */
  const handler = (eventOrList) => {
    callback(eventOrList.matches);
  };

  callback(mql.matches);
  mql.addEventListener('change', handler);

  return () => {
    mql.removeEventListener('change', handler);
  };
}
