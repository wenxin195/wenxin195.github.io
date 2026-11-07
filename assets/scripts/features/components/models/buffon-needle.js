import { createButton, createRangeControl, createShell, element, formatNumber, formatPercent } from '@/features/components/shared.js';

function validateRange(range, name) {
  if (!range || !Number.isFinite(range.min) || !Number.isFinite(range.max)
      || !Number.isFinite(range.value) || range.min >= range.max
      || range.value < range.min || range.value > range.max) throw new Error(`${name} 参数范围无效。`);
}

function makeTosses(count) {
  return Array.from({ length: count }, () => ({ x: Math.random(), distance: Math.random(),
    side: Math.random() < 0.5 ? -1 : 1, line: Math.floor(Math.random() * 5), angle: Math.random() * Math.PI }));
}

function setupCanvas(canvas, height) {
  const context = canvas.getContext('2d');
  if (!context) return null;
  const width = Math.max(1, Math.round(canvas.clientWidth || 640));
  const density = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * density);
  canvas.height = Math.round(height * density);
  context.setTransform(density, 0, 0, density, 0, 0);
  context.clearRect(0, 0, width, height);
  return { context, width };
}

function drawNeedles(canvas, samples, count, ratio) {
  const view = setupCanvas(canvas, 220);
  if (!view) return;
  const { context, width } = view;
  context.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-border');
  for (let y = 0; y <= 220; y += 44) {
    context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke();
  }
  const stride = Math.max(1, Math.ceil(count / 700));
  for (let i = 0; i < count; i += stride) {
    const toss = samples[i];
    const hit = toss.distance <= ratio * Math.sin(toss.angle);
    const dy = ratio * 22 * Math.sin(toss.angle);
    const dx = ratio * 22 * Math.cos(toss.angle);
    const centerY = toss.line * 44 + toss.side * toss.distance * 22;
    context.strokeStyle = hit ? '#d9485f' : '#2878b5';
    context.lineWidth = hit ? 2 : 1.3;
    context.beginPath(); context.moveTo(toss.x * width - dx, centerY - dy);
    context.lineTo(toss.x * width + dx, centerY + dy); context.stroke();
  }
}

function drawConvergence(canvas, samples, count, ratio) {
  const view = setupCanvas(canvas, 160);
  if (!view || count < 2) return;
  const { context, width } = view;
  const pad = 16;
  const yOf = (value) => 160 - pad - (Math.max(2, Math.min(5, value)) - 2) / 3 * (160 - 2 * pad);
  context.strokeStyle = '#9a8c73'; context.setLineDash([5, 4]);
  context.beginPath(); context.moveTo(pad, yOf(Math.PI)); context.lineTo(width - pad, yOf(Math.PI)); context.stroke();
  context.setLineDash([]); context.fillStyle = '#9a8c73'; context.font = '12px sans-serif';
  context.fillText('π', pad + 2, yOf(Math.PI) - 5);
  context.strokeStyle = '#2878b5'; context.lineWidth = 2; context.beginPath();
  let hits = 0, started = false;
  const skip = Math.max(1, Math.floor(count / 180));
  for (let i = 0; i < count; i += 1) {
    if (samples[i].distance <= ratio * Math.sin(samples[i].angle)) hits++;
    if ((i + 1) % skip && i !== count - 1) continue;
    if (!hits) continue;
    const x = pad + i / Math.max(1, count - 1) * (width - 2 * pad);
    const y = yOf(2 * ratio * (i + 1) / hits);
    if (!started) { context.moveTo(x, y); started = true; } else context.lineTo(x, y);
  }
  context.stroke();
}

export const buffonNeedleModel = {
  validate(config) {
    validateRange(config.parameters?.lengthRatio, 'lengthRatio');
    validateRange(config.parameters?.tosses, 'tosses');
    if (config.parameters.lengthRatio.min <= 0 || config.parameters.lengthRatio.max >= 1) throw new Error('针长比例必须严格位于 0 和 1 之间。');
    if (config.parameters.tosses.min < 1 || config.parameters.tosses.max > 20000) throw new Error('投掷次数必须介于 1 到 20000。');
  },
  mount(root, config) {
    const content = createShell(root, config);
    const controller = new AbortController();
    const { signal } = controller;
    const controls = element('div', 'interactive-component__controls');
    const lengthSettings = config.parameters.lengthRatio;
    const tossSettings = config.parameters.tosses;
    const length = createRangeControl({ label: '针长 / 线距', min: lengthSettings.min, max: lengthSettings.max,
      step: 0.01, value: lengthSettings.value, format: (value) => value.toFixed(2) });
    const tosses = createRangeControl({ label: '投掷次数', min: tossSettings.min, max: tossSettings.max,
      step: 1, value: tossSettings.value, format: (value) => Math.round(value).toLocaleString('zh-CN') });
    const one = createButton('再投 1 针');
    const run = createButton('重新抽取一组投针');
    controls.append(length.wrapper, tosses.wrapper, one, run);

    const canvas = element('canvas', 'interactive-component__simulation-canvas');
    canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', '红色为相交的针，蓝色为未相交的针');
    const curve = element('canvas', 'interactive-component__convergence');
    curve.setAttribute('role', 'img'); curve.setAttribute('aria-label', 'π 估计值与理论值的对照轨迹');
    const stats = element('dl', 'interactive-component__stats');
    const hitValue = element('dd'), probabilityValue = element('dd'), piValue = element('dd');
    stats.append(element('dt', null, '模拟相交次数'), hitValue,
      element('dt', null, '理论相交概率'), probabilityValue,
      element('dt', null, 'π 的估计'), piValue);
    content.append(controls, canvas, element('p', 'interactive-component__note', '估计轨迹（虚线为 π）'), curve, stats,
      element('p', 'interactive-component__note', '拖动参数时使用同一组随机投针；点击“重新抽取”才生成新的一组。图中最多画出 700 枚针，统计按全部投针计算。'));

    let samples = makeTosses(tossSettings.max);
    function update() {
      const count = Number(tosses.input.value), ratio = Number(length.input.value);
      let hits = 0;
      for (let i = 0; i < count; i += 1) if (samples[i].distance <= ratio * Math.sin(samples[i].angle)) hits++;
      drawNeedles(canvas, samples, count, ratio);
      drawConvergence(curve, samples, count, ratio);
      probabilityValue.textContent = formatPercent(2 * ratio / Math.PI);
      hitValue.textContent = `${hits} / ${count}`;
      piValue.textContent = hits ? formatNumber(2 * ratio * count / hits) : '本次没有命中';
      one.disabled = count >= tossSettings.max;
    }
    let frame = 0;
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    one.addEventListener('click', () => {
      tosses.input.value = String(Number(tosses.input.value) + 1);
      tosses.output.textContent = Number(tosses.input.value).toLocaleString('zh-CN'); schedule();
    }, { signal });
    run.addEventListener('click', () => { samples = makeTosses(tossSettings.max); schedule(); }, { signal });
    length.input.addEventListener('input', schedule, { signal });
    tosses.input.addEventListener('input', schedule, { signal });
    const resize = new ResizeObserver(schedule); resize.observe(canvas);
    const theme = new MutationObserver(schedule);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    update();
    return () => { cancelAnimationFrame(frame); resize.disconnect(); theme.disconnect(); controller.abort(); };
  },
};
