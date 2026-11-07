import { createShell, createStage } from '@/features/components/shared.js';
import { loadVisualLibrary } from '@/features/components/libraries.js';

// A small declarative entry for article data. More complex Plot compositions
// can live in an article model and call loadVisualLibrary directly.
export const observablePlotComponent = {
  validate(config) {
    if (!Array.isArray(config.data) || !['bar', 'line', 'dot'].includes(config.mark)) {
      throw new Error('Observable Plot 需要 data 数组和 bar、line 或 dot 标记。');
    }
    if (!config.x || !config.y) throw new Error('Observable Plot 需要 x 和 y 字段。');
  },
  async mount(root, config) {
    const Plot = await loadVisualLibrary('observablePlot');
    const content = createShell(root, config);
    const stage = createStage();
    content.append(stage);
    const options = { x: config.x, y: config.y, tip: true };
    const mark = config.mark === 'bar' ? Plot.barY(config.data, options)
      : config.mark === 'line' ? Plot.lineY(config.data, options)
        : Plot.dot(config.data, options);
    const chart = Plot.plot({ ...config.plot, marks: [mark] });
    chart.setAttribute('aria-label', config.title || '数据图表');
    stage.append(chart);
    return () => chart.remove();
  },
};
