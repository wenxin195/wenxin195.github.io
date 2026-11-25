import { createButton, createRangeControl, createShell, createToggleControl, element } from '@/features/components/shared.js';

const EPS = 1e-10;
const types = [
  { name: '依从者', key: 'C', d: [0, 1] },
  { name: '始终接受者', key: 'A', d: [1, 1] },
  { name: '从不接受者', key: 'N', d: [0, 0] },
  { name: '反向依从者', key: 'F', d: [1, 0] },
];
const defaults = { shares: [0.6, 0.2, 0.2, 0], baseline: [0.35, 0.45, 0.25, 0.4], effects: [0.08, 0.02, -0.02, -0.04], assignment: 0.5 };
const scenarios = [
  { title: '完全依从', note: 'ATE = ATT = ITT = CACE', shares: [1, 0, 0, 0] },
  { title: '单侧不依从', note: 'ATT = CACE，ITT 被依从者比例稀释', shares: [0.6, 0, 0.4, 0] },
  { title: '双侧不依从', note: 'ATT 与 CACE 通常不相等', shares: defaults.shares },
  { title: '违反单调性', note: '存在反向依从者', shares: [0.45, 0.2, 0.2, 0.15] },
  { title: '违反排除限制', note: '分配本身对留存产生 +2 pp 的直接影响', shares: defaults.shares, gamma: 0.02 },
  { title: '违反相关性', note: 'First Stage = 0；无依从者，Wald 比值和 CACE 未定义', shares: [0, 0.4, 0.6, 0] },
];
const cls = (name) => `compliance-effects__${name}`;
const percent = (value, digits = 1) => `${(value * 100).toFixed(digits)}%`;
const pp = (value) => value === null ? '未定义' : `${value > EPS ? '+' : ''}${(Math.abs(value) < EPS ? 0 : value * 100).toFixed(2)} pp`;
const sum = (values) => values.reduce((total, value) => total + value, 0);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const initialState = (parameters = {}) => ({
  shares: [...(parameters.shares ?? defaults.shares)],
  baseline: [...(parameters.baseline ?? defaults.baseline)],
  effects: [...(parameters.effects ?? defaults.effects)],
  assignment: parameters.assignment ?? defaults.assignment,
  exclusion: true, gamma: 0,
});

function math(source) {
  const node = element('span', cls('math'), `\\(${source}\\)`);
  node.dataset.componentMath = 'true';
  return node;
}
function formula(source) {
  const node = element('p', cls('formula'));
  node.append(math(source));
  return node;
}
function svgNode(tag, attributes = {}, text) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  if (text !== undefined) node.textContent = text;
  return node;
}
function svgText(parent, x, y, text, className = '') {
  const node = svgNode('text', { x, y, 'text-anchor': 'middle', class: className }, text);
  parent.append(node);
  return node;
}
function svgMath(parent, x, y, width, height, source) {
  const box = svgNode('foreignObject', { x, y, width, height });
  const label = element('div', cls('svg-math'));
  label.append(math(source)); box.append(label); parent.append(box);
}
function gammaBounds(state) {
  const rates = state.baseline.flatMap((baseline, i) => [baseline, baseline + state.effects[i]]);
  return { min: Math.max(-0.1, -Math.min(...rates)), max: Math.min(0.1, 1 - Math.max(...rates)) };
}

