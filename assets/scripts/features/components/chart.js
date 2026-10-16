import { createShell, element } from '@/features/components/shared.js';

let chartLibraryPromise;

function loadChartLibrary() {
  if (window.Chart) return Promise.resolve(window.Chart);
  if (!chartLibraryPromise) {
    const config = document.querySelector('[data-component-runtime]');
    const src = config?.dataset.chartSrc;
    if (!src) return Promise.reject(new Error('缺少 Chart.js 地址配置。'));

    chartLibraryPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => window.Chart
        ? resolve(window.Chart)
        : reject(new Error('Chart.js 加载完成但未找到 Chart 构造器。'));
      script.onerror = () => reject(new Error('Chart.js 加载失败。'));
      document.head.append(script);
    });
  }
  return chartLibraryPromise;
}

export const chartComponent = {
  validate(config) {
    if (!config.chart || typeof config.chart !== 'object') {
      throw new Error('Chart 组件需要 chart 配置对象。');
    }
    if (!config.chart.type || !config.chart.data) {
      throw new Error('Chart 配置需要 type 和 data。');
    }
  },

  mount(root, config) {
    const content = createShell(root, config);
    const canvas = element('canvas', 'interactive-component__chart');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', config.title || '数据图表');
    content.append(canvas);
    root.setAttribute('data-processed', 'true');

    let instance;
    loadChartLibrary().then((Chart) => {
      if (!root.isConnected) return;
      instance = new Chart(canvas.getContext('2d'), {
        responsive: true,
        maintainAspectRatio: true,
        ...config.chart,
      });
      root.dataset.componentReady = 'true';
    }).catch((error) => {
      root.classList.add('interactive-component--error');
      const message = element('p', 'interactive-component__error', `图表无法加载：${error.message}`);
      message.setAttribute('role', 'status');
      content.append(message);
      for (const dataset of config.chart.data.datasets || []) {
        const fallback = element(
          'p',
          'interactive-component__chart-fallback',
          `${dataset.label || '数据系列'}：${(dataset.data || []).join('、')}`,
        );
        content.append(fallback);
      }
    });
    return () => instance?.destroy();
  },
};
