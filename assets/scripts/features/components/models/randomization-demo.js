import { createButton, createSelectControl, createShell, element } from '@/features/components/shared.js';

function validate(config) {
  const r = config.parameters?.runs;
  if (!r || !Number.isInteger(r.min) || !Number.isInteger(r.max) || !Number.isInteger(r.value)
      || r.min < 10 || r.max > 1000 || r.min >= r.max || r.value < r.min || r.value > r.max) {
    throw new Error('重复分组次数参数无效。');
  }
}

export const randomizationDemoModel = {
  validate,
  mount(root, config) {
    const content = createShell(root, config), p = config.parameters;
    const controller = new AbortController(), { signal } = controller;
    const runOptions = [...new Set([p.runs.value, 100, 300, 1000].filter((n) => n >= p.runs.min && n <= 1000))].sort((a, b) => a - b);
    const defaults = { n: 1000, runs: runOptions.includes(1000) ? 1000 : runOptions.at(-1) };
    const controls = element('div', 'interactive-component__controls');
    const population = createSelectControl({ label: '固定总体人数', value: defaults.n,
      options: [100, 500, 1000, 5000].map((n) => ({ label: `${n.toLocaleString()} 人`, value: n })) });
    const runs = createSelectControl({ label: '每批重复次数', value: defaults.runs,
      options: runOptions.map((n) => ({ label: `${n.toLocaleString()} 次`, value: n })) });
    const repeat = createButton(`⊙ 重复 ${defaults.runs.toLocaleString()} 次`, 'button button--primary');
    const reset = createButton('⟲ 重置', 'button button--secondary');
    controls.append(population.wrapper, runs.wrapper, repeat, reset);

    const results = element('section', 'randomization-demo__results');
    results.append(element('h4', null, '随机化分布'));
    const histogram = element('canvas', 'interactive-component__simulation-canvas');
    histogram.setAttribute('role', 'img');
    histogram.setAttribute('aria-label', '重复随机分组的效应估计直方图，标记真实有限总体 ATE 和重复估计均值');
    const distributionStats = element('div', 'randomization-demo__stats');
    const latest = element('section', 'randomization-demo__latest');
    latest.append(element('h4', null, '最近一次随机分组结果'));
    const latestStats = element('div', 'randomization-demo__stats');
    const latestNote = element('p', 'interactive-component__status');
    const disclosure = element('details', 'randomization-demo__potential');
    disclosure.append(element('summary', null, '查看固定总体的潜在结果结构'));
    const potentialTable = element('div', 'randomization-demo__table');
    disclosure.append(potentialTable, element('p', 'interactive-component__note', '每位用户的 Y(0)、Y(1) 在所有重复实验中保持固定；每次只重新随机分配用户。'));
    const interpretation = element('section', 'randomization-demo__interpretation');
    interpretation.append(element('h4', null, '如何解释当前结果'));
    const interpretationText = element('p', 'interactive-component__status');
    interpretation.append(interpretationText);
    results.append(distributionStats, histogram);
    latest.append(latestStats, latestNote);
    content.append(controls, results, latest, disclosure, interpretation);

    let outcomes = [], truth = 0, values = [], latestResult = null, frame = 0;
    function newPopulation(n) {
      outcomes = [];
      // Construct an exactly balanced finite population with a fixed true ATE of zero.
      const cells = [
        { y0: 0, y1: 0, count: Math.round(n * 0.35) },
        { y0: 0, y1: 1, count: Math.round(n * 0.15) },
        { y0: 1, y1: 0, count: Math.round(n * 0.15) },
        { y0: 1, y1: 1, count: 0 },
      ];
      cells[3].count = n - cells.reduce((sum, cell) => sum + cell.count, 0);
      for (const cell of cells) for (let i = 0; i < cell.count; i++) outcomes.push({ y0: cell.y0, y1: cell.y1 });
      for (let i = outcomes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); [outcomes[i], outcomes[j]] = [outcomes[j], outcomes[i]];
      }
      truth = outcomes.reduce((sum, x) => sum + x.y1 - x.y0, 0) / n;
      potentialTable.replaceChildren();
      const table = element('table');
      const head = element('tr'); ['潜在结果', '人数'].forEach((label) => head.append(element('th', null, label)));
      const rows = [
        ['两种方案均不留存', cells[0].count], ['仅新关卡留存', cells[1].count],
        ['仅原关卡留存', cells[2].count], ['两种方案均留存', cells[3].count],
      ];
      table.append(head);
      for (const [label, count] of rows) { const row = element('tr'); row.append(element('td', null, label), element('td', null, count.toLocaleString())); table.append(row); }
      potentialTable.append(table);
    }
    function stat(label, value, className = '') {
      const item = element('div', 'randomization-demo__stat');
      item.append(element('span', null, label), element('strong', className, value));
      return item;
    }
    function draw() {
      const ctx = histogram.getContext('2d'); if (!ctx) return;
      const width = Math.max(1, histogram.clientWidth || 640), height = 220, dpr = Math.min(devicePixelRatio || 1, 2);
      histogram.width = width * dpr; histogram.height = height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const bins = 31, counts = Array(bins).fill(0), low = -0.5, high = 0.5;
      for (const value of values) counts[Math.max(0, Math.min(bins - 1, Math.floor((value - low) / (high - low) * bins)))]++;
      const pad = 26, plotW = width - pad * 2, plotH = height - 48, max = Math.max(...counts, 1), bw = plotW / bins;
      ctx.strokeStyle = '#ddd'; ctx.lineWidth = 1;
      for (const tick of [-0.4, -0.2, 0, 0.2, 0.4]) { const x = pad + (tick - low) / (high - low) * plotW; ctx.beginPath(); ctx.moveTo(x, 10); ctx.lineTo(x, height - 32); ctx.stroke(); ctx.fillStyle = '#666'; ctx.textAlign = 'center'; ctx.fillText(`${(tick * 100).toFixed(0)}`, x, height - 12); }
      ctx.fillStyle = '#83a6d8'; counts.forEach((count, i) => { const h = count / max * plotH; ctx.fillRect(pad + i * bw, height - 32 - h, Math.max(1, bw - 1), h); });
      const mean = values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
      for (const [value, color, dash] of [[truth, '#079447', []], [mean, '#dc8b2d', [5, 3]]]) {
        const x = pad + (value - low) / (high - low) * plotW; ctx.strokeStyle = color; ctx.setLineDash(dash); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, 10); ctx.lineTo(x, height - 32); ctx.stroke();
      }
      ctx.setLineDash([]); ctx.fillStyle = '#555'; ctx.textAlign = 'center'; ctx.fillText('估计的留存率差异（百分点）', width / 2, height - 1);
    }
    function render() {
      const mean = values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
      distributionStats.replaceChildren(
        stat('真实有限总体 ATE', `${(truth * 100).toFixed(1)} pp`, 'randomization-demo__negative'),
        stat('重复估计均值', `${(mean * 100).toFixed(2)} pp`),
        stat('重复次数', values.length.toLocaleString()));
      if (latestResult) {
        const differenceClass = latestResult.diff > 0 ? 'randomization-demo__truth' : 'randomization-demo__negative';
        const differenceText = `${latestResult.diff > 0 ? '+' : ''}${(latestResult.diff * 100).toFixed(1)} pp`;
        latestStats.replaceChildren(stat('A 组留存率', `${(latestResult.a * 100).toFixed(1)}%`), stat('B 组留存率', `${(latestResult.b * 100).toFixed(1)}%`), stat('差异估计 B − A', differenceText, differenceClass));
        latestNote.textContent = `第 ${values.length.toLocaleString()} 次分组，A、B 组各 ${Math.floor(outcomes.length / 2).toLocaleString()} 人。用户总体和潜在结果均未改变。`;
      }
      interpretationText.textContent = `已重复 ${values.length.toLocaleString()} 次，估计均值为 ${(mean * 100).toFixed(2)} pp，真实有限总体 ATE 为 ${(truth * 100).toFixed(2)} pp；两者相差 ${Math.abs((mean - truth) * 100).toFixed(2)} pp。随机化无偏指所有可能分配下的期望，不保证有限次模拟的均值恰好等于真实值。`;
      draw();
    }
    function runBatch() {
      const n = Number(population.input.value), count = Number(runs.input.value);
      if (n !== outcomes.length) newPopulation(n);
      values = []; latestResult = null;
      const order = outcomes.map((_, i) => i), half = Math.floor(n / 2);
      for (let run = 0; run < count; run++) {
        for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
        let a = 0, b = 0;
        for (let i = 0; i < n; i++) { const x = outcomes[order[i]]; if (i < half) a += x.y0; else b += x.y1; }
        const aRate = a / half, bRate = b / (n - half), diff = bRate - aRate;
        values.push(diff); latestResult = { a: aRate, b: bRate, diff };
      }
      render();
    }
    population.input.addEventListener('change', () => { newPopulation(Number(population.input.value)); values = []; latestResult = null; render(); }, { signal });
    repeat.addEventListener('click', runBatch, { signal });
    runs.input.addEventListener('change', () => { repeat.textContent = `⊙ 重复 ${Number(runs.input.value).toLocaleString()} 次`; }, { signal });
    reset.addEventListener('click', () => { population.input.value = String(defaults.n); runs.input.value = String(defaults.runs); repeat.textContent = `⊙ 重复 ${defaults.runs.toLocaleString()} 次`; newPopulation(defaults.n); values = []; latestResult = null; render(); }, { signal });
    newPopulation(defaults.n); runBatch();
    const resize = new ResizeObserver(() => { cancelAnimationFrame(frame); frame = requestAnimationFrame(draw); }); resize.observe(histogram);
    return () => { cancelAnimationFrame(frame); resize.disconnect(); controller.abort(); };
  },
};