// Expectations under a randomized assignment and type-specific outcome means.
function calculate(state) {
  const { shares: p, baseline: b, effects: tau, assignment: q, gamma } = state;
  const joint = [0, 0];
  const totals = [0, 0];
  const assignedRates = [0, 0];
  const treatedMass = types.map((type, i) => p[i] * ((1 - q) * type.d[0] + q * type.d[1]));
  types.forEach((type, i) => {
    for (const z of [0, 1]) {
      const d = type.d[z];
      const mass = p[i] * (z === 1 ? q : 1 - q);
      const mean = b[i] + tau[i] * d + gamma * z;
      joint[d] += mass * mean;
      totals[d] += mass;
      assignedRates[z] += p[i] * mean;
    }
  });
  const attWeights = totals[1] > EPS ? treatedMass.map((mass) => mass / totals[1]) : null;
  const ate = sum(p.map((share, i) => share * tau[i]));
  const att = attWeights ? sum(attWeights.map((weight, i) => weight * tau[i])) : null;
  const itt = assignedRates[1] - assignedRates[0];
  const firstStage = p[0] - p[3];
  const cace = p[0] > EPS ? tau[0] : null;
  const wald = Math.abs(firstStage) > EPS ? itt / firstStage : null;
  const naive = totals.every((total) => total > EPS) ? joint[1] / totals[1] - joint[0] / totals[0] : null;
  return { ate, att, itt, cace, wald, naive, firstStage, assignedRates, totals, attWeights,
    firstRates: [p[1] + p[3], p[0] + p[1]],
    identified: firstStage > EPS && p[3] < EPS && Math.abs(gamma) < EPS,
  };
}

