import { createButton, createRangeControl, createShell, element } from '@/features/components/shared.js';

const cls = (name) => `population-effects__${name}`;
const EPS = 1e-10;
const percent = (value, digits = 1) => value === null ? '未定义' : `${(value * 100).toFixed(digits)}%`;
const pp = (value) => value === null ? '未定义' : `${value > EPS ? '+' : ''}${(Math.abs(value) < EPS ? 0 : value * 100).toFixed(2)} pp`;
const meanA = (p) => 0.4 * p + 0.3 * (1 - p);
const meanB = (p) => 0.44 * p + 0.29 * (1 - p);
const effect = (p) => 0.04 * p - 0.01 * (1 - p);
const presets = [
  { label: '随机分配下的理想实验', note: 'ATE = ATT = 1.5 pp', p: 0.5, t: 0.5, mode: 'random' },
  { label: '目标人群构成发生变化', note: '广告投放用户占比 80%，ATE = 0', p: 0.2, t: 0.2, mode: 'random' },
  { label: '已处理者构成发生变化', note: 'ATE = 1.5 pp，ATT = 3.0 pp', p: 0.5, t: 0.8, mode: 'random' },
  { label: '按用户渠道实施处理分配', note: 'ATE = 1.5 pp，观测差异 = 14 pp', p: 0.5, t: 0.5, mode: 'channel' },
];
const initialState = (parameters = {}) => ({ p: parameters.targetShare ?? 0.5, t: parameters.treatedShare ?? 0.5,
  strength: parameters.strength ?? 0.5, mode: 'random' });

function svgNode(tag, attributes = {}, text) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, String(value));
  if (text !== undefined) node.textContent = text;
  return node;
}
function svgText(parent, x, y, text, className = '') {
  const node = svgNode('text', { x, y, 'text-anchor': 'middle', class: className }, text);
  parent.append(node); return node;
}
function graphic(viewBox) {
  return svgNode('svg', { viewBox, role: 'img', class: cls('graphic') });
}
function math(source) {
  const node = element('span', cls('math'), `\\(${source}\\)`);
  node.dataset.componentMath = 'true'; return node;
}
function formula(source) {
  const node = element('p', cls('formula')); node.append(math(source)); return node;
}

// Assignment is independent of potential outcomes within each channel.
// s=0 randomizes both channels with probability 1/2; s=1 separates channels.
function assignment(state) {
  const s = state.mode === 'random' ? 0 : state.mode === 'channel' ? 1 : state.strength;
  const organicB = (1 + s) / 2, advertisingB = (1 - s) / 2;
  const massB = state.p * organicB + (1 - state.p) * advertisingB;
  const massA = state.p * (1 - organicB) + (1 - state.p) * (1 - advertisingB);
  const a = massA > EPS ? state.p * (1 - organicB) / massA : null;
  const b = massB > EPS ? state.p * organicB / massB : null;
  const rateA = a === null ? null : meanA(a), rateB = b === null ? null : meanB(b);
  const delta = a === null || b === null ? null : rateB - rateA;
  return { a, b, rateA, rateB, massA, massB, delta,
    b1: b === null ? null : rateB - meanB(state.p),
    minusB0: a === null ? null : meanA(state.p) - rateA };
}

