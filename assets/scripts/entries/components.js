import { init as initComponents } from '@/features/components/runtime.js';
import { chartComponent } from '@/features/components/chart.js';
import { createParameterExplorerComponent } from '@/features/components/parameter-explorer.js';
import { createProcessSimulationComponent } from '@/features/components/process-simulation.js';
import { buffonNeedleModel } from '@/features/components/models/buffon-needle.js';
import { sensitivitySurveyModel } from '@/features/components/models/sensitivity-survey.js';
import { montyHallModel } from '@/features/components/models/monty-hall.js';

const parameterModels = new Map([
  ['buffon-needle', buffonNeedleModel],
  ['sensitivity-survey', sensitivitySurveyModel],
]);
const simulationModels = new Map([
  ['monty-hall', montyHallModel],
]);

const registry = new Map([
  ['chart', chartComponent],
  ['parameter-explorer', createParameterExplorerComponent(parameterModels)],
  ['process-simulation', createProcessSimulationComponent(simulationModels)],
]);

const destroyComponents = initComponents({ registry });
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) destroyComponents();
}, { once: true });