export const complianceEffectsModel = {
  validate(config) {
    const state = initialState(config.parameters);
    for (const name of ['shares', 'baseline', 'effects']) {
      if (state[name].length !== 4 || !state[name].every(Number.isFinite)) throw new Error('依从类型需要四个有限数值。');
    }
    if (state.shares.some((p) => p < 0 || p > 1) || Math.abs(sum(state.shares) - 1) > EPS
      || state.baseline.some((b, i) => b < 0 || b > 1 || b + state.effects[i] < 0 || b + state.effects[i] > 1)
      || !Number.isFinite(state.assignment) || state.assignment < 0.01 || state.assignment > 0.99) {
      throw new Error('人群占比之和须为 1，潜在留存率须在 0 到 1 之间，分配概率须在 1% 到 99% 之间。');
    }
  },

  mount(root, config) {
    const content = createShell(root, config);
    content.classList.add('compliance-effects');
    const controller = new AbortController();
    const on = (node, event, handler) => node.addEventListener(event, handler, { signal: controller.signal });
    let state = initialState(config.parameters);
    let lastDefierShare = state.shares[3] > EPS ? state.shares[3] : 0.15;
    let activeScenario = -1;
    let mathReady = false;
    let mathRequested = false;
    let rendering = false;
    let ratioSource = '';
    let renderedSource = '';
    let directSource = '';
    let renderedDirectSource = '';
    let directRendering = false;
    function section(title) {
      const node = element('section', cls('section'));
      node.append(element('h4', cls('heading'), title)); content.append(node); return node;
    }
    function control(label, min, max, value, format, handler) {
      const node = createRangeControl({ label, min, max, value, step: 'any', format });
      node.wrapper.classList.add(cls('control'));
      on(node.input, 'input', () => { activeScenario = -1; handler(Number(node.input.value)); update(); });
      return node;
    }
    function sync(node, value, format = (v) => percent(v / 100), min, max) {
      if (min !== undefined) node.input.min = String(min);
      if (max !== undefined) node.input.max = String(max);
      node.input.value = String(value);
      node.output.value = format(value);
    }
    function effectValue(node, value) {
      node.textContent = pp(value);
      node.dataset.sign = value === null ? 'undefined' : value > EPS ? 'positive' : 'negative';
    }
    function dotLabel(index) {
      const label = element('span', cls('type-label'), types[index].name);
      label.dataset.type = String(index); return label;
    }
    function mix(parent, title) {
      const row = element('div', cls('mix-row'));
      if (title) row.append(element('span', null, title));
      const track = element('div', cls('mix'));
      track.setAttribute('role', 'img');
      const segments = types.map((_, i) => { const node = element('span'); node.dataset.type = String(i); track.append(node); return node; });
      const missing = element('small', cls('note'));
      row.append(track, missing); parent.append(row);
      return { track, segments, missing };
    }
    function syncMix(view, weights, empty = '该人群为空，平均效应未定义。') {
      view.segments.forEach((node, i) => {
        const share = weights?.[i] ?? 0;
        node.style.width = `${share * 100}%`;
        node.textContent = share >= 0.07 ? percent(share) : '';
      });
      const text = weights ? types.map((type, i) => `${type.name} ${percent(weights[i])}`).join('，') : empty;
      view.track.setAttribute('aria-label', text);
      view.missing.textContent = weights ? '' : empty;
    }
    function rate(parent, label, type = 0) {
      const row = element('div', cls('rate'));
      const value = element('strong');
      const track = element('div', cls('track'));
      const fill = element('span'); fill.dataset.type = String(type);
      track.setAttribute('aria-hidden', 'true'); track.append(fill);
      row.append(element('span', null, label), value, track); parent.append(row);
      return { value, fill };
    }
    function syncRate(view, value, digits = 1) {
      view.value.textContent = percent(value, digits);
      view.fill.style.width = `${value * 100}%`;
    }

    const population = section('01 依从类型与人群构成');
    function setShare(index, value, lockDefiers = state.shares[3] === 0) {
      const adjustable = types.map((_, i) => i).filter((i) => i !== index && !(lockDefiers && i === 3));
      const remainder = sum(adjustable.map((i) => state.shares[i]));
      state.shares = state.shares.map((share, i) => i === index ? value : !adjustable.includes(i) ? 0
        : remainder > 0 ? share / remainder * (1 - value) : (1 - value) / adjustable.length);
    }
    const shares = types.map((type, i) => {
      const node = control(`${type.name}占比`, 0, 100, state.shares[i] * 100, (v) => percent(v / 100), (value) => {
        setShare(i, value / 100);
      });
      node.wrapper.dataset.type = String(i); population.append(node.wrapper); return node;
    });
    const populationMix = mix(population);
    population.append(element('p', cls('note'), '改变一类占比时，其他可调整类型按原比例分配剩余份额；其余占比均为零时平均分配。勾选单调性时，反向依从者固定为 0。依从类型由两种潜在配置决定，不能从一次实验中逐人观测。'));

    const outcomes = section('02 各依从类型的潜在结果与处理效应');
    const outcomeCards = types.map((type, i) => {
      const card = element('div', cls('card')); card.dataset.type = String(i);
      const heading = element('div', cls('card-heading')); const effect = element('strong');
      heading.append(dotLabel(i), effect); card.append(heading);
      const baseline = control(`${type.name}：方案 A 基准留存率`, 0, 100, state.baseline[i] * 100,
        (v) => percent(v / 100), (value) => { state.baseline[i] = value / 100; });
      const treatment = control(`${type.name}：实际处理的平均因果效应`, -30, 30, state.effects[i] * 100,
        (v) => pp(v / 100), (value) => { state.effects[i] = value / 100; });
      card.append(baseline.wrapper, treatment.wrapper);
      const a = rate(card, '方案 A', 2); const b = rate(card, '方案 B', i);
      outcomes.append(card); return { effect, baseline, treatment, a, b };
    });
    outcomes.append(element('p', cls('note'), '卡片给出未叠加分配直接效应时，各潜在依从类型的平均留存率；它们是教学设定，不是能直接观测的 CATE 亚组。控件范围联动，保证所有潜在留存概率在 0 到 1 之间。'));

    const assignment = section('03 随机分配与实际配置');
    const allocation = control('分配至方案 B 的概率', 1, 99, state.assignment * 100, (v) => percent(v / 100), (value) => { state.assignment = value / 100; });
    assignment.append(allocation.wrapper);
    const flow = svgNode('svg', { viewBox: '0 0 620 550', role: 'img', class: cls('flow') });
    svgText(flow, 76, 25, '随机分配 Z'); svgText(flow, 310, 25, '依从类型'); svgText(flow, 544, 25, '实际配置 D');
    const connections = types.map((_, i) => [0, 1].map(() => {
      const paths = [svgNode('path'), svgNode('path')];
      paths.forEach((node) => { node.setAttribute('class', cls('flow-path')); node.dataset.type = String(i); flow.append(node); });
      return paths;
    }));
    function flowNode(x, y, width, height, label, type, tex = false) {
      const rect = svgNode('rect', { x, y, width, height, rx: 8, class: cls('flow-node') });
      rect.dataset.type = String(type); flow.append(rect);
      if (tex) svgMath(flow, x, y + 8, width, 28, label);
      else svgText(flow, x + width / 2, y + 26, label, cls('flow-label'));
      return svgText(flow, x + width / 2, y + 52, '', cls('flow-label'));
    }
    const sourceValues = [flowNode(14, 140, 124, 74, 'Z=0', 2, true), flowNode(14, 400, 124, 74, 'Z=1', 0, true)];
    const typeValues = types.map((type, i) => flowNode(240, 62 + i * 130, 140, 66, type.name, i));
    const destinationValues = [flowNode(482, 140, 124, 74, 'D=0', 2, true), flowNode(482, 400, 124, 74, 'D=1', 0, true)];
    assignment.append(flow, element('p', cls('note'), '流线宽度对应总体中的人群比例。每条流线保留原分配 Z 的信息，并按依从类型进入实际配置 D；调整分配概率不会改变类型本身。'));
    assignment.append(element('h5', cls('subheading'), '分配对实际处理概率的影响（First Stage）'));
    const firstRates = [rate(assignment, '分配至 A 时，实际配置为 B 的比例'), rate(assignment, '分配至 B 时，实际配置为 B 的比例')];
    const firstValue = element('strong', cls('headline'));
    assignment.append(element('p', cls('caption'), 'First Stage'), firstValue,
      formula(String.raw`\mathbb E_P[D\mid Z=1]-\mathbb E_P[D\mid Z=0]=p_C-p_F`));

    const identification = section('04 识别条件');
    const conditionBox = element('div', cls('card'));
    function condition(title, note) {
      const row = element('div', cls('condition')); const status = element('span');
      const text = element('div'); text.append(element('strong', null, title), element('p', cls('note'), note));
      row.append(text, status); conditionBox.append(row); return status;
    }
    const randomStatus = condition('随机分配', 'Z 独立于潜在结果和潜在处理状态；两个分配组均有正概率。');
    const relevantStatus = condition('相关性（Relevance）', '分配能够改变实际处理概率，即 First Stage 不为零。');
    const monotonicity = createToggleControl({ label: '单调性（Monotonicity）', checked: state.shares[3] === 0 });
    monotonicity.wrapper.classList.add(cls('monotonicity'));
    const monotonicityRow = element('div', cls('condition'));
    const monotonicityText = element('div');
    monotonicityText.append(monotonicity.wrapper, element('p', cls('note'), '勾选时反向依从者占比固定为 0；取消后恢复上次的非零占比，首次为 15%。其他类型按比例调整。'));
    monotonicityRow.append(monotonicityText); conditionBox.append(monotonicityRow);
    on(monotonicity.input, 'change', () => {
      activeScenario = -1;
      if (monotonicity.input.checked && state.shares[3] > EPS) lastDefierShare = state.shares[3];
      setShare(3, monotonicity.input.checked ? 0 : lastDefierShare, false);
      update();
    });
    const exclusion = createToggleControl({ label: '排除限制（Exclusion Restriction）', checked: true });
    exclusion.wrapper.classList.add(cls('exclusion'));
    on(exclusion.input, 'change', () => {
      activeScenario = -1; state.exclusion = exclusion.input.checked;
      const bounds = gammaBounds(state);
      state.gamma = state.exclusion ? 0 : clamp(0.03, bounds.min, bounds.max); update();
    });
    const directPanel = element('div', cls('direct'));
    const direct = control('分配至 B 对留存率的额外直接效应', -10, 10, 3, (v) => pp(v / 100), (value) => { state.gamma = value / 100; });
    const directMath = math('');
    const directFormula = element('p', cls('formula')); directFormula.append(directMath);
    directFormula.title = 'T 表示潜在依从类型；直接效应在所有类型中相同。';
    directPanel.append(direct.wrapper, directFormula);
    const exclusionNote = element('p', cls('note'), '随机分配仅通过实际配置影响 D1 留存。');
    conditionBox.append(exclusion.wrapper, exclusionNote, directPanel); identification.append(conditionBox);

    const estimands = section('05 不同因果参数的比较');
    const metrics = element('div', cls('metrics'));
    const metricValues = ['ATE', 'ATT', 'ITT', 'CACE'].map((name, i) => {
      const card = element('div', cls('metric')); const value = element('strong');
      card.append(element('span', null, name), value, element('small', cls('note'), ['目标人群平均处理效应', '已处理者平均处理效应', '意向性治疗效应', '依从者平均处理效应'][i]));
      metrics.append(card); return value;
    });
    estimands.append(metrics, element('h5', cls('subheading'), '各参数所对应的人群构成'));
    const mixes = [mix(estimands, 'ATE'), mix(estimands, 'ATT'), mix(estimands, 'CACE')];
    const legend = element('div', cls('legend')); types.forEach((_, i) => legend.append(dotLabel(i))); estimands.append(legend);

    const waldSection = section('06 ITT 与 Wald 比值');
    const observed = element('div', cls('metrics'));
    const assignedValues = ['原分配 A 组留存率', '原分配 B 组留存率'].map((label) => {
      const cell = element('div', cls('observed')); const value = element('strong'); cell.append(element('span', cls('note'), label), value); observed.append(cell); return value;
    });
    waldSection.append(observed, formula(String.raw`\tau_{P,\mathrm{ITT}}=\mathbb E_P[Y^{\mathrm{obs}}\mid Z=1]-\mathbb E_P[Y^{\mathrm{obs}}\mid Z=0]`));
    const waldBox = element('div', cls('wald'));
    const ratio = math(''); const ratioLine = element('p', cls('formula')); ratioLine.append(ratio);
    const waldValue = element('strong', cls('headline')); const waldStatus = element('p', cls('wald-status'));
    waldBox.append(element('span', cls('caption'), 'Wald Ratio'), ratioLine, waldValue, waldStatus);
    waldSection.append(waldBox, formula(String.raw`\tau_{P,\mathrm{ITT}}=p_C\tau_C-p_F\tau_F+\gamma`));
    const contributions = element('dl', cls('contributions'));
    const contributionValues = ['依从者的效应贡献', '反向依从者的效应贡献', '分配的直接效应', 'ITT'].map((label) => {
      const value = element('dd'); contributions.append(element('dt', null, label), value); return value;
    });
    waldSection.append(contributions);

    const comparison = section('07 因果效应与朴素组间比较');
    comparison.append(formula(String.raw`\Delta_D=\mathbb E_P[Y^{\mathrm{obs}}\mid D=1]-\mathbb E_P[Y^{\mathrm{obs}}\mid D=0]`));
    const chart = svgNode('svg', { viewBox: '0 0 620 430', role: 'img', class: cls('comparison') });
    const ticks = [-1, -0.5, 0, 0.5, 1].map((fraction) => {
      const x = 332 + fraction * 137;
      chart.append(svgNode('line', { x1: x, x2: x, y1: 16, y2: 378, class: cls(fraction === 0 ? 'zero-line' : 'gridline') }));
      return { fraction, label: svgText(chart, x, 404, '') };
    });
    svgText(chart, 332, 428, '效应值（pp）');
    const compareNames = ['ATE', 'ATT', 'ITT', 'CACE', 'Wald 比值', '朴素均值差'];
    const compareBars = compareNames.map((label, i) => {
      const y = 28 + i * 58;
      const text = svgText(chart, 10, y + 25, label); text.setAttribute('text-anchor', 'start');
      const bar = svgNode('rect', { y, height: 38, rx: 5, class: cls(`compare-${i}`) }); chart.append(bar);
      const value = svgText(chart, 610, y + 25, '', cls('compare-value')); value.setAttribute('text-anchor', 'end');
      return { bar, value };
    });
    const differences = element('div', cls('metrics'));
    const differenceValues = ['朴素均值差 − ATT', 'Wald 比值 − CACE'].map((label) => {
      const cell = element('div', cls('observed')); const value = element('strong'); cell.append(element('span', cls('note'), label), value); differences.append(cell); return value;
    });
    comparison.append(chart, differences);

    const presets = section('08 预设实验情景');
    const presetList = element('div', cls('presets'));
    const presetButtons = scenarios.map((scenario, i) => {
      const button = createButton('', cls('preset')); const text = element('span');
      text.append(element('strong', null, scenario.title), element('small', cls('note'), scenario.note));
      button.append(text, element('span', null, '›'));
      on(button, 'click', () => {
        state = initialState(); state.shares = [...scenario.shares]; state.exclusion = !scenario.gamma; state.gamma = scenario.gamma ?? 0;
        activeScenario = i; update();
      });
      presetList.append(button); return button;
    });
    const interpretation = element('p', cls('interpretation'));
    interpretation.setAttribute('role', 'status'); interpretation.setAttribute('aria-live', 'polite');
    const reset = createButton('↶ 重置演示', cls('reset'));
    on(reset, 'click', () => { state = initialState(config.parameters); lastDefierShare = state.shares[3] > EPS ? state.shares[3] : 0.15; activeScenario = -1; update(); });
    presets.append(presetList, interpretation, reset, element('p', cls('note'), '本演示采用超总体概率模型，所有结果由设定的类型占比、平均潜在留存率和效应直接计算，不是实际实验观测或随机模拟。模型中的类型与反事实信息可用于计算真实效应；一次真实实验通常不能完整观测这些信息。'));

    function status(node, valid) {
      node.textContent = valid ? '✓' : '✕'; node.dataset.valid = String(valid);
      node.setAttribute('aria-label', valid ? '满足条件' : '不满足条件');
    }
    function updateFlow(result) {
      const q = state.assignment;
      const sourceCursor = [(1 - q) * -30, q * -30];
      const destinationCursor = result.totals.map((mass) => mass * -30);
      const flowDescriptions = [];
      types.forEach((type, i) => {
        const p = state.shares[i]; let typeCursor = -30 * p;
        for (const z of [0, 1]) {
          const mass = p * (z ? q : 1 - q); const d = type.d[z]; const width = mass * 60;
          const start = 177 + z * 260 + sourceCursor[z] + width / 2;
          const middle = 95 + i * 130 + typeCursor + width / 2;
          const end = 177 + d * 260 + destinationCursor[d] + width / 2;
          const [left, right] = connections[i][z];
          left.setAttribute('d', `M138 ${start} C185 ${start} 195 ${middle} 240 ${middle}`);
          right.setAttribute('d', `M380 ${middle} C430 ${middle} 435 ${end} 482 ${end}`);
          [left, right].forEach((path) => path.setAttribute('stroke-width', String(width)));
          sourceCursor[z] += width; destinationCursor[d] += width; typeCursor += width;
          flowDescriptions.push(`Z=${z} 经${type.name}进入 D=${d}，占总体 ${percent(mass)}`);
        }
        typeValues[i].textContent = percent(p);
      });
      sourceValues[0].textContent = percent(1 - q); sourceValues[1].textContent = percent(q);
      destinationValues.forEach((node, i) => { node.textContent = percent(result.totals[i]); });
      flow.setAttribute('aria-label', flowDescriptions.join('；'));
    }
    function update() {
      const result = calculate(state);
      state.shares.forEach((share, i) => { sync(shares[i], share * 100); });
      syncMix(populationMix, state.shares);
      const gammaMin = Math.min(0, state.gamma); const gammaMax = Math.max(0, state.gamma);
      outcomeCards.forEach((card, i) => {
        const baseline = state.baseline[i]; const effect = state.effects[i];
        effectValue(card.effect, effect);
        const minB = -Math.min(0, effect) - gammaMin; const maxB = 1 - Math.max(0, effect) - gammaMax;
        const minT = Math.max(-0.3, -baseline - gammaMin); const maxT = Math.min(0.3, 1 - baseline - gammaMax);
        sync(card.baseline, baseline * 100, undefined, minB * 100, maxB * 100);
        sync(card.treatment, effect * 100, (v) => pp(v / 100), minT * 100, maxT * 100);
        syncRate(card.a, baseline); syncRate(card.b, baseline + effect);
      });
      sync(allocation, state.assignment * 100); updateFlow(result);
      firstRates.forEach((view, i) => syncRate(view, result.firstRates[i])); effectValue(firstValue, result.firstStage);
      status(randomStatus, true); status(relevantStatus, Math.abs(result.firstStage) > EPS);
      monotonicity.input.checked = state.shares[3] === 0;
      shares[3].input.disabled = monotonicity.input.checked;
      if (state.shares[3] > EPS) lastDefierShare = state.shares[3];
      exclusion.input.checked = state.exclusion; directPanel.hidden = state.exclusion;
      const bounds = gammaBounds(state);
      sync(direct, state.gamma * 100, (v) => pp(v / 100), bounds.min * 100, bounds.max * 100);
      const gammaText = state.gamma.toFixed(3);
      directSource = String.raw`\mathbb E[Y^{\mathrm{assign}}(z)\mid T]=\mathbb E[Y(D(z))\mid T]+z\times ${state.gamma < 0 ? `(${gammaText})` : gammaText}`;
      if (!mathRequested) directMath.textContent = `\\(${directSource}\\)`;
      else void renderDirect();
      [result.ate, result.att, result.itt, result.cace].forEach((value, i) => effectValue(metricValues[i], value));
      syncMix(mixes[0], state.shares); syncMix(mixes[1], result.attWeights);
      syncMix(mixes[2], result.cace === null ? null : [1, 0, 0, 0], '无依从者，CACE 未定义。');
      assignedValues.forEach((node, i) => { node.textContent = percent(result.assignedRates[i], 2); });
      effectValue(waldValue, result.wald);
      const reasons = [];
      if (Math.abs(result.firstStage) <= EPS) reasons.push('First Stage 为零，Wald 比值未定义');
      if (state.shares[3] >= EPS) reasons.push('存在反向依从者，单调性不成立');
      if (Math.abs(state.gamma) >= EPS) reasons.push('存在分配直接效应，排除限制不成立');
      if (result.cace === null) reasons.push('无依从者，CACE 未定义');
      waldStatus.textContent = result.identified ? '✓ 满足 CACE 识别条件' : reasons.join('；');
      waldStatus.dataset.valid = String(result.identified);
      ratioSource = result.wald === null ? String.raw`\mathrm{First\ Stage}=0\quad\Rightarrow\quad\mathrm{Wald}\text{ undefined}`
        : String.raw`\frac{\mathrm{ITT}}{\mathbb E_P[D\mid Z=1]-\mathbb E_P[D\mid Z=0]}=\frac{${result.itt.toFixed(4)}}{${result.firstStage.toFixed(4)}}`;
      if (!mathRequested) ratio.textContent = `\\(${ratioSource}\\)`;
      else void renderRatio();
      [state.shares[0] * state.effects[0], -state.shares[3] * state.effects[3], state.gamma, result.itt]
        .forEach((value, i) => { contributionValues[i].textContent = pp(value); });
      const values = [result.ate, result.att, result.itt, result.cace, result.wald, result.naive];
      const extent = Math.max(10, Math.ceil(Math.max(...values.filter((v) => v !== null).map((v) => Math.abs(v) * 100)) / 5) * 5);
      ticks.forEach(({ fraction, label }) => { label.textContent = String(Number((fraction * extent).toFixed(1))); });
      compareBars.forEach(({ bar, value }, i) => {
        const width = values[i] === null ? 0 : Math.abs(values[i]) * 100 / extent * 137;
        bar.setAttribute('x', String(values[i] < 0 ? 332 - width : 332)); bar.setAttribute('width', String(width)); value.textContent = pp(values[i]);
      });
      chart.setAttribute('aria-label', compareNames.map((name, i) => `${name} ${pp(values[i])}`).join('，'));
      const bias = result.naive === null || result.att === null ? null : result.naive - result.att;
      const waldGap = result.wald === null || result.cace === null ? null : result.wald - result.cace;
      differenceValues[0].textContent = pp(bias); differenceValues[1].textContent = pp(waldGap);
      presetButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(activeScenario === i)));
      interpretation.textContent = `目标人群 ATE 为 ${pp(result.ate)}，实际接受 B 的人群 ATT 为 ${pp(result.att)}，按原分配比较的 ITT 为 ${pp(result.itt)}。`
        + (result.identified ? `Wald 比值识别依从者效应 ${pp(result.cace)}。` : '此时不能按通常的识别结论把 Wald 比值解释为 CACE。')
        + '图中的真实效应来自模型设定，不能仅凭一次实验还原每人的反事实或依从类型。';
    }
    async function renderRatio() {
      if (!mathReady || rendering || controller.signal.aborted || renderedSource === ratioSource) return;
      rendering = true; const source = ratioSource;
      try {
        const output = await window.MathJax.tex2svgPromise(source, { display: false });
        if (controller.signal.aborted || source !== ratioSource) return;
        window.MathJax.typesetClear?.([ratio]); ratio.replaceChildren(output); renderedSource = source;
        document.dispatchEvent(new CustomEvent('site:layout-change'));
      } catch { /* Keep the previous rendered formula when conversion fails. */ }
      finally { rendering = false; if (!controller.signal.aborted && source !== ratioSource) void renderRatio(); }
    }
    async function renderDirect() {
      if (!mathReady || directRendering || controller.signal.aborted || renderedDirectSource === directSource) return;
      directRendering = true; const source = directSource;
      try {
        const output = await window.MathJax.tex2svgPromise(source, { display: false });
        if (controller.signal.aborted || source !== directSource) return;
        window.MathJax.typesetClear?.([directMath]); directMath.replaceChildren(output); renderedDirectSource = source;
        document.dispatchEvent(new CustomEvent('site:layout-change'));
      } catch { /* Keep the previous rendered formula when conversion fails. */ }
      finally { directRendering = false; if (!controller.signal.aborted && source !== directSource) void renderDirect(); }
    }
    function typeset() {
      if (mathRequested || !window.siteMathJax || controller.signal.aborted) return;
      mathRequested = true; const source = ratioSource; const initialDirectSource = directSource;
      void window.siteMathJax.typeset(content).then(() => {
        if (controller.signal.aborted) { window.MathJax?.typesetClear?.([content]); return; }
        mathReady = true; renderedSource = source; renderedDirectSource = initialDirectSource;
        void renderRatio(); void renderDirect();
      }).catch(() => { mathRequested = false; });
    }
    update(); on(document, 'site:layout-change', typeset); typeset();
    return () => { controller.abort(); window.MathJax?.typesetClear?.([content]); };
  },
};
