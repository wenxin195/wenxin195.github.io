import { createButton, createRangeControl, createShell, element } from '@/features/components/shared.js';

const RUN_OPTIONS = [20, 100, 500, 1000];

export const precisionDemoModel = {
  validate(config) {
    const p = config.parameters;
    for (const key of ['n', 'runs']) {
      const x = p?.[key];
      if (!x || !Number.isFinite(x.min) || !Number.isFinite(x.max) || !Number.isFinite(x.value)
          || x.min >= x.max || x.value < x.min || x.value > x.max) throw new Error(`${key} 参数范围无效。`);
    }
    if (p.n.min < 50 || p.n.max > 10000 || p.runs.min < 20 || p.runs.max > 1000) throw new Error('样本量或重复次数超出允许范围。');
  },
  mount(root, config) {
    const content = createShell(root, config), p = config.parameters;
    const controller = new AbortController(), { signal } = controller;
    const trueA = 0.3, trueB = 0.33, tau = trueB - trueA, critical = 1.96;
    const controls = element('div', 'precision-demo__controls');
    const headline = element('div', 'precision-demo__headline');
    for (const [label, value, positive] of [['A 组真实留存率', '30%', false], ['B 组真实留存率', '33%', false], ['真实效应', '+3 pp', true]]) {
      const item = element('div', 'precision-demo__headline-item'); item.append(element('span', null, label), element('strong', positive ? 'precision-demo__positive' : null, value)); headline.append(item);
    }
    const n = createRangeControl({ label: '每组样本量', min: p.n.min, max: p.n.max, step: 50, value: p.n.value,
      format: (v) => `${Math.round(v).toLocaleString('zh-CN')} 人` });
    const runDefault = Math.min(500, Math.max(p.runs.min, p.runs.value));
    const runControl = element('fieldset', 'precision-demo__run-control');
    runControl.append(element('legend', null, '每批重复实验次数'));
    const runChoices = element('div', 'precision-demo__run-options'); let selectedRuns = runDefault;
    for (const count of RUN_OPTIONS.filter((x) => x >= p.runs.min && x <= p.runs.max)) {
      const button = createButton(String(count), 'precision-demo__run-option'); button.dataset.selected = String(count === selectedRuns);
      button.addEventListener('click', () => { selectedRuns = count; for (const option of runChoices.children) option.dataset.selected = String(Number(option.textContent) === count); runButton.textContent = `⊙ 运行 ${count.toLocaleString()} 次实验`; }, { signal });
      runChoices.append(button);
    }
    runControl.append(runChoices);
    const runButton = createButton(`⊙ 运行 ${selectedRuns.toLocaleString()} 次实验`, 'button button--primary');
    const clearButton = createButton('⟲ 清空模拟', 'button button--secondary');
    controls.append(headline, n.wrapper, runControl, runButton, clearButton);

    const stats = element('div', 'precision-demo__stats');
    const statNodes = {};
    for (const [key, label] of [['se', '理论标准误'], ['width', '平均区间宽度'], ['coverage', '经验覆盖率']]) {
      const cell = element('div', 'precision-demo__stat'); cell.append(element('span', null, label)); statNodes[key] = element('strong'); cell.append(statNodes[key]); stats.append(cell);
    }
    const chartSection = element('section', 'precision-demo__chart-section');
    const chartHeading = element('div', 'precision-demo__chart-heading'); chartHeading.append(element('h4', null, '重复实验的置信区间'));
    const chartCount = element('span', 'precision-demo__chart-count'); chartHeading.append(chartCount);
    const canvas = element('canvas', 'precision-demo__canvas'); canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', '最近 60 次模拟实验的 95% Wald 置信区间；蓝色表示覆盖真实效应，红色表示未覆盖，绿色虚线表示真实效应');
    const legend = element('div', 'precision-demo__legend');
    legend.append(element('span', 'precision-demo__legend-covered', '覆盖真实效应'), element('span', 'precision-demo__legend-uncovered', '未覆盖真实效应'), element('span', 'precision-demo__legend-truth', '真实 +3 pp'));
    chartSection.append(chartHeading, canvas, legend);
    const interpretation = element('section', 'precision-demo__interpretation'); interpretation.append(element('h4', null, '实验解读'));
    const interpretationText = element('p'); interpretation.append(interpretationText);
    content.append(controls, stats, chartSection, interpretation);

    let intervals = [], frame = 0;
    function standardError() { const size = Number(n.input.value); return Math.sqrt(trueA * (1 - trueA) / size + trueB * (1 - trueB) / size); }
    function draw() {
      const ctx = canvas.getContext('2d'); if (!ctx) return;
      const width = Math.max(1, canvas.clientWidth || 640), height = 330, dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = width * dpr; canvas.height = height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
      const se = standardError(), pad = { left: 38, right: 22, top: 12, bottom: 56 }, plotW = width - pad.left - pad.right;
      const shown = intervals.slice(-60), rowH = Math.min(6.2, Math.max(3.5, (height - pad.top - pad.bottom) / 60));
      const xmin = -0.1, xmax = 0.16, x = (value) => pad.left + (value - xmin) / (xmax - xmin) * plotW;
      ctx.strokeStyle = '#dedede'; ctx.lineWidth = 1; ctx.fillStyle = '#666'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
      for (const tick of [-0.1, -0.05, 0, 0.03, 0.05, 0.1, 0.15]) { const px = x(tick); ctx.beginPath(); ctx.moveTo(px, pad.top); ctx.lineTo(px, height - pad.bottom + 2); ctx.stroke(); ctx.fillText(`${(tick * 100).toFixed(tick === 0.03 ? 0 : tick * 100 % 1 === 0 ? 0 : 1)}`, px, height - pad.bottom + 18); }
      shown.forEach(([lo, hi], index) => {
        const covered = lo <= tau && hi >= tau, y = pad.top + index * rowH + rowH / 2;
        ctx.strokeStyle = covered ? '#5b8fd4' : '#d9685f'; ctx.fillStyle = ctx.strokeStyle; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(x(lo), y); ctx.lineTo(x(hi), y); ctx.stroke(); ctx.beginPath(); ctx.arc(x((lo + hi) / 2), y, 1.8, 0, Math.PI * 2); ctx.fill();
      });
      ctx.strokeStyle = '#10966a'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(x(tau), pad.top); ctx.lineTo(x(tau), height - pad.bottom); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#555'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('留存率差异（pp）', width / 2, height - 8);
    }
    function renderStats() {
      const se = standardError(), hit = intervals.filter(([lo, hi]) => lo <= tau && hi >= tau).length;
      const meanWidth = intervals.length ? intervals.reduce((sum, [lo, hi]) => sum + hi - lo, 0) / intervals.length : 2 * critical * se;
      statNodes.se.textContent = `${(se * 100).toFixed(2)} pp`;
      statNodes.width.textContent = `${(meanWidth * 100).toFixed(2)} pp`;
      statNodes.coverage.textContent = intervals.length ? `${(hit / intervals.length * 100).toFixed(1)}%` : '—';
      chartCount.textContent = intervals.length ? `最近 ${Math.min(60, intervals.length)} 次 / 共 ${intervals.length.toLocaleString()} 次` : '尚未运行模拟';
      interpretationText.textContent = intervals.length
        ? `已完成 ${intervals.length.toLocaleString()} 次模拟，其中 ${hit.toLocaleString()} 次区间覆盖真实效应，经验覆盖率为 ${(hit / intervals.length * 100).toFixed(1)}%。增加样本量通常会缩窄区间，但不保证每次构造的区间都覆盖真实参数。95% 是该构造方法在重复抽样下的长期覆盖概率（近似值）。`
        : '固定真实留存率为 A 组 30%、B 组 33%。设置样本量和模拟次数后运行实验；区间覆盖率按本批全部模拟计算，图中仅显示最近 60 次。';
      draw();
    }
    function runExperiments() {
      const count = selectedRuns, se = standardError(); intervals = [];
      for (let i = 0; i < count; i++) {
        const z = Math.sqrt(-2 * Math.log(Math.max(Number.EPSILON, Math.random()))) * Math.cos(2 * Math.PI * Math.random());
        const estimate = tau + z * se; intervals.push([estimate - critical * se, estimate + critical * se]);
      }
      renderStats();
    }
    function schedule() { cancelAnimationFrame(frame); frame = requestAnimationFrame(renderStats); }
    n.input.addEventListener('input', schedule, { signal });
    runButton.addEventListener('click', runExperiments, { signal });
    clearButton.addEventListener('click', () => { intervals = []; renderStats(); }, { signal });
    const resize = new ResizeObserver(schedule); resize.observe(canvas);
    renderStats();
    return () => { cancelAnimationFrame(frame); resize.disconnect(); controller.abort(); };
  },
};
