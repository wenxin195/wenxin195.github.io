/**
 * 本地 Lucide UI 图标（mask span）。
 * ICON_FILES 须与 `_data/icons.yml` 保持同步。
 */

import { getBaseUrl } from '@/utils/baseUrl.js';

const ICON_BASE = '/assets/images/icon/lucide';

/** @type {!Object<string, string>} */
const ICON_FILES = {
  menu: 'menu',
  x: 'x',
  search: 'search',
  moon: 'moon',
  sun: 'sun',
  user: 'user',
  eye: 'eye',
  mail: 'mail',
  'message-circle': 'message-circle',
  send: 'send',
  tags: 'tags',
  calendar: 'calendar',
  clock: 'clock',
  'chevron-left': 'chevron-left',
  'chevron-right': 'chevron-right',
  'chevron-up': 'chevron-up',
  ellipsis: 'ellipsis',
  rss: 'rss',
  list: 'list',
  anchor: 'anchor',
  clipboard: 'clipboard',
  check: 'check',
  'file-code': 'file-code',
  code: 'code',
  'circle-check': 'circle-check',
  circle: 'circle',
  lightbulb: 'lightbulb',
  'circle-alert': 'circle-alert',
  'triangle-alert': 'triangle-alert',
  download: 'download',
  video: 'video',
  home: 'home',
  'file-text': 'file-text',
  heart: 'heart',
  'circle-user': 'circle-user',
  about: 'user',
  article: 'file-text',
  donate: 'heart',
  contact: 'mail',
};

/**
 * 解析语义名对应的 Lucide 文件名（不含扩展名）。
 * @param {string} name
 * @return {string}
 */
export function iconFile(name) {
  return ICON_FILES[name] ?? name;
}

/**
 * 返回图标 SVG 的站点内 URL。
 * @param {string} name
 * @return {string}
 */
export function iconUrl(name) {
  const file = iconFile(name);
  return `${getBaseUrl()}${ICON_BASE}/${file}.svg`;
}

/**
 * 创建 Lucide mask 图标节点。
 * @param {string} name
 * @param {{className: (string|undefined), label: (string|undefined)}=} options
 * @return {!HTMLElement}
 */
export function iconEl(name, options = {}) {
  const el = document.createElement('span');
  el.className = options.className
    ? `icon-lucide ${options.className}`
    : 'icon-lucide';
  el.style.setProperty('--icon', `url('${iconUrl(name)}')`);
  el.dataset.icon = name;
  if (options.label) {
    el.setAttribute('role', 'img');
    el.setAttribute('aria-label', options.label);
  } else {
    el.setAttribute('aria-hidden', 'true');
  }
  return el;
}

/**
 * 将已有节点（或其内部图标）切换为指定 Lucide 图标。
 * @param {!Element} el
 * @param {string} name
 * @return {undefined}
 */
export function setIcon(el, name) {
  const target =
    el.matches?.('[data-icon], .icon-lucide')
      ? el
      : el.querySelector?.('[data-icon], .icon-lucide') ?? el;

  target.classList.add('icon-lucide');
  target.style.setProperty('--icon', `url('${iconUrl(name)}')`);
  target.dataset.icon = name;
}
