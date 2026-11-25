import { createButton, createRangeControl, createShell, element } from '@/features/components/shared.js';

const defaults = [0.4, 0.2, 0.1, 0.3];
const names = ['p₀₀', 'p₀₁', 'p₁₀', 'p₁₁'];
const meanings = ['两种方案均不留存', '仅在方案 B 下留存', '仅在方案 A 下留存', '两种方案均留存'];
const presets = [
  ['平均效应为正，但存在负向影响', defaults],
  ['平均效应为零，所有用户均未受影响', [0.5, 0, 0, 0.5]],
  ['平均效应为零，所有用户均受到影响', [0, 0.5, 0.5, 0]],
  ['平均效应为零，正负效应部分抵消', [0.25, 0.25, 0.25, 0.25]],
];
const percent = (value) => `${(value * 100).toFixed(1)}%`;
const pp = (value) => `${value > 1e-12 ? '+' : ''}${(Math.abs(value) < 1e-12 ? 0 : value * 100).toFixed(1)} pp`;
const cls = (name) => `potential-outcomes__${name}`;

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

function graphic(viewBox) {
  return svgNode('svg', { viewBox, role: 'img', width: '100%', class: cls('graphic') });
}

function math(tag, source, className = cls('formula')) {
  const node = element(tag, className, `\\(${source}\\)`);
  node.dataset.componentMath = 'true';
  return node;
}

