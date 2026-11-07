import { createShell, createStage } from '@/features/components/shared.js';
import { loadVisualLibrary } from '@/features/components/libraries.js';

export const plotlyComponent = {
  validate(config) {
    if (!Array.isArray(config.data) || !config.data.length) throw new Error('Plotly 需要 data 数组。');
  },
  async mount(root, config) {
    const Plotly = await loadVisualLibrary('plotly');
    const content = createShell(root, config);
    const stage = createStage('interactive-component__plot');
    stage.setAttribute('role', 'img');
    stage.setAttribute('aria-label', config.title || '交互图表');
    content.append(stage);
    await Plotly.newPlot(stage, config.data, { autosize: true, ...config.layout }, {
      responsive: true, displaylogo: false, showSendToCloud: false, ...config.plotlyConfig,
    });
    return () => Plotly.purge(stage);
  },
};
