import {
  createButton,
  createRangeControl,
  createShell,
  element,
  formatPercent,
} from '@/features/components/shared.js';

function validateRange(range, name, lowerBound, upperBound) {
  if (!range || !Number.isFinite(range.min) || !Number.isFinite(range.max)
      || !Number.isFinite(range.value) || range.min < lowerBound
      || range.max > upperBound || range.min >= range.max
      || range.value < range.min || range.value > range.max) {
    throw new Error(`${name} 参数范围无效。`);
  }
}

export const sensitivitySurveyModel = {
  validate(config) {
    const parameters = config.parameters;
    validateRange(parameters?.sampleSize, 'sampleSize', 100, 10000);
    validateRange(parameters?.questionShare, 'questionShare', 0.01, 0.99);
    validateRange(parameters?.trueRate, 'trueRate', 0, 1);
  },

  mount(root, config) {
    const content = createShell(root, config);
    const controls = element('div', 'interactive-component__controls');
    const sampleSettings = config.parameters.sampleSize;
    const shareSettings = config.parameters.questionShare;
    const truthSettings = config.parameters.trueRate;
    const sample = createRangeControl({
      label: '样本量', min: sampleSettings.min, max: sampleSettings.max,
      step: Math.max(1, Math.round((sampleSettings.max - sampleSettings.min) / 50)),
      value: sampleSettings.value,
      format: (value) => Math.round(value).toLocaleString('zh-CN'),
    });
    const proportion = createRangeControl({
      label: '敏感问题抽取比例', min: shareSettings.min, max: shareSettings.max,
      step: 0.05, value: shareSettings.value,
      format: (value) => formatPercent(value, 0),
    });
    const truth = createRangeControl({
      label: '模拟设定的真实比例', min: truthSettings.min, max: truthSettings.max,
      step: 0.01, value: truthSettings.value,
      format: (value) => formatPercent(value, 0),
    });
    const run = createButton('重新抽样');
    controls.append(sample.wrapper, proportion.wrapper, truth.wrapper, run);

    const stats = element('dl', 'interactive-component__stats');
    const values = {};
    for (const [label, key] of [
      ['随机回答“是”的比例', 'yes'],
      ['公式估计值', 'estimate'],
      ['模拟设定的真实比例', 'truth'],
    ]) {
      stats.append(element('dt', null, label));
      values[key] = element('dd');
      stats.append(values[key]);
    }
    const note = element('p', 'interactive-component__note', '本演示只生成虚构回答，不会收集或保存任何输入。估计值可能超出 0%–100%，这里保留原始结果以展示抽样波动。');
    content.append(controls, stats, note);

    function update() {
      const n = Number(sample.input.value);
      const share = Number(proportion.input.value);
      const trueRate = Number(truth.input.value);
      let yes = 0;
      for (let i = 0; i < n; i += 1) {
        const sensitiveQuestion = Math.random() < share;
        const saysYes = Math.random() < (sensitiveQuestion ? trueRate : 0.5);
        if (saysYes) yes += 1;
      }
      const observed = yes / n;
      const estimate = (observed - 0.5 * (1 - share)) / share;
      values.yes.textContent = `${formatPercent(observed)}（${yes} / ${n}）`;
      values.estimate.textContent = formatPercent(estimate);
      values.truth.textContent = formatPercent(trueRate);
    }

    for (const control of [sample, proportion, truth]) control.input.addEventListener('input', update);
    run.addEventListener('click', update);
    update();
  },
};
