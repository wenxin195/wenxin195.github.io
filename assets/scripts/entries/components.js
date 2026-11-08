import { importModule } from '@/utils/import-module.js';
import { init as initComponents } from '@/features/components/runtime.js';

const registry = new Map([
  ['chart', () => importModule(new URL('../features/components/chart.js', import.meta.url)).then((m) => m.chartComponent)],
  ['plotly', () => importModule(new URL('../features/components/plotly.js', import.meta.url)).then((m) => m.plotlyComponent)],
  ['observable-plot', () => importModule(new URL('../features/components/observable-plot.js', import.meta.url)).then((m) => m.observablePlotComponent)],
  ['media', () => importModule(new URL('../features/components/media.js', import.meta.url)).then((m) => m.mediaComponent)],
  ['parameter-explorer:buffon-needle', () => importModule(new URL('../features/components/models/buffon-needle.js', import.meta.url)).then((m) => m.buffonNeedleModel)],
  ['parameter-explorer:sensitivity-survey', () => importModule(new URL('../features/components/models/sensitivity-survey.js', import.meta.url)).then((m) => m.sensitivitySurveyModel)],
  ['parameter-explorer:channel-composition', () => importModule(new URL('../features/components/models/channel-composition.js', import.meta.url)).then((m) => m.channelCompositionModel)],
  ['parameter-explorer:randomization-demo', () => importModule(new URL('../features/components/models/randomization-demo.js', import.meta.url)).then((m) => m.randomizationDemoModel)],
  ['parameter-explorer:precision-demo', () => importModule(new URL('../features/components/models/precision-demo.js', import.meta.url)).then((m) => m.precisionDemoModel)],
  ['parameter-explorer:decision-demo', () => importModule(new URL('../features/components/models/decision-demo.js', import.meta.url)).then((m) => m.decisionDemoModel)],
  ['process-simulation:monty-hall', () => importModule(new URL('../features/components/models/monty-hall.js', import.meta.url)).then((m) => m.montyHallModel)],
]);

const destroyComponents = initComponents({ registry });
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) destroyComponents();
});
