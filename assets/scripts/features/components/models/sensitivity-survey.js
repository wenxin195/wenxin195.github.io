import { createButton, createRangeControl, createShell, element, formatPercent } from '@/features/components/shared.js';

function validateRange(range, name, lower, upper) {
  if (!range || !Number.isFinite(range.min) || !Number.isFinite(range.max)
      || !Number.isFinite(range.value) || range.min < lower || range.max > upper
      || range.min >= range.max || range.value < range.min || range.value > range.max) {
    throw new Error(`${name} 参数范围无效。`);
  }
}

function makeRespondents(count) {
  return Array.from({ length: count }, () => ({ question: Math.random(), answer: Math.random() }));
}

export const sensitivitySurveyModel = {
  validate(config) {
    const p = config.parameters;
    validateRange(p?.sampleSize, 'sampleSize', 100, 10000);
    validateRange(p?.questionShare, 'questionShare', 0.01, 0.99);
    validateRange(p?.trueRate, 'trueRate', 0, 1);
  },
  mount(root, config) {
    const content = createShell(root, config);
    const controller = new AbortController();
    const { signal } = controller;
    const controls = element('div', 'interactive-component__controls');
    const p = config.parameters;
    const sample = createRangeControl({ label: '样本量', min: p.sampleSize.min, max: p.sampleSize.max,
      step: 1, value: p.sampleSize.value, format: (value) => Math.round(value).toLocaleString('zh-CN') });
    const proportion = createRangeControl({ label: '敏感问题抽取比例', min: p.questionShare.min, max: p.questionShare.max,
      step: 0.01, value: p.questionShare.value, format: (value) => formatPercent(value, 0) });
    const truth = createRangeControl({ label: '模拟设定的真实比例', min: p.trueRate.min, max: p.trueRate.max,
      step: 0.01, value: p.trueRate.value, format: (value) => formatPercent(value, 0) });
    const run = createButton('重新抽样');
    const example = createButton('查看一份虚构回答');
    controls.append(sample.wrapper, proportion.wrapper, truth.wrapper, run, example);

    const exampleStatus = element('p', 'interactive-component__status', '逐份查看时，读者能看到抽中哪道题；调查研究者只会收到“是”或“否”。');
    exampleStatus.setAttribute('aria-live', 'polite');
    const bars = element('div', 'interactive-component__survey-bars');
    const birthdayBar = element('div', 'interactive-component__survey-bar interactive-component__survey-bar--birthday');
    const sensitiveBar = element('div', 'interactive-component__survey-bar interactive-component__survey-bar--sensitive');
    bars.append(birthdayBar, sensitiveBar);
    const barLabel = element('p', 'interactive-component__note');
    const stats = element('dl', 'interactive-component__stats');
    const values = {};
    for (const [label, key] of [
      ['回答“是”的比例', 'yes'], ['公式估计值', 'estimate'], ['模拟设定的真实比例', 'truth'],
    ]) {
      stats.append(element('dt', null, label));
      values[key] = element('dd'); stats.append(values[key]);
    }
    content.append(controls, exampleStatus, bars, barLabel, stats,
      element('p', 'interactive-component__note', '色条区分两道题对“是”的贡献；研究者实际上无法区分每份回答来自哪道题。拖动参数时复用同一批随机数，点击重新抽样才生成新样本。演示不收集真实个人信息。'));

    let respondents = makeRespondents(p.sampleSize.max);
    let exampleIndex = 0;
    function update() {
      const n = Number(sample.input.value), share = Number(proportion.input.value);
      const trueRate = Number(truth.input.value);
      let birthdayYes = 0, sensitiveYes = 0;
      for (let i = 0; i < n; i += 1) {
        const respondent = respondents[i];
        if (respondent.question < share) {
          if (respondent.answer < trueRate) sensitiveYes++;
        } else if (respondent.answer < 0.5) birthdayYes++;
      }
      const yes = birthdayYes + sensitiveYes;
      const estimate = (yes / n - 0.5 * (1 - share)) / share;
      birthdayBar.style.width = `${birthdayYes / n * 100}%`;
      sensitiveBar.style.width = `${sensitiveYes / n * 100}%`;
      barLabel.textContent = `“是”的来源：生日题 ${birthdayYes} 份，敏感题 ${sensitiveYes} 份；研究者只看到合计 ${yes} 份。`;
      values.yes.textContent = `${formatPercent(yes / n)}（${yes} / ${n}）`;
      values.estimate.textContent = formatPercent(estimate);
      values.truth.textContent = formatPercent(trueRate);
    }
    let frame = 0;
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    for (const control of [sample, proportion, truth]) control.input.addEventListener('input', schedule, { signal });
    run.addEventListener('click', () => {
      respondents = makeRespondents(p.sampleSize.max); exampleIndex = 0;
      exampleStatus.textContent = '已重新抽样。可以查看一份虚构回答。'; schedule();
    }, { signal });
    example.addEventListener('click', () => {
      const item = respondents[exampleIndex % Number(sample.input.value)];
      exampleIndex++;
      const sensitive = item.question < Number(proportion.input.value);
      const yes = item.answer < (sensitive ? Number(truth.input.value) : 0.5);
      exampleStatus.textContent = `第 ${exampleIndex} 份：抽中${sensitive ? '敏感题' : '生日题'}，回答“${yes ? '是' : '否'}”；研究者只收到回答，不知道题目。`;
    }, { signal });
    update();
    return () => { cancelAnimationFrame(frame); controller.abort(); };
  },
};
