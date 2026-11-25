import { observeNear } from '@/utils/near-viewport.js';
import { t } from '@/utils/i18n.js';
import { initDisclosures, isDisclosed } from '@/features/components/disclosure.js';
const VERSION = 1;

function readConfig(root, type) {
  const source = root.querySelector(':scope > script[type="application/json"]');
  if (!source) {
    if (type === 'chart') return { chart: JSON.parse(root.textContent.trim()) };
    throw new Error('组件缺少 JSON 配置。');
  }
  const config = JSON.parse(source.textContent);
  if (config.version !== VERSION) throw new Error(`不支持的组件配置版本：${config.version}`);
  if (config.type !== type) throw new Error(`配置类型 ${config.type} 与组件 ${type} 不匹配。`);
  return config;
}

export function init({ registry, root = document }) {
  const controller = new AbortController();
  const { signal } = controller;
  const hosts = [...root.querySelectorAll('[data-component], .language-chart')].filter((el) => !el.parentElement.closest('.language-chart'));
  const records = new Map();
  let destroyed = false, observer, activePrefetch = 0;
  const prefetchQueue = new Map();
  const mayRun = (host) => !destroyed && !document.hidden && !host.dataset.componentPrinting && isDisclosed(host);
  for (const host of hosts) {
    if (!host.dataset.component) host.dataset.component = 'chart';
    host.classList.add('interactive-component');
    records.set(host, { original: host.innerHTML, lifecycle: null, paused: false, preparation: null, mounting: null });
  }

  // Per-instance work is separate from shared module/library caches.
  function prepare(host) {
    const record = records.get(host);
    if (!record.preparation) {
      host.dataset.componentResources = 'loading';
      record.preparation = (async () => {
        const config = readConfig(host, host.dataset.component);
        const load = registry.get(config.model ? `${host.dataset.component}:${config.model}` : host.dataset.component);
        if (!load) throw new Error(`未注册的组件：${config.model || host.dataset.component}`);
        const implementation = await load();
        if (destroyed) return;
        implementation.validate(config);
        await implementation.preload?.(config);
        if (destroyed) return;
        host.dataset.componentResources = 'ready';
        return { config, implementation };
      })().catch((error) => {
        record.preparation = null;
        host.dataset.componentResources = 'error';
        throw error;
      });
    }
    return record.preparation;
  }

  function drainPrefetch() {
    if (destroyed || document.hidden) return;
    while (activePrefetch < 2 && prefetchQueue.size) {
      const [host] = [...prefetchQueue].sort((a, b) => b[1] - a[1])[0];
      prefetchQueue.delete(host);
      activePrefetch++;
      // Speculative failure is silent. A click gets a fresh attempt.
      void prepare(host).catch(() => {}).finally(() => { activePrefetch--; drainPrefetch(); });
    }
  }
  function prefetch(host, intent = false) {
    const connection = navigator.connection;
    if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;
    if (records.get(host)?.preparation || destroyed) return;
    prefetchQueue.set(host, intent ? 1 : 0);
    if (intent) drainPrefetch();
    else if ('requestIdleCallback' in window) requestIdleCallback(drainPrefetch, { timeout: 1000 });
    else setTimeout(drainPrefetch, 100);
  }

  function syncLifecycle(host, record) {
    if (!record.lifecycle) return;
    const paused = !mayRun(host);
    if (paused === record.paused) return;
    record.paused = paused;
    if (paused) record.lifecycle.pause?.();
    else {
      record.lifecycle.resize?.();
      record.lifecycle.resume?.();
      host.dispatchEvent(new CustomEvent('site:component-math', { bubbles: true, detail: { target: host } }));
    }
  }
  function changed() {
    for (const [host, record] of records) syncLifecycle(host, record);
    observer?.check();
    drainPrefetch();
  }

  function showError(host, record, error) {
    if (destroyed) return;
    window.MathJax?.typesetClear?.([host]);
    host.innerHTML = record.original;
    delete host.dataset.componentReady;
    host.dataset.componentState = 'error';
    host.classList.add('interactive-component--error');
    const message = document.createElement('p');
    message.className = 'interactive-component__error';
    message.setAttribute('role', 'status');
    message.textContent = `交互组件暂时无法加载：${error.message}`;
    host.append(message);
    const retry = document.createElement('button');
    retry.type = 'button'; retry.className = 'button button--secondary'; retry.textContent = '重新加载';
    retry.addEventListener('click', () => {
      host.innerHTML = record.original;
      host.classList.remove('interactive-component--error');
      record.preparation = null;
      observer.retry(host);
    }, { once: true, signal });
    const reload = document.createElement('button');
    reload.type = 'button'; reload.textContent = '刷新页面';
    reload.addEventListener('click', () => location.reload(), { signal });
    host.append(retry, reload);
  }

  async function mount(host) {
    const record = records.get(host);
    if (record.lifecycle || host.dataset.componentMounted === 'true') return;
    if (!mayRun(host)) return false;
    if (record.mounting) return record.mounting;
    record.mounting = (async () => {
      let status, timer;
      if (host.closest('[data-component-disclosure]')) {
        status = document.createElement('p'); status.className = 'interactive-disclosure__status';
        status.setAttribute('role', 'status'); status.hidden = true;
        status.textContent = t('INTERACTIVE_LOADING', '正在准备演示……');
        host.before(status);
        timer = setTimeout(() => { status.hidden = false; }, 180);
      }
      host.dataset.componentState = 'loading';
      host.setAttribute('aria-busy', 'true');
      try {
        prefetchQueue.delete(host);
        const prepared = await prepare(host);
        // Let native details finish layout before canvas reads its dimensions.
        await new Promise((resolve) => requestAnimationFrame(resolve));
        if (!mayRun(host) || !prepared) { host.dataset.componentState = 'pending'; return false; }
        const mounted = await prepared.implementation.mount(host, prepared.config);
        const lifecycle = typeof mounted === 'function' ? { destroy: mounted } : mounted || {};
        if (destroyed) { lifecycle.destroy?.(); return; }
        record.lifecycle = lifecycle;
        record.paused = false;
        host.dataset.componentMounted = 'true';
        host.dataset.componentState = 'ready';
        host.dataset.componentReady = 'true';
        syncLifecycle(host, record);
        if (mayRun(host)) host.dispatchEvent(new CustomEvent('site:component-math', { bubbles: true, detail: { target: host } }));
        host.dispatchEvent(new CustomEvent('site:component-ready', { bubbles: true }));
      } catch (error) {
        showError(host, record, error);
        throw error;
      } finally {
        clearTimeout(timer); status?.remove();
        host.removeAttribute('aria-busy');
        record.mounting = null;
      }
    })();
    return record.mounting;
  }

  const destroyDisclosures = initDisclosures(root, { onChange: changed, onIntent: (host) => prefetch(host, true) });
  observer = observeNear(hosts, mount, { eligible: mayRun });
  const summaries = hosts.map((host) => host.closest('[data-component-disclosure]')?.querySelector(':scope > summary')).filter(Boolean);
  const bySummary = new Map(summaries.map((summary) => [summary, summary.parentElement.querySelector(':scope > [data-component]')]));
  const prefetchObserver = observeNear(summaries, (summary) => { prefetch(bySummary.get(summary)); }, { eligible: isDisclosed });
  document.addEventListener('visibilitychange', changed, { signal });
  root.addEventListener('toggle', (event) => { if (event.target.tagName === 'DETAILS') changed(); }, { capture: true, signal });

  return () => {
    destroyed = true;
    controller.abort(); observer.destroy(); prefetchObserver.destroy(); destroyDisclosures(); prefetchQueue.clear();
    for (const [host, record] of records) {
      record.lifecycle?.destroy?.();
      delete host.dataset.componentMounted;
      delete host.dataset.componentReady;
    }
  };
}
