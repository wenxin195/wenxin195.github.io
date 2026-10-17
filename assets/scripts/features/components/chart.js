import { createShell, element } from '@/features/components/shared.js';
import { loadScript } from '@/utils/load-script.js';

let chartLibraryPromise;

function loadChartLibrary() {
  if (window.Chart) return Promise.resolve(window.Chart);
  if (!chartLibraryPromise) {
    const config = document.querySelector('[data-component-runtime]');
    const src = config?.dataset.chartSrc;
    if (!src) return Promise.reject(new Error('缺少 Chart.js 地址配置。'));

    chartLibraryPromise = loadScript(src).then(() => {
      if (!window.Chart) throw new Error('Chart.js 未提供构造器。');
      return window.Chart;
    }).catch((error) => { chartLibraryPromise = null; throw error; });
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

  async mount(root, config) {
    const Chart = await loadChartLibrary();
    const content = createShell(root, config);
    const canvas = element('canvas', 'interactive-component__chart');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', config.title || '数据图表');
    content.append(canvas);
    root.setAttribute('data-processed', 'true');

    const instance = new Chart(canvas.getContext('2d'), {
        ...config.chart,
        options: { responsive: true, maintainAspectRatio: true, ...config.chart.options, animation: matchMedia('(prefers-reduced-motion: reduce)').matches ? false : config.chart.options?.animation },
      });
      root.dataset.componentReady = 'true';
    return () => instance?.destroy();
  },
};