export const populationEffectsModel = {
  validate(config) {
    const state = initialState(config.parameters);
    if (![state.p, state.t, state.strength].every((v) => Number.isFinite(v) && v >= 0 && v <= 1)
      || ((state.p === 0 || state.p === 1) && state.t !== state.p)) {
      throw new Error('渠道占比和倾向强度须在 0 到 1 之间；单一渠道总体的已处理者须来自同一渠道。');
    }
  },
  mount(root, config) {
    const content = createShell(root, config); content.classList.add('population-effects');
    const controller = new AbortController();
    const on = (node, event, handler) => node.addEventListener(event, handler, { signal: controller.signal });
    let state = initialState(config.parameters), activePreset = -1;
    let mathRequested = false, mathReady = false;
    const liveMath = [];
    function section(title) {
      const node = element('section', cls('section')); node.append(element('h4', cls('heading'), title)); content.append(node); return node;
    }
    function button(label, action, className = cls('button')) {
      const node = createButton(label, className); on(node, 'click', action); return node;
    }
    function control(label, value, handler) {
      const node = createRangeControl({ label, min: 0, max: 100, step: 1, value: value * 100, format: (v) => percent(v / 100, 0) });
      node.wrapper.classList.add(cls('control'));
      on(node.input, 'input', () => { activePreset = -1; handler(Number(node.input.value) / 100); update(); });
      return node;
    }
    function syncControl(node, value) { node.input.value = String(value * 100); node.output.value = percent(value, 0); }
    function mix(parent, label = '') {
      const node = element('div', cls('mix-row'));
      if (label) node.append(element('span', null, label));
      const track = element('div', cls('mix')); track.setAttribute('role', 'img');
      const organic = element('span', cls('organic')), advertising = element('span', cls('advertising'));
      track.append(organic, advertising); node.append(track); parent.append(node);
      return { track, organic, advertising };
    }
    function syncMix(view, value) {
      view.organic.style.width = `${(value ?? 0) * 100}%`;
      view.advertising.style.width = `${(value === null ? 0 : 1 - value) * 100}%`;
      view.organic.textContent = value !== null && value >= 0.08 ? percent(value, 0) : '';
      view.advertising.textContent = value !== null && value <= 0.92 ? percent(1 - value, 0) : '';
      view.track.setAttribute('aria-label', value === null ? '该分配组为空' : `自然流量 ${percent(value)}，广告投放 ${percent(1 - value)}`);
    }
    function metrics(parent, labels) {
      const grid = element('div', cls('metrics'));
      const values = labels.map((label) => {
        const cell = element('div'); const value = element('strong');
        cell.append(element('span', cls('note'), label), value); grid.append(cell); return value;
      });
      parent.append(grid); return values;
    }
    function signed(node, value, color = '') {
      node.textContent = pp(value);
      node.dataset.tone = value === null ? 'undefined' : color || (value > EPS ? 'positive' : 'negative');
    }
    function dynamicFormula(parent) {
      const node = math(''), wrapper = element('p', cls('formula'));
      wrapper.append(node); parent.append(wrapper);
      const item = { node, source: '', rendered: '', busy: false }; liveMath.push(item); return item;
    }
    function setFormula(item, source) {
      item.source = source;
      if (!mathRequested) item.node.textContent = `\\(${source}\\)`;
      else void renderFormula(item);
    }

    const channels = section('01 渠道内的潜在结果');
    channels.append(element('p', cls('note'), '保持各渠道的潜在结果均值与条件平均处理效应不变。'));
    const tableWrap = element('div', cls('table-wrap')), table = element('table', cls('table'));
    const head = element('thead'), headRow = element('tr');
    ['用户渠道', null, null, 'CATE'].forEach((label) => { const th = element('th', null, label ?? ''); th.scope = 'col'; headRow.append(th); });
    headRow.children[1].append(math(String.raw`\mathbb E[Y(0)\mid X]`));
    headRow.children[2].append(math(String.raw`\mathbb E[Y(1)\mid X]`));
    head.append(headRow); table.append(head);
    const body = element('tbody');
    [['自然流量', '40%', '44%', 0.04], ['广告投放', '30%', '29%', -0.01]].forEach(([label, a, b, tau], i) => {
      const row = element('tr'), name = element('th', cls('channel-label'), label), value = element('td');
      name.scope = 'row'; name.dataset.channel = String(i); signed(value, tau);
      row.append(name, element('td', null, a), element('td', null, b), value); body.append(row);
    });
    table.append(body); tableWrap.append(table); channels.append(tableWrap);

    const target = section('02 目标人群构成与 ATE');
    const pControl = control('目标人群中自然流量用户占比', state.p, (p) => {
      state.p = p; if (p === 0 || p === 1) state.t = p;
    });
    target.append(pControl.wrapper);
    const marks = element('div', cls('marks'));
    [0, 0.2, 0.5, 1].forEach((p) => { const mark = element('span', null, percent(p, 0)); mark.style.left = `${p * 100}%`; marks.append(mark); }); target.append(marks);
    const targetMix = mix(target);
    const targetValues = metrics(target, ['方案 A 留存率', '方案 B 留存率', '总体 ATE']);
    const ateFormula = dynamicFormula(target);
    const line = graphic('0 0 620 320');
    for (let tick = -1; tick <= 4; tick++) {
      const y = 230 - (tick + 1) * 40;
      line.append(svgNode('line', { x1: 70, x2: 570, y1: y, y2: y, class: cls(tick === 0 ? 'zero-line' : 'gridline') }));
      svgText(line, 45, y + 5, String(tick));
    }
    line.append(svgNode('path', { d: 'M70 190 L70 230 L170 190 Z', class: cls('area-negative') }),
      svgNode('path', { d: 'M170 190 L570 30 L570 190 Z', class: cls('area-positive') }),
      svgNode('path', { d: 'M70 230 L170 190', class: cls('line-negative') }),
      svgNode('path', { d: 'M170 190 L570 30', class: cls('line-positive') }));
    svgText(line, 96, 17, 'ATE (pp)');
    [0, 0.2, 0.5, 0.75, 1].forEach((p) => svgText(line, 70 + p * 500, 262, percent(p, 0)));
    svgText(line, 320, 305, '自然流量用户占比');
    line.append(svgNode('circle', { cx: 170, cy: 190, r: 5, class: cls('zero-point') }));
    svgText(line, 215, 213, 'ATE = 0');
    const guide = svgNode('line', { class: cls('guide') }), point = svgNode('circle', { r: 8, class: cls('current-point') });
    line.append(guide, point); const pointValue = svgText(line, 0, 0, '', cls('point-value')); target.append(line);

    const treated = section('03 已处理者构成与 ATT');
    const tControl = control('已处理者中自然流量用户占比', state.t, (t) => { state.t = t; }); treated.append(tControl.wrapper);
    const referenceMix = mix(treated, '目标人群'), treatedMix = mix(treated, '已处理者');
    const legend = element('div', cls('legend'));
    ['自然流量', '广告投放'].forEach((label, i) => { const node = element('span', cls('channel-label'), label); node.dataset.channel = String(i); legend.append(node); }); treated.append(legend);
    const attFormula = dynamicFormula(treated);
    const treatmentValues = metrics(treated, ['ATE', 'ATT', 'ATT − ATE']);
    const compare = graphic('0 0 620 195');
    [-1, 0, 1, 2, 3, 4].forEach((v) => {
      const x = 140 + (v + 1) * 84;
      compare.append(svgNode('line', { x1: x, x2: x, y1: 12, y2: 139, class: cls(v === 0 ? 'zero-line' : 'gridline') }));
      svgText(compare, x, 169, `${v} pp`);
    });
    const comparisonBars = ['ATE', 'ATT'].map((label, i) => {
      svgText(compare, 58, 51 + i * 62, label);
      const bar = svgNode('rect', { y: 25 + i * 62, height: 36, rx: 5, class: cls(i ? 'att-bar' : 'ate-bar') }); compare.append(bar); return bar;
    });
    treated.append(compare, button('令已处理者与目标人群构成一致', () => { state.t = state.p; activePreset = -1; update(); }, cls('wide-button')),
      element('p', cls('note'), '本模块独立设定已处理者构成，并假设给定渠道后潜在结果与实际处理条件可交换，不代表下方分配模块的同一次实验。目标人群仅有一个渠道时，已处理者构成也固定为该渠道。'));

    const allocation = section('04 处理分配与观测均值差');
    const modes = element('div', cls('modes')); modes.setAttribute('role', 'group'); modes.setAttribute('aria-label', '处理分配方式');
    const modeButtons = [['random', '随机分配'], ['biased', '倾向性分配'], ['channel', '按渠道分配']].map(([mode, label]) => {
      const node = button(label, () => { state.mode = mode; activePreset = -1; update(); }); modes.append(node); return { mode, node };
    }); allocation.append(modes);
    const strength = control('渠道分配倾向强度', state.strength, (v) => { state.strength = v; });
    const strengthPanel = element('div', cls('strength')); strengthPanel.append(strength.wrapper,
      element('p', cls('note'), '强度为 s 时，自然流量进入 B 的概率为 (1+s)/2，广告用户进入 B 的概率为 (1−s)/2。0% 对应随机分配，100% 对应按渠道分配。'));
    allocation.append(strengthPanel);
    const flow = element('div', cls('flow')), targetBox = element('div', cls('flow-target'));
    targetBox.append(element('strong', null, '目标人群')); const flowTargetMix = mix(targetBox);
    const branch = element('div', cls('branch')); branch.setAttribute('aria-hidden', 'true');
    const groups = element('div', cls('groups'));
    const groupViews = ['方案 A', '方案 B'].map((label, i) => {
      const box = element('div', cls('group')), heading = element('strong', cls('group-title'), `${label} · `); heading.append(math(`Z=${i}`));
      box.append(heading); const composition = mix(box); const value = element('strong', cls('group-value'));
      const mass = element('small', cls('note')); box.append(value, element('span', cls('note'), '观测留存率'), mass); groups.append(box);
      return { composition, value, mass };
    });
    flow.append(targetBox, branch, groups); allocation.append(flow);
    const allocationValues = metrics(allocation, ['真实 ATE', '观测均值差', '选择偏差']);

    const decomposition = section('05 观测均值差的偏差分解');
    decomposition.append(formula(String.raw`\Delta_{\mathrm{obs}}=\tau_P+B_1-B_0`));
    const breakdown = element('table', cls('table')), breakdownBody = element('tbody');
    const breakdownValues = [
      [String.raw`\tau_P`, '真实平均处理效应'], ['B_1', 'B 组与目标人群的差异'], ['-B_0', 'A 组与目标人群的差异（取负）'],
      [String.raw`\Delta_{\mathrm{obs}}`, '观测均值差'],
    ].map(([symbol, label]) => {
      const row = element('tr'), name = element('th'), value = element('td'); name.scope = 'row'; name.append(math(symbol));
      row.append(name, element('td', null, label), value); breakdownBody.append(row); return value;
    }); breakdown.append(breakdownBody); decomposition.append(breakdown);
    decomposition.append(element('p', cls('note'), 'B₁ = B 组在方案 B 下的平均潜在结果 − 目标人群在方案 B 下的均值；B₀ 为 A 组在方案 A 下的对应差异。'));
    const waterfall = graphic('0 0 620 315');
    const waterY = (v) => 200 - v * 1100;
    [-5, 0, 5, 10, 15].forEach((v) => {
      const y = waterY(v / 100); waterfall.append(svgNode('line', { x1: 65, x2: 603, y1: y, y2: y, class: cls(v === 0 ? 'zero-line' : 'gridline') })); svgText(waterfall, 40, y + 5, String(v));
    });
    const waterfallBars = ['真实 ATE', 'B 组偏差', '−A 组偏差', '观测差异'].map((label, i) => {
      const x = 90 + i * 130;
      const bar = svgNode('rect', { x, width: 75, rx: 3, class: cls(i === 0 ? 'att-bar' : i === 3 ? 'ate-bar' : 'bias-bar') });
      waterfall.append(bar); const value = svgText(waterfall, x + 37.5, 0, '', cls('water-value'));
      const connector = i < 3 ? svgNode('line', { x1: x + 75, x2: x + 130, class: cls('water-connector') }) : null;
      if (connector) waterfall.append(connector);
      svgText(waterfall, x + 37.5, 295, label); return { bar, value, connector };
    });
    const explanation = element('div', cls('interpretation')), explanationText = element('p');
    explanation.append(element('strong', null, '当前实验结果'), explanationText);
    explanationText.setAttribute('role', 'status'); explanationText.setAttribute('aria-live', 'polite');
    decomposition.append(waterfall, explanation);

    const scenarios = section('06 预设情景');
    const presetList = element('div', cls('presets'));
    const presetButtons = presets.map((preset, i) => {
      const node = button('', () => { state = { p: preset.p, t: preset.t, mode: preset.mode, strength: 0.5 }; activePreset = i; update(); }, cls('preset'));
      const text = element('span'); text.append(element('strong', null, preset.label), element('small', cls('note'), preset.note));
      node.append(text, element('span', null, '›')); presetList.append(node); return node;
    });
    scenarios.append(presetList, button('↶ 重置演示', () => { state = initialState(config.parameters); activePreset = -1; update(); }, cls('wide-button')),
      element('p', cls('note'), '渠道内留存概率沿用原文案例。ATT 模块与处理分配模块为独立情景；倾向性分配为额外构造的演示机制。所有结果均为总体理论值，不包含有限样本随机误差。'));

    function update() {
      const { p, t } = state, ate = effect(p), att = effect(t), allocationResult = assignment(state);
      syncControl(pControl, p); syncControl(tControl, t); syncControl(strength, state.strength);
      tControl.input.disabled = p === 0 || p === 1;
      [targetMix, referenceMix, flowTargetMix].forEach((view) => syncMix(view, p)); syncMix(treatedMix, t);
      targetValues[0].textContent = percent(meanA(p)); targetValues[1].textContent = percent(meanB(p)); signed(targetValues[2], ate);
      setFormula(ateFormula, String.raw`\tau_P=${p.toFixed(2)}\times0.04+${(1 - p).toFixed(2)}\times(-0.01)`);
      setFormula(attFormula, String.raw`\tau_{P,\mathrm{ATT}}=${t.toFixed(2)}\times0.04+${(1 - t).toFixed(2)}\times(-0.01)`);
      const x = 70 + p * 500, y = 230 - (ate * 100 + 1) * 40;
      point.setAttribute('cx', String(x)); point.setAttribute('cy', String(y));
      for (const [key, value] of Object.entries({ x1: x, x2: x, y1: y, y2: 230 })) guide.setAttribute(key, String(value));
      pointValue.setAttribute('x', String(x)); pointValue.setAttribute('y', String(Math.max(17, y - 18)));
      pointValue.setAttribute('text-anchor', p < 0.15 ? 'start' : p > 0.85 ? 'end' : 'middle'); pointValue.textContent = pp(ate);
      line.setAttribute('aria-label', `目标人群自然流量占 ${percent(p)}，ATE 为 ${pp(ate)}。自然流量占 20% 时 ATE 为零。`);
      signed(treatmentValues[0], ate, 'blue'); signed(treatmentValues[1], att, 'positive'); signed(treatmentValues[2], att - ate);
      [ate, att].forEach((value, i) => {
        comparisonBars[i].setAttribute('x', String(value < 0 ? 224 + value * 8400 : 224)); comparisonBars[i].setAttribute('width', String(Math.abs(value) * 8400));
      }); compare.setAttribute('aria-label', `ATE 为 ${pp(ate)}，ATT 为 ${pp(att)}`);
      modeButtons.forEach(({ mode, node }) => node.setAttribute('aria-pressed', String(state.mode === mode)));
      strengthPanel.hidden = state.mode !== 'biased';
      [allocationResult.a, allocationResult.b].forEach((value, i) => {
        syncMix(groupViews[i].composition, value); groupViews[i].value.textContent = percent(i ? allocationResult.rateB : allocationResult.rateA, 2);
        groupViews[i].mass.textContent = value === null ? '该组为空，组均值未定义' : `占目标人群 ${percent(i ? allocationResult.massB : allocationResult.massA)}`;
      });
      const delta = allocationResult.delta, bias = delta === null ? null : delta - ate;
      signed(allocationValues[0], ate, 'positive'); signed(allocationValues[1], delta, 'blue'); signed(allocationValues[2], bias, 'negative');
      const values = [ate, allocationResult.b1, allocationResult.minusB0, delta];
      values.forEach((value, i) => { breakdownValues[i].textContent = pp(value); });
      const cumulative = [ate, allocationResult.b1 === null ? null : ate + allocationResult.b1, delta, delta];
      waterfallBars.forEach(({ bar, value, connector }, i) => {
        const start = i === 0 || i === 3 ? 0 : cumulative[i - 1], end = cumulative[i];
        const visible = start !== null && end !== null;
        bar.setAttribute('height', String(visible ? Math.max(2, Math.abs(end - start) * 1100) : 0));
        bar.setAttribute('y', String(visible ? Math.min(waterY(start), waterY(end)) : waterY(0)));
        value.textContent = pp(values[i]); value.setAttribute('y', String(visible ? Math.min(waterY(start), waterY(end)) - 11 : waterY(0) - 11));
        if (connector) { connector.setAttribute('visibility', end === null ? 'hidden' : 'visible'); connector.setAttribute('y1', String(waterY(end ?? 0))); connector.setAttribute('y2', String(waterY(end ?? 0))); }
      });
      waterfall.setAttribute('aria-label', `偏差分解：真实 ATE ${pp(ate)}，B 组偏差 ${pp(values[1])}，负 A 组偏差 ${pp(values[2])}，观测差异 ${pp(delta)}。`);
      explanationText.textContent = delta === null ? '当前分配方式使一个组为空，无法计算观测均值差及完整偏差分解。'
        : Math.abs(bias) < EPS ? '观测均值差等于目标人群的平均处理效应，两组不存在由渠道构成差异带来的选择偏差。'
          : `观测均值差为 ${pp(delta)}，真实 ATE 为 ${pp(ate)}，两者相差 ${pp(bias)}。渠道内结果没有改变，差异来自分配后两组的渠道构成。`;
      presetButtons.forEach((node, i) => node.setAttribute('aria-pressed', String(activePreset === i)));
    }
    async function renderFormula(item) {
      if (!mathReady || item.busy || controller.signal.aborted || item.rendered === item.source) return;
      item.busy = true; const source = item.source;
      try {
        const output = await window.MathJax.tex2svgPromise(source, { display: false });
        if (controller.signal.aborted || source !== item.source) return;
        window.MathJax.typesetClear?.([item.node]); item.node.replaceChildren(output); item.rendered = source;
        document.dispatchEvent(new CustomEvent('site:layout-change'));
      } catch { /* Preserve the previous rendered equation if conversion fails. */ }
      finally { item.busy = false; if (!controller.signal.aborted && source !== item.source) void renderFormula(item); }
    }
    function typeset() {
      if (mathRequested || !window.siteMathJax || controller.signal.aborted) return;
      mathRequested = true; const sources = liveMath.map((item) => item.source);
      void window.siteMathJax.typeset(content).then(() => {
        if (controller.signal.aborted) { window.MathJax?.typesetClear?.([content]); return; }
        mathReady = true; liveMath.forEach((item, i) => { item.rendered = sources[i]; void renderFormula(item); });
      }).catch(() => { mathRequested = false; });
    }
    update(); on(document, 'site:layout-change', typeset); typeset();
    return () => { controller.abort(); window.MathJax?.typesetClear?.([content]); };
  },
};
