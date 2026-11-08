import { createButton, createRangeControl, createShell, element } from '@/features/components/shared.js';

const presets = {
  original: { label: '原文：偏差 +12 pp', a: 0.2, b: 0.8 },
  balanced: { label: '构成平衡', a: 0.5, b: 0.5 },
  simpson: { label: '辛普森悖论', a: 0.4, b: 0.3 },
  reversed: { label: '反向偏差', a: 0.8, b: 0.2 },
};

function validShare(value) { return Number.isFinite(value) && value >= 0 && value <= 1; }

export const channelCompositionModel = {
  validate(config) {
    const p = config.parameters;
    for (const key of ['oldOrganicShare', 'newOrganicShare']) {
      const x = p?.[key];
      if (!x || !validShare(x.min) || !validShare(x.max) || !validShare(x.value)
          || x.min >= x.max || x.value < x.min || x.value > x.max) throw new Error(`${key} 参数范围无效。`);
    }
  },
  mount(root, config) {
    const content = createShell(root, config), p = config.parameters;
    const controller = new AbortController(), { signal } = controller;
    root.dataset.model = 'channel-composition';
    const summary = element('section', 'channel-demo__summary');
    const toolbar = element('div', 'channel-demo__toolbar');
    const top = element('div', 'channel-demo__top');
    const totals = element('div', 'channel-demo__totals');
    const metrics = element('div', 'channel-demo__metrics');
    const aRate = element('strong', 'channel-demo__headline-value');
    const bRate = element('strong', 'channel-demo__headline-value');
    const observed = element('strong', 'channel-demo__metric-value channel-demo__metric-value--effect');
    const bias = element('strong', 'channel-demo__metric-value channel-demo__metric-value--bias');
    function summaryCell(label, value) { const box = element('div', 'channel-demo__summary-cell'); box.append(element('span', null, label), value); return box; }
    totals.append(summaryCell('A 组 · 原关卡留存率', aRate), summaryCell('B 组 · 新关卡留存率', bRate));
    metrics.append(summaryCell('观察到的组间差异', observed), summaryCell('渠道构成造成的偏差', bias));
    const reset = createButton('⟲ 重置', 'channel-demo__reset');
    toolbar.append(reset);
    top.append(totals, metrics);
    summary.append(toolbar, top);

    const controls = element('section', 'channel-demo__mixes');
    const sliders = element('div', 'channel-demo__sliders');
    const a = createRangeControl({ label: 'A 组 · 原关卡', min: p.oldOrganicShare.min, max: p.oldOrganicShare.max,
      step: 0.01, value: p.oldOrganicShare.value, format: (v) => `自然渠道 ${Math.round(v * 100)}%` });
    const b = createRangeControl({ label: 'B 组 · 新关卡', min: p.newOrganicShare.min, max: p.newOrganicShare.max,
      step: 0.01, value: p.newOrganicShare.value, format: (v) => `自然渠道 ${Math.round(v * 100)}%` });
    const mixA = element('div', 'channel-demo__mix'); const mixB = element('div', 'channel-demo__mix');
    const aLabels = element('div', 'channel-demo__mix-labels'), bLabels = element('div', 'channel-demo__mix-labels');
    const aBar = element('div', 'channel-demo__mix-bar'), bBar = element('div', 'channel-demo__mix-bar');
    const aPaid = element('span', 'channel-demo__mix-paid'), aOrganic = element('span', 'channel-demo__mix-organic');
    const bPaid = element('span', 'channel-demo__mix-paid'), bOrganic = element('span', 'channel-demo__mix-organic');
    aBar.append(aPaid, aOrganic); bBar.append(bPaid, bOrganic);
    aLabels.append(element('span', null, '付费渠道'), element('span', null, '自然渠道'));
    bLabels.append(element('span', null, '付费渠道'), element('span', null, '自然渠道'));
    mixA.append(aLabels, aBar); mixB.append(bLabels, bBar);
    sliders.append(a.wrapper, mixA, b.wrapper, mixB); controls.append(sliders);
    const legend = element('div', 'channel-demo__legend');
    legend.append(element('span', 'channel-demo__legend-paid', '付费渠道'), element('span', 'channel-demo__legend-organic', '自然渠道'));
    controls.append(legend); summary.append(controls);

    const decomposition = element('section', 'channel-demo__decomposition');
    decomposition.append(element('h4', null, '总体差异的分解'));
    const equation = element('div', 'channel-demo__equation');
    const observedEq = element('strong'); const effectEq = element('strong', 'channel-demo__metric-value--effect'); const biasEq = element('strong', 'channel-demo__metric-value--bias');
    equation.append(observedEq, element('span', null, '='), effectEq, element('span', null, '+'), biasEq);
    const equationLabels = element('div', 'channel-demo__equation-labels');
    equationLabels.append(element('span', null, '观察差异'), element('span', null, '真实效应 + 构成偏差'));
    const chart = element('div', 'channel-demo__outcomes');
    const aRow = element('div', 'channel-demo__outcome-row'), bRow = element('div', 'channel-demo__outcome-row');
    const aTrack = element('div', 'channel-demo__track'), bTrack = element('div', 'channel-demo__track');
    aTrack.append(element('span', 'channel-demo__fill'));
    bTrack.append(element('span', 'channel-demo__fill channel-demo__fill--b'));
    aRow.append(element('span', null, 'A'), aTrack, element('strong'));
    bRow.append(element('span', null, 'B'), bTrack, element('strong'));
    chart.append(aRow, bRow);
    const explanation = element('p', 'channel-demo__explanation'); explanation.setAttribute('aria-live', 'polite');
    decomposition.append(equation, equationLabels, chart, explanation);
    const presetSection = element('section', 'channel-demo__presets');
    presetSection.append(element('h4', null, '切换典型情境'));
    const presetGrid = element('div', 'channel-demo__preset-grid');
    const presetButtons = {};
    for (const [key, item] of Object.entries(presets)) {
      const button = createButton(item.label, 'channel-demo__preset');
      button.addEventListener('click', () => setShares(item.a, item.b), { signal });
      presetButtons[key] = button; presetGrid.append(button);
    }
    presetSection.append(presetGrid);
    content.append(summary, decomposition, presetSection);

    function setShares(aShare, bShare) {
      a.input.value = String(aShare); b.input.value = String(bShare);
      a.output.value = a.output.textContent = `自然渠道 ${Math.round(aShare * 100)}%`;
      b.output.value = b.output.textContent = `自然渠道 ${Math.round(bShare * 100)}%`;
      update();
    }
    function update() {
      const aMix = Number(a.input.value), bMix = Number(b.input.value);
      const aVal = 0.2 + 0.2 * aMix;
      const bVal = 0.22 + 0.2 * bMix;
      const counterfactual = 0.2 + 0.2 * bMix;
      const diff = bVal - aVal, effect = bVal - counterfactual, compositionBias = counterfactual - aVal;
      aRate.textContent = `${(aVal * 100).toFixed(0)}%`; bRate.textContent = `${(bVal * 100).toFixed(0)}%`;
      observed.textContent = `${diff >= 0 ? '+' : ''}${(diff * 100).toFixed(0)} pp`;
      bias.textContent = `${compositionBias >= 0 ? '+' : ''}${(compositionBias * 100).toFixed(0)} pp`;
      observedEq.textContent = `${diff >= 0 ? '+' : ''}${(diff * 100).toFixed(0)} pp`;
      effectEq.textContent = `${effect >= 0 ? '+' : ''}${(effect * 100).toFixed(0)} pp`;
      biasEq.textContent = `${compositionBias >= 0 ? '+' : ''}${(compositionBias * 100).toFixed(0)} pp`;
      for (const [row, value] of [[aRow, aVal], [bRow, bVal]]) {
        row.querySelector('.channel-demo__fill').style.width = `${value / 0.45 * 100}%`;
        row.querySelector('strong').textContent = `${(value * 100).toFixed(0)}%`;
      }
      aPaid.style.width = `${(1 - aMix) * 100}%`; aOrganic.style.width = `${aMix * 100}%`;
      bPaid.style.width = `${(1 - bMix) * 100}%`; bOrganic.style.width = `${bMix * 100}%`;
      const gap = Math.round((bMix - aMix) * 100);
      if (Math.abs(gap) < 1) explanation.textContent = '两组渠道构成平衡，渠道构成偏差为 0；观察差异等于渠道内版本效果。';
      else if (compositionBias > 0 && diff < 0) explanation.textContent = `B 组虽然真实效果为正，但其低留存付费渠道占比更高，构成偏差 ${Math.abs(compositionBias * 100).toFixed(0)} pp 反转了总体观察差异。`;
      else if (compositionBias < 0 && diff > effect) explanation.textContent = `B 组高留存自然渠道占比更低，构成偏差为负，压低了观察到的版本效果。`;
      else if (compositionBias > 0) explanation.textContent = `B 组拥有更高比例的高留存自然渠道用户，使总体差异被高估了 +${(compositionBias * 100).toFixed(0)} pp。`;
      else explanation.textContent = `B 组自然渠道占比低于 A 组，渠道构成偏差为 ${(compositionBias * 100).toFixed(0)} pp；总体差异 = 真实效应 + 构成偏差。`;
      const active = Object.entries(presets).find(([, x]) => Math.abs(x.a - aMix) < 0.005 && Math.abs(x.b - bMix) < 0.005)?.[0];
      for (const [key, button] of Object.entries(presetButtons)) button.dataset.active = String(key === active);
    }
    a.input.addEventListener('input', update, { signal }); b.input.addEventListener('input', update, { signal });
    reset.addEventListener('click', () => setShares(p.oldOrganicShare.value, p.newOrganicShare.value), { signal });
    update();
    return () => controller.abort();
  },
};
