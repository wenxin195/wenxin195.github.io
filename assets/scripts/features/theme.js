/** @const {!Array<string>} */
const THEMES = Object.freeze(['default', 'dark']);

/** @const {string} */
const DEFAULT_STORAGE_KEY = 'site-theme';

/**
 * @const {!Object<string, string>}
 */
const LABELS = Object.freeze({
  default: '切换为暗色主题',
  dark: '切换为亮色主题',
});

/**
 * @param {*} value
 * @return {boolean}
 */
function isTheme(value) {
  return THEMES.includes(/** @type {string} */ (value));
}

/**
 * @param {string} storageKey
 * @return {?string}
 */
function readStoredTheme(storageKey) {
  try {
    const stored = localStorage.getItem(storageKey);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
}

/**
 * @param {string} storageKey
 * @param {string} theme
 */
function writeStoredTheme(storageKey, theme) {
  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    // Privacy mode / quota — ignore.
  }
}

/**
 * @param {!Element} toggleEl
 * @param {string} theme
 */
function syncToggleUi(toggleEl, theme) {
  toggleEl.setAttribute('aria-label', LABELS[theme]);
  toggleEl.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
}

/**
 * 在禁用过渡的情况下刷一帧绘制，然后清除切换标记。
 * @param {!HTMLElement} root
 */
function endThemeSwitching(root) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.removeAttribute('data-theme-switching');
    });
  });
}

/**
 * 站点主题切换（default ↔ dark）。
 * @param {{
 *   toggleEl: (?Element|undefined),
 *   storageKey: (string|undefined),
 *   defaultTheme: (string|undefined)
 * }=} options
 * @return {{
 *   destroy: function(): undefined,
 *   getTheme: function(): string,
 *   setTheme: function(string): undefined,
 *   toggleTheme: function(): undefined
 * }|null}
 */
export function init(options = {}) {
  const toggleEl = options.toggleEl ?? document.querySelector('.js-theme-toggle');
  if (!toggleEl) return null;

  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;
  const root = document.documentElement;

  const configDefault = isTheme(options.defaultTheme)
    ? options.defaultTheme
    : isTheme(root.getAttribute('data-theme'))
      ? /** @type {string} */ (root.getAttribute('data-theme'))
      : 'default';

  /** @return {string} */
  function getTheme() {
    const current = root.getAttribute('data-theme');
    return isTheme(current) ? current : configDefault;
  }

  /** @param {string} next */
  function setTheme(next) {
    if (!isTheme(next)) return;

    const prev = getTheme();
    writeStoredTheme(storageKey, next);
    syncToggleUi(toggleEl, next);

    if (next === prev) {
      root.setAttribute('data-theme', next);
      return;
    }

    // Suppress transition:all wash while CSS variables swap.
    root.setAttribute('data-theme-switching', '');
    root.setAttribute('data-theme', next);
    endThemeSwitching(root);
  }

  function toggleTheme() {
    setTheme(getTheme() === 'dark' ? 'default' : 'dark');
  }

  // Align control with html[data-theme] (may already be set by FOUC script).
  const initial = readStoredTheme(storageKey) ?? getTheme();
  setTheme(initial);

  const onClick = (event) => {
    event.preventDefault();
    toggleTheme();
  };

  toggleEl.addEventListener('click', onClick);

  return {
    getTheme,
    setTheme,
    toggleTheme,
    destroy() {
      toggleEl.removeEventListener('click', onClick);
      root.removeAttribute('data-theme-switching');
    },
  };
}
