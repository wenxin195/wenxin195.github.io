import { createButton, createRangeControl, createSelectControl, createShell, element } from '@/features/components/shared.js';

const cls = (name) => `two-randomness__${name}`;
const colors = ['#9da8b8', '#37958a', '#ca797c', '#557faf'];
const names = ['两方案均不留存', '仅方案 B 留存', '仅方案 A 留存', '两方案均留存'];
const defaults = { probabilities: [0.4, 0.2, 0.1, 0.3], size: 200, allocation: 0.5 };
const percent = (v) => `${(v * 100).toFixed(1)}%`;
const pp = (v) => `${v > 1e-10 ? '+' : ''}${(Math.abs(v) < 1e-10 ? 0 : v * 100).toFixed(2)} pp`;
const sdText = (v) => `${(Math.sqrt(Math.max(0, v)) * 100).toFixed(2)} pp`;
const total = (values) => values.reduce((sum, v) => sum + v, 0);
const initialState = (p = {}) => ({ probabilities: [...(p.probabilities ?? defaults.probabilities)], size: p.size ?? 200, allocation: p.allocation ?? 0.5 });
function theoretical(state) {
  const [, p01, p10, p11] = state.probabilities;
  const mu0 = p10 + p11, mu1 = p01 + p11, tau = p01 - p10;
  const variance = Math.max(0, p01 + p10 - tau * tau);
  const n1 = Math.max(1, Math.min(state.size - 1, Math.round(state.size * state.allocation)));
  const n0 = state.size - n1;
  const sampling = variance / state.size;
  const overall = mu1 * (1 - mu1) / n1 + mu0 * (1 - mu0) / n0;
  return { tau, variance, n1, n0, sampling, overall, randomization: Math.max(0, overall - sampling) };
}
function drawSample(state) {
  const users = new Uint8Array(state.size), counts = [0, 0, 0, 0];
  const p = state.probabilities, c0 = p[0], c1 = c0 + p[1], c2 = c1 + p[2];
  for (let i = 0; i < users.length; i++) {
    const u = Math.random(), type = u < c0 ? 0 : u < c1 ? 1 : u < c2 ? 2 : 3;
    users[i] = type; counts[type]++;
  }
  const mu0 = (counts[2] + counts[3]) / state.size, mu1 = (counts[1] + counts[3]) / state.size;
  const tau = (counts[1] - counts[2]) / state.size;
  const factor = state.size / (state.size - 1);
  return { users, counts, tau, s0: factor * mu0 * (1 - mu0), s1: factor * mu1 * (1 - mu1),
    sTau: factor * Math.max(0, (counts[1] + counts[2]) / state.size - tau * tau) };
}
function assign(sample, n1) {
  let remaining = n1, retained1 = 0, retained0 = 0;
  const N = sample.users.length;
  // Sequential selection with remaining seats gives every fixed-size assignment
  // the same probability. Outcomes are read from actual sampled individuals.
  for (let i = 0; i < N; i++) {
    const type = sample.users[i];
    if (Math.random() < remaining / (N - i)) { remaining--; retained1 += type % 2; }
    else retained0 += type >= 2 ? 1 : 0;
  }
  const rate1 = retained1 / n1, rate0 = retained0 / (N - n1);
  return { retained1, retained0, rate1, rate0, estimate: rate1 - rate0 };
}
function conditionalVariance(sample, theory) {
  return Math.max(0, sample.s1 / theory.n1 + sample.s0 / theory.n0 - sample.sTau / sample.users.length);
}
function math(source) {
  const node = element('span', cls('math'), `\\(${source}\\)`); node.dataset.componentMath = 'true'; return node;
}
function formula(source) { const node = element('p', cls('formula')); node.append(math(source)); return node; }
function svgNode(tag, attributes = {}, text) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  if (text !== undefined) node.textContent = text; return node;
}
function svgText(parent, x, y, text, className = '') {
  const node = svgNode('text', { x, y, 'text-anchor': 'middle', class: className }, text); parent.append(node); return node;
}
function graphic(viewBox) { return svgNode('svg', { viewBox, role: 'img', class: cls('graphic') }); }
function setText(node, value) {
  const text = String(value);
  if (node.textContent === text) return;
  if (node.childNodes.length === 1 && node.firstChild.nodeType === Node.TEXT_NODE) node.firstChild.data = text;
  else node.textContent = text;
}