export const potentialOutcomesModel = {
  validate(config) {
    const p = config.parameters?.probabilities;
    if (p !== undefined && (!Array.isArray(p) || p.length !== 4
      || !p.every((value) => Number.isFinite(value) && value >= 0 && value <= 1)
      || Math.abs(p.reduce((sum, value) => sum + value, 0) - 1) > 1e-10)) {
      throw new Error('四类潜在结果概率必须在 0 到 1 之间，且总和为 1。');
    }
  },

  mount(root, config) {
    const content = createShell(root, config);
    content.classList.add('potential-outcomes');
    const controller = new AbortController();
    const initial = [...(config.parameters?.probabilities ?? defaults)];
    let probabilities = [...initial];
    let mode = 'free';
    let agreement = 0.5;
    const on = (node, event, handler) => node.addEventListener(event, handler, { signal: controller.signal });
    function section(title) {
      const node = element('section', cls('section'));
      node.append(element('h4', cls('heading'), title));
      content.append(node);
      return node;
    }
    function button(label, action, className = cls('button')) {
      const node = createButton(label, className);
      on(node, 'click', action);
      return node;
    }

    const modes = element('div', cls('modes'));
    modes.setAttribute('role', 'group');
    modes.setAttribute('aria-label', '联合分布调整模式');
    const freeButton = button('自由调整联合分布', () => setMode('free'));
    const fixedButton = button('固定边缘分布', () => setMode('fixed'));
    modes.append(freeButton, fixedButton);
    content.append(modes);

    const parameters = section('01 联合分布参数');
    const freePanel = element('div', cls('sliders'));
    const controls = names.map((name, index) => {
      const control = createRangeControl({ label: `${name}  ${meanings[index]}`, min: 0, max: 100,
        step: 'any', value: initial[index] * 100, format: (value) => `${value.toFixed(1)}%` });
      control.wrapper.classList.add(cls('control'), cls(`type-${index}`));
      const label = control.wrapper.querySelector('.interactive-component__control-label');
      label.replaceChildren(math('span', `p_{${['00', '01', '10', '11'][index]}}`, cls('inline-math')),
        document.createTextNode(`  ${meanings[index]}`));
      on(control.input, 'input', () => {
        const value = Number(control.input.value) / 100;
        const remaining = probabilities.reduce((sum, p, j) => sum + (j === index ? 0 : p), 0);
        probabilities = probabilities.map((p, j) => j === index ? value
          : remaining > 0 ? p / remaining * (1 - value) : (1 - value) / 3);
        update();
      });
      freePanel.append(control.wrapper);
      return control;
    });
    freePanel.append(element('p', 'interactive-component__note', '调整任意概率，其余三个概率按原比例重新分配，使联合概率之和始终为 1；其余三项均为零时，平均分配剩余概率。'));
    const fixedPanel = element('div', cls('fixed'));
    fixedPanel.append(math('p', String.raw`\Pr_P(Y(0)=1)=\Pr_P(Y(1)=1)=0.5`));
    const consistency = createRangeControl({ label: '潜在结果的一致程度', min: 0, max: 100,
      step: 1, value: 50, format: (value) => `${value}%` });
    consistency.wrapper.classList.add(cls('control'));
    on(consistency.input, 'input', () => setAgreement(Number(consistency.input.value) / 100));
    const endpoints = element('div', cls('endpoints'));
    endpoints.append(element('span', null, '完全负相关'), element('span', null, '完全正相关'));
    const shortcuts = element('div', cls('shortcuts'));
    const shortcutButtons = [ ['完全负相关', 0], ['相互独立', 0.5], ['完全正相关', 1] ].map(([label, value]) => {
      const node = button(label, () => setAgreement(value));
      shortcuts.append(node);
      return { node, value };
    });
    fixedPanel.append(consistency.wrapper, endpoints, shortcuts,
      element('p', 'interactive-component__note', '一致程度是 Y(0) = Y(1) 的概率。两种方案的留存率固定为 50%，改变的是同一用户在两种方案下的结果搭配。'));
    parameters.append(freePanel, fixedPanel);

    const effects = section('02 个体处理效应的分布');
    effects.append(math('p', String.raw`\tau=Y(1)-Y(0)`));
    const chart = graphic('0 0 620 340');
    for (let tick = 0; tick <= 4; tick++) {
      const y = 262 - tick * 53;
      chart.append(svgNode('line', { x1: 76, x2: 606, y1: y, y2: y, class: cls('gridline') }));
      svgText(chart, 34, y + 5, `${tick * 25}%`, cls('tick'));
    }
    const bars = [2, 0, 1].map((type, i) => {
      const x = 114 + i * 178;
      const bar = svgNode('rect', { x, width: 100, rx: 5, class: `${cls('bar')} ${cls(`type-${type}`)}` });
      chart.append(bar);
      const value = svgText(chart, x + 50, 0, '', cls('bar-value'));
      svgText(chart, x + 50, 297, `τ = ${i - 1}`);
      svgText(chart, x + 50, 328, ['负向效应', '无效应', '正向效应'][i], cls('tick'));
      return { bar, value };
    });
    const stats = element('div', cls('stats'));
    function stat(label, formula) {
      const node = element('div', cls('stat'));
      const value = element('strong');
      node.append(element('span', null, label), value, math('span', formula));
      stats.append(node);
      return value;
    }
    const affected = stat('受到干预影响的用户', String.raw`\Pr_P(\tau\ne0)`);
    const variance = stat('个体处理效应方差', String.raw`\operatorname{Var}_P(\tau)`);
    effects.append(chart, stats);

    const average = section('03 超总体平均处理效应');
    const rates = ['方案 A · D1 留存率', '方案 B · D1 留存率'].map((label, index) => {
      const row = element('div', cls('rate'));
      const value = element('strong');
      const track = element('div', cls('track'));
      const fill = element('span', cls(`type-${index === 0 ? 0 : 3}`));
      track.setAttribute('aria-hidden', 'true');
      track.append(fill);
      row.append(element('span', null, label), value, track);
      average.append(row);
      return { value, fill };
    });
    const ateBox = element('div', cls('ate'));
    const ate = element('strong', cls('ate-value'));
    const equation = element('p', cls('formula'));
    const equationValues = math('span', '', cls('inline-math'));
    let equationSource = '';
    let renderedEquation = '';
    let equationRendering = false;
    let mathRequested = false;
    let mathReady = false;
    equation.append(equationValues);
    ateBox.append(element('span', null, 'Superpopulation ATE'), ate, equation);
    average.append(ateBox);

    const scenarios = section('04 预设情景');
    const presetList = element('div', cls('presets'));
    const presetButtons = presets.map(([label, p]) => {
      const node = button(label, () => {
        mode = 'free';
        probabilities = [...p];
        update();
      }, cls('preset'));
      node.append(element('span', cls('arrow'), '›'));
      presetList.append(node);
      return node;
    });
    const interpretation = element('div', cls('interpretation'));
    const explanation = element('p');
    explanation.setAttribute('role', 'status');
    explanation.setAttribute('aria-live', 'polite');
    interpretation.append(element('strong', null, '当前分布的统计解释'), explanation);
    const reset = button('↶ 重置演示', () => setMode('free'), cls('reset'));
    scenarios.append(presetList, interpretation, reset,
      element('p', 'interactive-component__note', '本演示中的联合概率为人为设定的模型参数，并非实际 A/B 测试的观测数据。'));

    function setMode(next) {
      mode = next;
      agreement = 0.5;
      probabilities = next === 'free' ? [...initial] : [0.25, 0.25, 0.25, 0.25];
      update();
    }
    function setAgreement(value) {
      agreement = value;
      probabilities = [value / 2, (1 - value) / 2, (1 - value) / 2, value / 2];
      update();
    }
    function update() {
      const [p00, p01, p10, p11] = probabilities;
      const effect = p01 - p10;
      const changed = p01 + p10;
      freePanel.hidden = mode !== 'free';
      fixedPanel.hidden = mode !== 'fixed';
      freeButton.setAttribute('aria-pressed', String(mode === 'free'));
      fixedButton.setAttribute('aria-pressed', String(mode === 'fixed'));
      consistency.input.value = String(agreement * 100);
      consistency.output.value = `${Math.round(agreement * 100)}%`;
      shortcutButtons.forEach(({ node, value }) => node.setAttribute('aria-pressed', String(mode === 'fixed' && agreement === value)));
      controls.forEach((control, i) => {
        control.input.value = String(probabilities[i] * 100);
        control.output.value = percent(probabilities[i]);
      });
      const distribution = [p10, p00 + p11, p01];
      bars.forEach(({ bar, value }, i) => {
        const height = distribution[i] * 212;
        bar.setAttribute('height', String(height));
        bar.setAttribute('y', String(262 - height));
        value.setAttribute('y', String(247 - height));
        value.textContent = percent(distribution[i]);
      });
      chart.setAttribute('aria-label', `个体处理效应分布：负向效应 ${percent(p10)}，无效应 ${percent(p00 + p11)}，正向效应 ${percent(p01)}。`);
      affected.textContent = percent(changed);
      variance.textContent = Math.max(0, changed - effect ** 2).toFixed(4);
      [p10 + p11, p01 + p11].forEach((rate, i) => {
        rates[i].value.textContent = percent(rate);
        rates[i].fill.style.width = percent(rate);
      });
      ate.textContent = pp(effect);
      ate.dataset.direction = Math.abs(effect) < 1e-12 ? 'zero' : effect > 0 ? 'positive' : 'negative';
      equationSource = String.raw`\tau_P = p_{01} - p_{10} = ${p01.toFixed(3)} - ${p10.toFixed(3)}`;
      if (!mathRequested) equationValues.textContent = `\\(${equationSource}\\)`;
      else void typesetEquation();
      presetButtons.forEach((node, i) => node.setAttribute('aria-pressed', String(mode === 'free'
        && probabilities.every((p, j) => Math.abs(p - presets[i][1][j]) < 1e-10))));
      explanation.textContent = `方案 B 相较于方案 A 的平均处理效应为 ${pp(effect)}。其中 ${percent(p01)} 的用户受到正向影响，${percent(p10)} 的用户受到负向影响，${percent(p00 + p11)} 的用户不受影响。`
        + (mode === 'fixed' ? '两种方案的留存率均保持为 50%；相同的边缘分布可以对应不同的个体效应分布。' : '');
    }
    update();
    // The component may mount while the article's MathJax script is still loading.
    // Render off DOM, then swap the finished equation without exposing raw TeX.
    async function typesetEquation() {
      if (!mathReady || equationRendering || controller.signal.aborted || renderedEquation === equationSource) return;
      equationRendering = true;
      const source = equationSource;
      try {
        const output = await window.MathJax.tex2svgPromise(source, { display: false });
        if (controller.signal.aborted || source !== equationSource) return;
        window.MathJax.typesetClear?.([equationValues]);
        equationValues.replaceChildren(output);
        renderedEquation = source;
        document.dispatchEvent(new CustomEvent('site:layout-change'));
      } catch { /* Keep the previous rendered equation if conversion fails. */ }
      finally {
        equationRendering = false;
        if (!controller.signal.aborted && source !== equationSource) void typesetEquation();
      }
    }
    function typeset() {
      if (mathRequested || !window.siteMathJax || controller.signal.aborted) return;
      mathRequested = true;
      const source = equationSource;
      void window.siteMathJax.typeset(content).then(() => {
        if (controller.signal.aborted) { window.MathJax?.typesetClear?.([content]); return; }
        mathReady = true;
        renderedEquation = source;
        void typesetEquation();
      }).catch(() => { mathRequested = false; });
    }
    on(document, 'site:layout-change', typeset);
    typeset();
    return () => {
      controller.abort();
      window.MathJax?.typesetClear?.([content]);
    };
  },
};
