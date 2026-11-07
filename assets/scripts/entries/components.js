import { importModule } from '@/utils/import-module.js';
import { init as initComponents } from '@/features/components/runtime.js';

const registry = new Map([
  ['chart', () => importModule(new URL('../features/components/chart.js', import.meta.url)).then((m) => m.chartComponent)],
  ['plotly', () => importModule(new URL('../features/components/plotly.js', import.meta.url)).then((m) => m.plotlyComponent)],
  ['observable-plot', () => importModule(new URL('../features/components/observable-plot.js', import.meta.url)).then((m) => m.observablePlotComponent)],
  ['media', () => importModule(new URL('../features/components/media.js', import.meta.url)).then((m) => m.mediaComponent)],
  ['parameter-explorer:buffon-needle', () => importModule(new URL('../features/components/models/buffon-needle.js', import.meta.url)).then((m) => m.buffonNeedleModel)],
  ['parameter-explorer:sensitivity-survey', () => importModule(new URL('../features/components/models/sensitivity-survey.js', import.meta.url)).then((m) => m.sensitivitySurveyModel)],
  ['process-simulation:monty-hall', () => importModule(new URL('../features/components/models/monty-hall.js', import.meta.url)).then((m) => m.montyHallModel)],
]);

const destroyComponents = initComponents({ registry });
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) destroyComponents();
});