export const twoRandomnessModel = {
  validate(config) {
    const state = initialState(config.parameters), p = state.probabilities;
    if (p.length !== 4 || !p.every((v) => Number.isFinite(v) && v >= 0 && v <= 1) || Math.abs(total(p) - 1) > 1e-10
      || !Number.isInteger(state.size) || state.size < 20 || state.size > 5000
      || !Number.isFinite(state.allocation) || state.allocation < 0.05 || state.allocation > 0.95) {
      throw new Error('四类概率须合计为 1，样本量为 20–5000 的整数，分配比例在 5%–95% 之间。');
    }
  },
  mount(root, config) {
    const content = createShell(root, config); content.classList.add('two-randomness');
    const controller = new AbortController();
    const on = (node, event, handler) => node.addEventListener(event, handler, { signal: controller.signal });
    let state = initialState(config.parameters), sample, experiment, sampleId = 0, assignmentId = 0;
    let results = null, job = null, frame = 0, hiddenPaused = false, mathRequested = false;
    function section(title) {
      const node = element('section', cls('section')); node.append(element('h4', cls('heading'), title)); content.append(node); return node;
    }
    function button(label, action, primary = false) {
      const node = createButton(label, `${cls('button')}${primary ? ` ${cls('primary')}` : ''}`); on(node, 'click', action); return node;
    }
    function range(label, min, max, value, format, handler, step = 'any') {
      const node = createRangeControl({ label, min, max, value, format, step }); node.wrapper.classList.add(cls('control'));
      on(node.input, 'input', () => { handler(Number(node.input.value)); resample('参数已改变，重新抽样并清空重复实验结果。'); }); return node;
    }
    function cards(parent, labels, formulas = []) {
      const grid = element('div', cls('cards')); grid.style.setProperty('--tr-columns', String(labels.length));
      const values = labels.map((label, i) => {
        const cell = element('div', cls('card')), value = element('strong'); cell.append(element('span', cls('note'), label), value);
        if (formulas[i]) cell.append(math(formulas[i])); grid.append(cell); return value;
      }); parent.append(grid); return values;
    }
    function mix(parent) {
      const track = element('div', cls('mix')); track.setAttribute('role', 'img');
      const segments = names.map((_, i) => { const node = element('span'); node.dataset.type = String(i); track.append(node); return node; });
      parent.append(track); return { track, segments };
    }
    function syncMix(view, proportions) {
      view.segments.forEach((node, i) => { node.style.width = `${proportions[i] * 100}%`; node.textContent = proportions[i] >= 0.08 ? percent(proportions[i]) : ''; });
      view.track.setAttribute('aria-label', names.map((name, i) => `${name} ${percent(proportions[i])}`).join('，'));
    }
    function table(parent, headings, rows) {
      const wrap = element('div', cls('table-wrap')), node = element('table', cls('table'));
      const head = element('thead'), tr = element('tr');
      headings.forEach((label) => { const th = element('th'); th.scope = 'col'; th.append(label); tr.append(th); });
      head.append(tr); const body = element('tbody'); const cells = rows.map((values) => {
        const row = element('tr'); const nodes = values.map((value, i) => { const cell = element(i === 0 ? 'th' : 'td'); if (i === 0) cell.scope = 'row'; cell.append(String(value)); row.append(cell); return cell; });
        body.append(row); return nodes;
      }); node.append(head, body); wrap.append(node); parent.append(wrap); return cells;
    }

    const population = section('01 超总体：设定目标人群分布 P');
    const probabilityControls = names.map((name, i) => {
      const node = range(`${['p₀₀', 'p₀₁', 'p₁₀', 'p₁₁'][i]} · ${name}`, 0, 100, state.probabilities[i] * 100, (v) => percent(v / 100), (v) => {
        const value = v / 100, remainder = total(state.probabilities.filter((_, j) => j !== i));
        state.probabilities = state.probabilities.map((p, j) => j === i ? value : remainder > 0 ? p / remainder * (1 - value) : (1 - value) / 3);
      });
      const label = node.wrapper.querySelector('.interactive-component__control-label'); label.replaceChildren(math(`p_{${['00', '01', '10', '11'][i]}}`), document.createTextNode(` · ${name}`));
      node.wrapper.dataset.type = String(i); population.append(node.wrapper); return node;
    });
    population.append(element('p', cls('note'), '改变一个概率时，其余三项按原比例分配剩余概率；其余三项均为零时平均分配。'));
    const populationMix = mix(population);
    const probabilityCells = table(population, ['潜在结果', math('Y(0)'), math('Y(1)'), math(String.raw`\tau`), '概率'],
      names.map((name, i) => [name, i >= 2 ? 1 : 0, i % 2, [0, 1, -1, 0][i], '']));
    const populationValues = cards(population, ['超总体平均处理效应', '个体处理效应方差'], [String.raw`\tau_P=\mathbb E_P[Y(1)-Y(0)]`, String.raw`\operatorname{Var}_P(\tau)`]);
    populationValues[0].dataset.stage = '0';

    const stages = section('02 两阶段实验过程');
    const size = range('有限总体样本量 N', Math.log(20), Math.log(5000), Math.log(state.size), (v) => String(Math.round(Math.exp(v))), (v) => { state.size = Math.round(Math.exp(v)); });
    stages.append(size.wrapper, element('p', cls('scale'), '20　 ·　 200　 ·　 5,000（对数尺度）'));
    const allocation = range('实验组分配比例 N₁ / N', 5, 95, state.allocation * 100, (v) => percent(v / 100), (v) => { state.allocation = v / 100; }, 1);
    stages.append(allocation.wrapper);
    const flow = element('div', cls('flow'));
    const flowValues = ['超总体 P', '有限总体', '本次估计值'].map((label, i) => {
      const box = element('div', cls('flow-box')); box.dataset.stage = String(i);
      const title = element('span', cls('flow-title'), label), value = element('strong'); box.append(title, value); flow.append(box);
      if (i < 2) flow.append(element('div', cls('arrow'), i === 0 ? '↓ 独立同分布抽样' : '↓ 完全随机分配'));
      return { title, value };
    }); stages.append(flow);
    const actions = element('div', cls('actions'));
    actions.append(button('重新抽取 N 名用户', () => resample('已重新抽样并分配；之前的重复实验结果已清空。'), true),
      button('仅重新随机分配', () => { stopJob(); experiment = assign(sample, theoretical(state).n1); assignmentId++; updateCurrent(); }));
    stages.append(actions, element('p', cls('note'), '重新抽样会更换这批用户及潜在结果，并执行一次新分配、清空模拟结果；仅重新分配保留当前用户及其全部潜在结果，已有分布结果保留。'));
    const sampleHeading = element('div', cls('sample-heading')); const sampleBadge = element('small');
    sampleHeading.append(math(String.raw`\text{当前有限总体 }\mathcal U_N`), sampleBadge); stages.append(sampleHeading);
    const dots = element('canvas', cls('dots')); dots.width = 800; dots.setAttribute('role', 'img'); stages.append(dots);
    stages.append(element('p', cls('note'), '每个方块代表一名抽得的用户，颜色代表潜在结果类型。'));
    const legend = element('div', cls('legend')); names.forEach((name, i) => { const node = element('span', null, name); node.dataset.type = String(i); legend.append(node); }); stages.append(legend);
    const sampleMix = mix(stages);
    const sampleCells = table(stages, ['潜在结果类型', '有限总体人数', '样本占比', '总体概率'], names.map((name) => [name, '', '', '']));

    const current = section('03 本次实验的三个效应值');
    const effectValues = cards(current, ['总体效应', '有限总体效应', '观测均值差'], [String.raw`\tau_P`, String.raw`\tau_N`, String.raw`\widehat\tau_N`]);
    const groupRates = ['方案 A · 对照组', '方案 B · 实验组'].map((label, i) => {
      const row = element('div', cls('rate')), title = element('span'), value = element('strong'), track = element('div', cls('track')), fill = element('span'), detail = element('small', cls('note'));
      title.textContent = label; fill.dataset.type = String(i ? 3 : 0); track.append(fill); track.setAttribute('aria-hidden', 'true');
      row.append(title, value, track, detail); current.append(row); return { title, value, fill, detail, label };
    });
    const points = graphic('0 0 620 255');
    const pointTicks = [-1, -0.5, 0, 0.5, 1].map((fraction) => {
      const x = 65 + (fraction + 1) * 250; points.append(svgNode('line', { x1: x, x2: x, y1: 25, y2: 205, class: cls(fraction === 0 ? 'zero' : 'grid') }));
      return { fraction, label: svgText(points, x, 232, '') };
    });
    const pointViews = [0, 1, 2].map((i) => {
      const guide = svgNode('line', { y2: 205, class: cls('point-guide') }), dot = svgNode('circle', { r: 7, cy: 60 + i * 58, class: cls('point') });
      guide.dataset.stage = dot.dataset.stage = String(i); points.append(guide, dot);
      const value = svgText(points, 0, 40 + i * 58, '', cls('point-value')); value.dataset.stage = String(i); return { guide, dot, value };
    }); current.append(points, formula(String.raw`\widehat\tau_N-\tau_P=(\widehat\tau_N-\tau_N)+(\tau_N-\tau_P)`));
    const errors = cards(current, ['总偏离', '处理分配带来的偏离', '抽样带来的差异']);
    errors[1].dataset.stage = '2'; errors[2].dataset.stage = '1';

    const repeated = section('04 重复实验：分离两种随机性');
    const repetitions = createSelectControl({ label: '重复实验次数', value: '1000', options: [100, 1000, 5000].map((n) => ({ value: n, label: `${n.toLocaleString()} 次` })) }); repeated.append(repetitions.wrapper);
    const batchActions = element('div', cls('actions'));
    const runBoth = button('运行两层随机性模拟', () => startJob('both'), true);
    const runFixed = button('固定当前样本，仅重复分配', () => startJob('fixed'));
    const clear = button('清空结果', () => clearResults('已清空重复实验结果，当前样本与本次分配保留。'));
    batchActions.append(runBoth, runFixed, clear); repeated.append(batchActions);
    const progress = element('p', `${cls('note')} ${cls('progress')}`); progress.setAttribute('role', 'status'); repeated.append(progress);
    function setProgress(message) {
      setText(progress, message);
      progress.title = message;
    }
    const distributionNames = ['抽样分布', '随机化分布', '总体误差分布'];
    const distributionMath = [String.raw`\tau_N-\tau_P`, String.raw`\widehat\tau_N-\tau_N`, String.raw`\widehat\tau_N-\tau_P`];
    const histograms = distributionNames.map((title, i) => {
      const box = element('div', cls('distribution')); box.dataset.stage = String(i === 0 ? 1 : i === 1 ? 2 : 0);
      const heading = element('h5', cls('subheading')); heading.append(title + '：', math(distributionMath[i]));
      const note = element('p', cls('note')), plot = graphic('0 0 620 260');
      const stats = element('div'); box.append(heading, note, plot, stats); const values = cards(stats, ['模拟均值', '模拟标准差', '理论标准差']);
      repeated.append(box); return { note, plot, values };
    });
    repeated.append(formula(String.raw`\operatorname{Var}_Z(\widehat\tau_N\mid\mathcal U_N)=\frac{S_1^2}{N_1}+\frac{S_0^2}{N_0}-\frac{S_\tau^2}{N}`),
      element('p', cls('note'), '两层模拟的随机化理论方差是上式对独立抽样的期望；固定样本时则使用当前有限总体的 S²。总误差方差在两层模式下等于抽样方差与平均随机化方差之和。S² 使用 N−1 作分母。'));

    const sizeSection = section('05 样本量与抽样方差的关系');
    sizeSection.append(formula(String.raw`\operatorname{Var}_P(\tau_N)=\operatorname{Var}_P(\tau)/N`));
    const curve = graphic('0 0 620 305');
    const curveGrid = [0, 1, 2, 3, 4].map((i) => { const y = 230 - i * 48; curve.append(svgNode('line', { x1: 70, x2: 570, y1: y, y2: y, class: cls('grid') })); return svgText(curve, 40, y + 5, ''); });
    const logX = (N) => 70 + Math.log(N / 20) / Math.log(250) * 500;
    [20, 100, 500, 2000, 5000].forEach((N) => svgText(curve, logX(N), 260, String(N)));
    svgText(curve, 320, 296, '样本量 N（对数尺度）'); svgText(curve, 160, 20, '抽样标准差（pp）');
    const curveLine = svgNode('path', { class: cls('curve') }), sizeGuide = svgNode('line', { y2: 230, class: cls('point-guide') }), sizePoint = svgNode('circle', { r: 7, class: cls('point') });
    sizeGuide.dataset.stage = sizePoint.dataset.stage = '0'; curve.append(curveLine, sizeGuide, sizePoint); sizeSection.append(curve);
    const sizeValues = cards(sizeSection, ['当前样本量', '理论抽样标准差']);
    sizeValues[1].dataset.stage = '1';

    const presetsSection = section('06 预设情景');
    const presets = [
      { title: '小样本实验', note: 'N = 20，观察两层随机性产生的波动', size: 20 },
      { title: '大样本实验', note: 'N = 5,000，观察误差分布的收敛', size: 5000 },
      { title: '零平均效应，高度异质性', note: 'τₚ = 0，Var(τ) = 1；均衡分配时分配偏离恰为零', probabilities: [0, 0.5, 0.5, 0] },
      { title: '不存在个体处理效应', note: 'τₚ = 0，Var(τ) = 0；随机分配偏离仍可存在', probabilities: [0.5, 0, 0, 0.5] },
      { title: '不均衡的处理分配', note: '实验组占比 10%，观察随机化误差', allocation: 0.1 },
    ];
    presets.forEach((preset) => {
      const node = button('', () => { state = initialState(preset); resample('已应用预设并重新抽样、分配，重复实验结果已清空。'); });
      node.classList.add(cls('preset')); node.append(element('strong', null, preset.title), element('small', cls('note'), preset.note)); presetsSection.append(node);
    });
    presetsSection.append(button('重置演示', () => { state = initialState(config.parameters); sampleId = 0; repetitions.input.value = '1000'; resample('已重置为初始参数，并重新抽样、分配。'); }),
      element('p', cls('note'), '研究单位从超总体独立同分布抽取，随后执行固定组容量的完全随机分配。每次模拟均实际生成 N 名用户的潜在结果类型并分配，未使用正态近似。潜在结果概率和样本量是演示参数；真实实验通常不能同时观测每人的两个潜在结果。'));

    function drawDots() {
      dots.height = Math.max(24, Math.ceil(state.size / 100) * 8);
      const ctx = dots.getContext('2d');
      if (!ctx) return;
      sample.users.forEach((type, i) => { ctx.fillStyle = colors[type]; ctx.fillRect((i % 100) * 8, Math.floor(i / 100) * 8, 6, 6); });
      dots.setAttribute('aria-label', `当前 ${state.size} 名用户：${names.map((name, i) => `${name} ${sample.counts[i]} 人`).join('，')}`);
    }
    function updateCurrent() {
      const theory = theoretical(state), estimate = experiment.estimate;
      probabilityControls.forEach((control, i) => { control.input.value = String(state.probabilities[i] * 100); control.output.value = percent(state.probabilities[i]); probabilityCells[i][4].textContent = percent(state.probabilities[i]); });
      syncMix(populationMix, state.probabilities); populationValues[0].textContent = pp(theory.tau); populationValues[1].textContent = theory.variance.toFixed(4);
      size.input.value = String(Math.log(state.size)); size.output.value = String(state.size);
      allocation.input.value = String(state.allocation * 100); allocation.output.value = `${percent(theory.n1 / state.size)}（N₁ = ${theory.n1}）`;
      flowValues[0].value.textContent = pp(theory.tau); flowValues[1].title.textContent = `有限总体 · N = ${state.size}`;
      flowValues[1].value.textContent = pp(sample.tau); flowValues[2].title.textContent = `本次估计值 · 分配 #${assignmentId}`; flowValues[2].value.textContent = pp(estimate);
      sampleBadge.textContent = `样本 #${sampleId}`;
      syncMix(sampleMix, sample.counts.map((n) => n / state.size));
      sample.counts.forEach((n, i) => { sampleCells[i][1].textContent = String(n); sampleCells[i][2].textContent = percent(n / state.size); sampleCells[i][3].textContent = percent(state.probabilities[i]); });
      [theory.tau, sample.tau, estimate].forEach((value, i) => { effectValues[i].textContent = pp(value); effectValues[i].dataset.stage = String(i); });
      const rates = [experiment.rate0, experiment.rate1], retained = [experiment.retained0, experiment.retained1], sizes = [theory.n0, theory.n1];
      groupRates.forEach((view, i) => { view.title.textContent = `${view.label} · N = ${sizes[i]}`; view.value.textContent = percent(rates[i]); view.fill.style.width = `${rates[i] * 100}%`; view.detail.textContent = `留存 ${retained[i]} 人 / ${sizes[i]} 人`; });
      const values = [theory.tau, sample.tau, estimate], extent = Math.max(0.05, Math.ceil(Math.max(...values.map(Math.abs)) * 100 / 5) * 0.05);
      pointTicks.forEach(({ fraction, label }) => { label.textContent = (fraction * extent * 100).toFixed(1); });
      pointViews.forEach(({ dot, guide, value }, i) => {
        const x = 315 + values[i] / extent * 250; dot.setAttribute('cx', String(x));
        for (const [name, v] of Object.entries({ x1: x, x2: x, y1: 60 + i * 58 })) guide.setAttribute(name, String(v));
        value.setAttribute('x', String(x)); value.setAttribute('text-anchor', x < 160 ? 'start' : x > 470 ? 'end' : 'middle'); value.textContent = `${['τₚ', 'τₙ', 'τ̂ₙ'][i]} = ${pp(values[i])}`;
      }); points.setAttribute('aria-label', `超总体效应 ${pp(theory.tau)}，有限总体效应 ${pp(sample.tau)}，估计值 ${pp(estimate)}`);
      [estimate - theory.tau, estimate - sample.tau, sample.tau - theory.tau].forEach((v, i) => { errors[i].textContent = pp(v); });
      const maxSD = Math.max(1, Math.sqrt(theory.variance / 20) * 100 * 1.1), curveY = (N) => 230 - Math.sqrt(theory.variance / N) * 100 / maxSD * 192;
      curveGrid.forEach((node, i) => { node.textContent = (maxSD * i / 4).toFixed(1); });
      let path = ''; for (let i = 0; i <= 100; i++) { const N = 20 * Math.pow(250, i / 100); path += `${i ? 'L' : 'M'}${logX(N)} ${curveY(N)} `; }
      curveLine.setAttribute('d', path); const x = logX(state.size), y = curveY(state.size);
      sizePoint.setAttribute('cx', String(x)); sizePoint.setAttribute('cy', String(y));
      for (const [key, value] of Object.entries({ x1: x, x2: x, y1: y })) sizeGuide.setAttribute(key, String(value));
      sizeValues[0].textContent = String(state.size); sizeValues[1].textContent = sdText(theory.sampling);
      curve.setAttribute('aria-label', `当前 N=${state.size}，理论抽样标准差 ${sdText(theory.sampling)}，按 N 的平方根反比缩小。`);
    }
    function drawHistogram(view, values, variance, note) {
      setText(view.note, note);
      // Keep the SVG tree stable. A new run changes geometry and text only.
      if (!view.drawing) {
        const marks = svgNode('g'); view.plot.append(marks);
        const yTicks = [];
        for (let i = 0; i <= 4; i++) {
          const y = 205 - i * 42;
          marks.append(svgNode('line', { x1: 65, x2: 595, y1: y, y2: y, class: cls('grid') }));
          yTicks.push(svgText(marks, 38, y + 5, ''));
        }
        const bars = Array.from({ length: 41 }, (_, i) => {
          const bar = svgNode('rect', { x: 65 + i * 530 / 41, y: 205, width: 530 / 41 - 1, height: 0, rx: 2, class: cls('hist-bar') });
          marks.append(bar); return bar;
        });
        marks.append(svgNode('line', { x1: 330, x2: 330, y1: 20, y2: 205, class: cls('zero') })); svgText(marks, 330, 15, '0');
        const xTicks = [-1, -0.5, 0, 0.5, 1].map((fraction) => ({ fraction, label: svgText(marks, 330 + fraction * 265, 231, '') }));
        svgText(marks, 330, 258, '偏离（pp）');
        const placeholder = svgText(view.plot, 310, 130, '运行重复实验后显示分布');
        view.drawing = { marks, yTicks, bars, xTicks, placeholder };
      }
      const { marks, yTicks, bars, xTicks, placeholder } = view.drawing;
      marks.setAttribute('visibility', values?.length ? 'visible' : 'hidden');
      placeholder.setAttribute('visibility', values?.length ? 'hidden' : 'visible');
      if (!values?.length) {
        view.values.forEach((node) => setText(node, '—'));
        view.plot.setAttribute('aria-label', '尚未运行重复实验'); return;
      }
      let sum = 0, squares = 0, max = 0;
      values.forEach((v) => { sum += v; squares += v * v; max = Math.max(max, Math.abs(v)); });
      const mean = sum / values.length, sampleVariance = Math.max(0, (squares - values.length * mean * mean) / (values.length - 1));
      const extent = Math.max(0.05, Math.ceil(max * 100 / 5) * 0.05), bins = new Uint32Array(41);
      values.forEach((v) => { bins[Math.min(40, Math.max(0, Math.floor((v + extent) / (2 * extent) * 41)))]++; });
      const peak = Math.max(1, ...bins), top = Math.ceil(peak * 1.1);
      yTicks.forEach((node, i) => setText(node, Math.round(top * i / 4)));
      bins.forEach((count, i) => { const height = count / top * 168; bars[i].setAttribute('y', String(205 - height)); bars[i].setAttribute('height', String(height)); });
      xTicks.forEach(({ fraction, label }) => setText(label, (fraction * extent * 100).toFixed(1)));
      setText(view.values[0], pp(mean)); setText(view.values[1], sdText(sampleVariance)); setText(view.values[2], sdText(variance));
      view.plot.setAttribute('aria-label', `${values.length} 次重复实验，模拟均值 ${pp(mean)}，模拟标准差 ${sdText(sampleVariance)}，理论标准差 ${sdText(variance)}。显示范围覆盖全部模拟结果。`);
    }
    function renderResults() {
      const fixed = results?.mode === 'fixed';
      const notes = fixed ? [
        '固定当前有限总体，此处是固定抽样差异的点质量，理论标准差为零，不是重新抽样的分布。',
        '固定当前用户及潜在结果，重复完全随机分配；理论标准差条件于该样本。',
        '抽样差异固定，总误差的中心偏移为当前 τₙ − τₚ，波动仅来自分配。',
      ] : ['每次独立抽取 N 名用户所产生的抽样差异。', '每次抽样后进行完全随机分配；理论值为对抽样取平均后的随机化标准差。', '独立抽样与处理分配共同产生的总误差。'];
      histograms.forEach((view, i) => drawHistogram(view, results?.values[i], results?.variances[i] ?? 0, notes[i]));
    }
    function stopJob() {
      if (frame) cancelAnimationFrame(frame); frame = 0;
      if (job) setProgress('重复实验已停止。'); job = null;
      runBoth.removeAttribute('aria-disabled'); runFixed.removeAttribute('aria-disabled');
    }
    function clearResults(message) { stopJob(); results = null; setProgress(message); renderResults(); }
    function resample(message = '') {
      clearResults(message); sample = drawSample(state); sampleId++; assignmentId = 1;
      experiment = assign(sample, theoretical(state).n1); updateCurrent(); drawDots();
    }
    function startJob(mode) {
      if (job) return;
      // Retain the displayed distributions until the replacement batch is ready.
      stopJob();
      const theory = theoretical(state), conditional = conditionalVariance(sample, theory);
      job = { mode, count: Number(repetitions.input.value), done: 0, startedAt: performance.now(), announced: false, values: [[], [], []],
        variances: mode === 'fixed' ? [0, conditional, conditional] : [theory.sampling, theory.randomization, theory.overall], theory };
      runBoth.setAttribute('aria-disabled', 'true'); runFixed.setAttribute('aria-disabled', 'true');
      schedule();
    }
    function schedule() { if (job && !frame && !hiddenPaused && !controller.signal.aborted) frame = requestAnimationFrame(tick); }
    function tick() {
      frame = 0; if (!job || hiddenPaused || controller.signal.aborted) return;
      const currentJob = job, start = performance.now();
      do {
        const trialSample = job.mode === 'fixed' ? sample : drawSample(state);
        const trial = assign(trialSample, job.theory.n1);
        job.values[0].push(trialSample.tau - job.theory.tau); job.values[1].push(trial.estimate - trialSample.tau); job.values[2].push(trial.estimate - job.theory.tau); job.done++;
      } while (job.done < job.count && performance.now() - start < 8);
      if (job.done === job.count) {
        results = currentJob; job = null; runBoth.removeAttribute('aria-disabled'); runFixed.removeAttribute('aria-disabled');
        setProgress(`已完成 ${currentJob.count.toLocaleString()} 次${currentJob.mode === 'fixed' ? '固定样本模拟' : '两层随机性模拟'}。`);
        renderResults();
      } else {
        // Fast batches finish without flashing a temporary running message.
        if (!job.announced && performance.now() - job.startedAt >= 250) {
          job.announced = true;
          setProgress(job.mode === 'fixed' ? '正在运行固定样本模拟……' : '正在运行两层随机性模拟……');
        }
        schedule();
      }
    }
    function typeset() {
      if (mathRequested || !window.siteMathJax || controller.signal.aborted) return;
      mathRequested = true;
      void window.siteMathJax.typeset(content).then(() => {
        if (controller.signal.aborted) window.MathJax?.typesetClear?.([content]);
      }).catch(() => { mathRequested = false; });
    }
    resample('已生成初始样本并完成一次随机分配。'); on(document, 'site:layout-change', typeset); typeset();
    return {
      pause() { hiddenPaused = true; if (frame) cancelAnimationFrame(frame); frame = 0; },
      resume() { hiddenPaused = false; schedule(); },
      destroy() { controller.abort(); stopJob(); window.MathJax?.typesetClear?.([content]); },
    };
  },
};
