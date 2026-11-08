import { createButton, createRangeControl, createShell, element } from '@/features/components/shared.js';

const scenarios = {
  above: { label: '① 效应超过阈值', estimate: 3, se: 0.45, delta: 1, guardrail: false },
  clear: { label: '② 方向明确', estimate: 1.6, se: 0.35, delta: 1, guardrail: false },
  uncertain: { label: '③ 证据不足', estimate: 1.2, se: 0.8, delta: 1, guardrail: false },
  insufficient: { label: '④ 收益不足', estimate: 0.5, se: 0.2, delta: 1, guardrail: false },
  negative: { label: '⑤ 负向效应', estimate: -1, se: 0.3, delta: 1, guardrail: false },
  guardrail: { label: '⑥ 护栏恶化', estimate: 3, se: 0.45, delta: 1, guardrail: true },
};

export const decisionDemoModel = {
  validate(config) {
    const p = config.parameters;
    for (const key of ['estimate', 'se', 'delta']) {
      const x = p?.[key];
      if (!x || ![x.min, x.max, x.value].every(Number.isFinite) || x.min >= x.max || x.value < x.min || x.value > x.max) throw new Error(`${key} 参数范围无效。`);
    }
    if (p.se.min <= 0) throw new Error('标准误必须为正数。');
  },
  mount(root, config) {
    const content = createShell(root, config), p = config.parameters;
    const controller = new AbortController(), { signal } = controller;
    const summary = element('div', 'decision-demo__true-rates');
    const summaryValues = [];
    for (const label of ['效应估计', '95% CI 下界', '95% CI 上界']) {
      const cell = element('div', 'decision-demo__true-rate');
      const value = element('strong', label === '效应估计' ? 'decision-demo__positive' : null);
      cell.append(element('span', null, label), value); summary.append(cell); summaryValues.push(value);
    }
    const controls = element('div', 'decision-demo__controls');
    const estimate = createRangeControl({ label: '效应估计值', min: p.estimate.min, max: p.estimate.max, step: 0.1, value: p.estimate.value, format: (v) => `${v >= 0 ? '+' : ''}${v.toFixed(1)} pp` });
    const se = createRangeControl({ label: '标准误 SE', min: p.se.min, max: p.se.max, step: 0.05, value: p.se.value, format: (v) => `${v.toFixed(2)} pp` });
    const delta = createRangeControl({ label: '最小业务价值阈值', min: p.delta.min, max: p.delta.max, step: 0.1, value: p.delta.value, format: (v) => `${v.toFixed(1)} pp` });
    const estimateLabel = element('span', null, '效应估计值 ');
    const tau = element('span', 'decision-demo__math', '$\\hat{\\tau}$');
    const deltaLabel = element('span', null, '最小业务价值阈值 ');
    const deltaMath = element('span', 'decision-demo__math', '$\\delta$');
    estimateLabel.append(tau); deltaLabel.append(deltaMath);
    estimate.wrapper.querySelector('.interactive-component__control-label').replaceWith(estimateLabel);
    delta.wrapper.querySelector('.interactive-component__control-label').replaceWith(deltaLabel);
    tau.dataset.componentMath = 'true'; deltaMath.dataset.componentMath = 'true';
    controls.append(estimate.wrapper, se.wrapper, delta.wrapper);
    const guardrails = element('fieldset', 'decision-demo__guardrails');
    guardrails.append(element('legend', null, '护栏指标状态'));
    const guardrailInputs = [];
    for (const [value, label] of [['stable', '护栏无明显恶化'], ['worse', '护栏明显恶化（例如 D7 留存下降）']]) {
      const radioLabel = element('label', 'decision-demo__radio'); const radio = element('input'); radio.type = 'radio'; radio.name = 'decision-demo-guardrail'; radio.value = value; radio.checked = value === 'stable';
      radioLabel.append(radio, element('span', null, label)); guardrails.append(radioLabel); guardrailInputs.push(radio);
      radio.addEventListener('change', update, { signal });
    }
    const evidence = element('section', 'decision-demo__evidence');
    const evidenceHeader = element('div', 'decision-demo__evidence-header'); evidenceHeader.append(element('h4', null, '置信区间与阈值的位置'));
    const reset = createButton('⟲ 重置', 'decision-demo__reset'); evidenceHeader.append(reset);
    const chart = element('div', 'decision-demo__chart'); chart.setAttribute('role', 'img');
    const chartLegend = element('div', 'decision-demo__legend');
    chartLegend.append(element('span', 'decision-demo__legend-ci', '95% 置信区间'), element('span', 'decision-demo__legend-zero', '零效应'), element('span', 'decision-demo__legend-delta', '业务阈值'));
    const status = element('div', 'decision-demo__status'); status.setAttribute('aria-live', 'polite');
    const scenariosSection = element('section', 'decision-demo__scenarios'); scenariosSection.append(element('h4', null, '切换文章中的典型决策情境'));
    const scenarioGrid = element('div', 'decision-demo__scenario-grid'); const scenarioButtons = {};
    for (const [key, scenario] of Object.entries(scenarios)) {
      const button = createButton(scenario.label, 'decision-demo__scenario');
      button.addEventListener('click', () => applyScenario(key), { signal }); scenarioButtons[key] = button; scenarioGrid.append(button);
    }
    scenariosSection.append(scenarioGrid);
    content.append(summary, controls, guardrails, evidence, scenariosSection);
    evidence.append(evidenceHeader, chart, chartLegend, status);
    for (const target of [tau, deltaMath]) target.dispatchEvent(new CustomEvent('site:component-math', { bubbles: true, detail: { target } }));

    function setControl(control, value) { control.input.value = String(value); control.output.value = control.output.textContent = control.input.getAttribute('aria-label').startsWith('效应') ? `${value >= 0 ? '+' : ''}${Number(value).toFixed(1)} pp` : control.input.getAttribute('aria-label').startsWith('标准误') ? `${Number(value).toFixed(2)} pp` : `${Number(value).toFixed(1)} pp`; }
    function applyScenario(key) {
      const scenario = scenarios[key]; setControl(estimate, scenario.estimate); setControl(se, scenario.se); setControl(delta, scenario.delta);
      guardrailInputs[scenario.guardrail ? 1 : 0].checked = true; update();
    }
    function classify(low, high, threshold, guardrailWorse) {
      if (guardrailWorse) return ['护栏指标恶化', '暂缓上线，先调查风险或调整方案。即使主要指标区间高于阈值，也不能忽略护栏恶化。', 'guardrail'];
      if (high < 0) return ['负向效应', '区间整体低于零，结果提示新方案可能有害；不宜上线，已上线则考虑回滚。', 'negative'];
      if (low > threshold) return ['效应超过阈值', '区间整体高于最小业务价值阈值，效应足够大且较确定；可结合风险和可逆性推进。', 'positive'];
      if (low > 0 && high > threshold) return ['方向明确，幅度仍不确定', '区间排除零效应，但仍跨过业务阈值；可小范围推进并继续观察。', 'cautious'];
      if (low <= 0 && high >= threshold) return ['证据不足', '区间同时覆盖无效应和有业务价值的效应；补充证据，或视成本缩小范围。', 'uncertain'];
      if (high < threshold) return ['收益不足', '即使真实效应为正，区间上界仍低于最小业务价值阈值；可放弃或寻找更低成本方案。', 'insufficient'];
      return ['证据尚不明确', '区间跨越多个决策区域，结合业务成本和风险补充证据。', 'uncertain'];
    }
    function update() {
      const center = Number(estimate.input.value), standardError = Number(se.input.value), threshold = Number(delta.input.value);
      const low = center - 1.96 * standardError, high = center + 1.96 * standardError;
      summaryValues[0].textContent = `${center > 0 ? '+' : ''}${center.toFixed(1)} pp`;
      summaryValues[0].classList.toggle('decision-demo__positive', center > 0);
      summaryValues[0].classList.toggle('decision-demo__negative', center <= 0);
      summaryValues[1].textContent = `${low.toFixed(2)} pp`;
      summaryValues[2].textContent = `${high.toFixed(2)} pp`;
      const min = Math.min(low, 0, threshold) - 4, max = Math.max(high, threshold, 0) + 4;
      const position = (value) => Math.max(0, Math.min(100, (value - min) / (max - min) * 100));
      const guardrailWorse = guardrailInputs[1].checked;
      chart.replaceChildren(); chart.style.setProperty('--zero', `${position(0)}%`); chart.style.setProperty('--delta', `${position(threshold)}%`);
      const interval = element('div', 'decision-demo__interval'); interval.style.left = `${position(low)}%`; interval.style.width = `${position(high) - position(low)}%`;
      const point = element('span', 'decision-demo__point'); point.style.left = `${position(center)}%`;
      const zero = element('span', 'decision-demo__marker decision-demo__marker--zero'); zero.style.left = `${position(0)}%`; zero.append(element('span', null, '0'));
      const deltaMarker = element('span', 'decision-demo__marker decision-demo__marker--delta'); deltaMarker.style.left = `${position(threshold)}%`; deltaMarker.append(element('span', null, `δ=${threshold.toFixed(1)}`));
      const axis = element('div', 'decision-demo__axis');
      const ticks = 6;
      for (let i = 0; i <= ticks; i++) { const value = min + (max - min) * i / ticks; const tick = element('span', null, `${value.toFixed(0)}`); tick.style.left = `${i / ticks * 100}%`; axis.append(tick); }
      chart.append(zero, deltaMarker, interval, point, axis);
      const [title, explanation, state] = classify(low, high, threshold, guardrailWorse);
      status.replaceChildren();
      const statusHeader = element('div', 'decision-demo__status-header'); statusHeader.append(element('span', null, '当前证据状态'), element('strong', `decision-demo__badge decision-demo__badge--${state}`, guardrailWorse ? '护栏指标恶化' : title));
      status.append(statusHeader, element('h5', null, title), element('p', null, explanation), element('small', null, `95% 置信区间：[${low.toFixed(2)}, ${high.toFixed(2)}] pp；效应估计 ${center >= 0 ? '+' : ''}${center.toFixed(1)} pp；标准误 ${standardError.toFixed(2)} pp。`));
      for (const [key, button] of Object.entries(scenarioButtons)) button.dataset.active = String(Math.abs(Number(estimate.input.value) - scenarios[key].estimate) < 1e-8 && Math.abs(Number(se.input.value) - scenarios[key].se) < 1e-8 && guardrailWorse === scenarios[key].guardrail);
    }
    for (const control of [estimate, se, delta]) control.input.addEventListener('input', update, { signal });
    reset.addEventListener('click', () => { setControl(estimate, p.estimate.value); setControl(se, p.se.value); setControl(delta, p.delta.value); guardrailInputs[0].checked = true; update(); }, { signal });
    update();
    return () => controller.abort();
  },
};
