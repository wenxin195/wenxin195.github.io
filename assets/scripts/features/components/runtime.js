import { observeNear } from '@/utils/near-viewport.js';
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

function showError(root, error) {
  root.classList.add('interactive-component', 'interactive-component--error');
  const message = document.createElement('p');
  message.className = 'interactive-component__error';
  message.setAttribute('role', 'status');
  message.textContent = `交互组件暂时无法加载：${error.message}`;
  root.append(message);
}

export function init({ registry, root = document }) {
  const cleanups = [];
  let destroyed = false;
  const hosts = [...root.querySelectorAll('[data-component], .language-chart')].filter((el) => !el.parentElement.closest('.language-chart'));
  const originals = new Map(hosts.map((el) => [el, el.innerHTML]));
  for (const host of hosts) {
    if (!host.dataset.component) host.dataset.component = 'chart';
    host.classList.add('interactive-component');
  }
  const observer = observeNear(hosts, async (host) => {
    if (destroyed || host.dataset.componentMounted === 'true') return;
    const type = host.dataset.component;
    host.dataset.componentState = 'loading';
    host.setAttribute('aria-busy', 'true');
    try {
      const config = readConfig(host, type);
      const load = registry.get(config.model ? `${type}:${config.model}` : type);
      if (!load) throw new Error(`未注册的组件：${config.model || type}`);
      const implementation = await load();
      if (destroyed) return;
      implementation.validate(config);
      const cleanup = await implementation.mount(host, config);
      if (destroyed) { cleanup?.(); return; }
      host.dataset.componentMounted = 'true';
      host.dataset.componentState = 'ready';
      host.dataset.componentReady = 'true';
      cleanups.push(() => {
        if (typeof cleanup === 'function') cleanup();
        delete host.dataset.componentMounted;
        delete host.dataset.componentReady;
      });
    } catch (error) {
      host.innerHTML = originals.get(host);
      host.dataset.componentState = 'error';
      showError(host, error);
      const retry = document.createElement('button');
      retry.type = 'button';
      retry.className = 'button button--secondary';
      retry.textContent = '重新加载';
      retry.addEventListener('click', () => {
        host.innerHTML = originals.get(host);
        host.classList.remove('interactive-component--error');
        observer.retry(host);
      }, { once: true });
      host.append(retry);
      const reload = document.createElement('button');
      reload.type = 'button'; reload.textContent = '刷新页面';
      reload.addEventListener('click', () => location.reload());
      host.append(reload);
      throw error;
    } finally {
      host.removeAttribute('aria-busy');
    }
  });

  return () => {
    destroyed = true;
    observer.destroy();
    for (const cleanup of cleanups.reverse()) cleanup();
  };
}
