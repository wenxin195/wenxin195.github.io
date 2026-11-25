import { t } from '@/utils/i18n.js';

const selector = 'details[data-component-disclosure]';
const storageKey = () => `interactive-disclosures:v1:${location.pathname}`;

export function isDisclosed(host) {
  for (let parent = host.parentElement; parent; parent = parent.parentElement) {
    if (parent.tagName === 'DETAILS' && !parent.open && !parent.querySelector(':scope > summary')?.contains(host)) return false;
  }
  return true;
}

export function openAncestors(target) {
  for (let parent = target?.parentElement; parent; parent = parent.parentElement) {
    if (parent.tagName === 'DETAILS' && !parent.querySelector(':scope > summary')?.contains(target)) parent.open = true;
  }
}

// Also called by reading restoration, which can run before the component entry.
export function restoreDisclosures(root) {
  let saved;
  try { saved = JSON.parse(sessionStorage.getItem(storageKey())); } catch { return; }
  if (!saved || typeof saved !== 'object') return;
  for (const detail of root.querySelectorAll(selector)) {
    if (typeof saved[detail.id] === 'boolean') detail.open = saved[detail.id];
  }
}

/** Native details is the no-JS experience; this adds state, intent and focus. */
export function initDisclosures(root, { onChange, onIntent }) {
  restoreDisclosures(root);
  const controller = new AbortController();
  const { signal } = controller;
  const details = [...root.querySelectorAll(selector)];
  let printing = false, printStates;
  function save() {
    if (printing) return;
    try { sessionStorage.setItem(storageKey(), JSON.stringify(Object.fromEntries(details.map((d) => [d.id, d.open])))); } catch { /* optional storage */ }
  }
  for (const detail of details) {
    const summary = detail.querySelector(':scope > summary');
    const host = detail.querySelector(':scope > [data-component]');
    if (!summary || !host) continue;
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'button button--secondary interactive-disclosure__close';
    close.textContent = t('INTERACTIVE_COLLAPSE', '收起演示');
    close.setAttribute('aria-controls', host.id);
    close.addEventListener('click', () => {
      detail.open = false;
      summary.focus({ preventScroll: true });
      summary.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }, { signal });
    detail.append(close);
    detail.addEventListener('toggle', () => {
      if (printing) return;
      if (!detail.open && detail.contains(document.activeElement) && document.activeElement !== summary) summary.focus({ preventScroll: true });
      save();
      onChange();
      document.dispatchEvent(new CustomEvent('site:layout-change'));
    }, { signal });
    for (const name of ['pointerenter', 'focus', 'touchstart']) {
      summary.addEventListener(name, () => onIntent(host), { signal, passive: true });
    }
  }
  // #host-id/child-id can address a target created only after mount.
  let pendingTarget;
  function revealHash(scroll = true) {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    if (!id) return;
    const exact = document.getElementById(id);
    const [owner, child] = exact ? [id] : id.split('/');
    const target = exact || document.getElementById(owner);
    if (!target) return;
    openAncestors(target);
    if (target.matches(selector)) target.open = true;
    pendingTarget = child ? { owner: target, id: child } : null;
    onChange();
    if (scroll) (child ? document.getElementById(child) : target)?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
  window.addEventListener('hashchange', () => revealHash(), { signal });
  for (const name of ['wheel', 'touchstart', 'keydown', 'pointerdown']) {
    window.addEventListener(name, () => { pendingTarget = null; }, { signal, passive: true });
  }
  root.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[href]');
    if (!link) return;
    const url = new URL(link.getAttribute('href'), location.href);
    if (url.origin === location.origin && url.pathname === location.pathname && url.hash === location.hash) revealHash();
  }, { signal });
  root.addEventListener('site:component-ready', (event) => {
    if (pendingTarget && (event.target === pendingTarget.owner || pendingTarget.owner.contains(event.target))) {
      const target = document.getElementById(pendingTarget.id);
      if (target && isDisclosed(target)) target.scrollIntoView({ block: 'start', behavior: 'instant' });
      pendingTarget = null;
    }
  }, { signal });
  window.addEventListener('beforeprint', () => {
    printing = true;
    printStates = details.map((d) => d.open);
    root.querySelectorAll('[data-component]').forEach((host) => { host.dataset.componentPrinting = 'true'; });
    details.forEach((d) => { d.open = true; });
    onChange();
  }, { signal });
  window.addEventListener('afterprint', () => {
    details.forEach((d, i) => { d.open = printStates?.[i] ?? d.open; });
    root.querySelectorAll('[data-component]').forEach((host) => { delete host.dataset.componentPrinting; });
    printing = false;
    onChange();
  }, { signal });
  revealHash();
  return () => {
    save(); controller.abort();
    details.forEach((d) => d.querySelector(':scope > .interactive-disclosure__close')?.remove());
  };
}
