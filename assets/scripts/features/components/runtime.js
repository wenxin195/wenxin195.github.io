const VERSION = 1;

function readConfig(root, type) {
  const source = root.querySelector(':scope > script[type="application/json"]');
  if (!source) {
    if (type === 'chart') return JSON.parse(root.textContent.trim());
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
  const hosts = [...root.querySelectorAll('[data-component]')];
  for (const host of hosts) {
    if (host.dataset.componentMounted === 'true') continue;
    const type = host.dataset.component;
    const implementation = registry.get(type);
    try {
      if (!implementation) throw new Error(`未注册的组件类型：${type}`);
      const config = readConfig(host, type);
      implementation.validate(config);
      const cleanup = implementation.mount(host, config);
      host.dataset.componentMounted = 'true';
      cleanups.push(() => {
        if (typeof cleanup === 'function') cleanup();
        delete host.dataset.componentMounted;
        delete host.dataset.componentReady;
      });
    } catch (error) {
      showError(host, error);
    }
  }

  return () => {
    for (const cleanup of cleanups.reverse()) cleanup();
  };
}
