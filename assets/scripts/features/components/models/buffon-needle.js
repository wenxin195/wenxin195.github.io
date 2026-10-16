import {
  createButton,
  createRangeControl,
  createShell,
  element,
  formatNumber,
  formatPercent,
} from '@/features/components/shared.js';

function validateRange(range, name) {
  if (!range || !Number.isFinite(range.min) || !Number.isFinite(range.max)
      || !Number.isFinite(range.value) || range.min >= range.max
      || range.value < range.min || range.value > range.max) {
    throw new Error(`${name} 参数范围无效。`);
  }
}

function simulate(canvas, lengthRatio, tosses) {
  const context = canvas.getContext('2d');
  const width = Math.max(320, Math.round(canvas.clientWidth || 640));
  const height = 220;
  const spacing = 44;
  const drawLimit = Math.min(tosses, 700);
  const needles = [];
  let hits = 0;

  canvas.width = width * devicePixelRatio;
  canvas.height = height * devicePixelRatio;
  canvas.style.height = `${height}px`;
  context.scale(devicePixelRatio, devicePixelRatio);
  context.clearRect(0, 0, width, height);
  context.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-border');
  context.lineWidth = 1;
  for (let y = 0; y <= height; y += spacing) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  for (let i = 0; i < tosses; i += 1) {
    const x = Math.random() * width;
    const baseLine = Math.floor(Math.random() * (height / spacing)) * spacing;
    const distance = Math.random() * (spacing / 2);
    const centerY = baseLine + (Math.random() < 0.5 ? distance : -distance);
    const angle = Math.random() * Math.PI;
    const hit = distance <= (lengthRatio * spacing / 2) * Math.sin(angle);
    if (hit) hits += 1;
    if (i < drawLimit) needles.push({
      x1: x - (lengthRatio * spacing / 2) * Math.cos(angle),
      y1: centerY - (lengthRatio * spacing / 2) * Math.sin(angle),
      x2: x + (lengthRatio * spacing / 2) * Math.cos(angle),
      y2: centerY + (lengthRatio * spacing / 2) * Math.sin(angle),
      hit,
    });
  }

  for (const needle of needles) {
    context.strokeStyle = needle.hit ? '#d9485f' : '#2878b5';
    context.beginPath();
    context.moveTo(needle.x1, needle.y1);
    context.lineTo(needle.x2, needle.y2);
    context.stroke();
  }
  return hits;
}

export const buffonNeedleModel = {
  validate(config) {
    validateRange(config.parameters?.lengthRatio, 'lengthRatio');
    validateRange(config.parameters?.tosses, 'tosses');
    if (config.parameters.lengthRatio.min <= 0 || config.parameters.lengthRatio.max >= 1) {
      throw new Error('针长比例的范围必须严格位于 0 和 1 之间。');
    }
    if (config.parameters.tosses.min < 1 || config.parameters.tosses.max > 20000) {
      throw new Error('投掷次数范围必须介于 1 到 20000。');
    }
  },

  mount(root, config) {
    const content = createShell(root, config);
    const controls = element('div', 'interactive-component__controls');
    const lengthSettings = config.parameters.lengthRatio;
    const tossSettings = config.parameters.tosses;
    const length = createRangeControl({
      label: '针长 / 线距', min: lengthSettings.min, max: lengthSettings.max,
      step: 0.05, value: lengthSettings.value, format: (value) => value.toFixed(2),
    });
    const tosses = createRangeControl({
      label: '投掷次数', min: tossSettings.min, max: tossSettings.max,
      step: Math.max(1, Math.round((tossSettings.max - tossSettings.min) / 50)),
      value: tossSettings.value,
      format: (value) => Math.round(value).toLocaleString('zh-CN'),
    });
    const run = createButton('重新投掷');
    controls.append(length.wrapper, tosses.wrapper, run);

    const canvas = element('canvas', 'interactive-component__simulation-canvas');
    canvas.setAttribute('aria-label', '平行线间随机投针的模拟图');
    const stats = element('dl', 'interactive-component__stats');
    const hitValue = element('dd');
    const probabilityValue = element('dd');
    const piValue = element('dd');
    stats.append(
      element('dt', null, '模拟相交次数'), hitValue,
      element('dt', null, '理论相交概率'), probabilityValue,
      element('dt', null, 'π 的估计'), piValue,
    );
    const note = element('p', 'interactive-component__note', '画面最多显示 700 枚针；统计值按完整投掷次数计算。');
    content.append(controls, canvas, stats, note);

    function update() {
      const n = Number(tosses.input.value);
      const ratio = Number(length.input.value);
      const hits = simulate(canvas, ratio, n);
      probabilityValue.textContent = formatPercent((2 * ratio) / Math.PI);
      hitValue.textContent = `${hits} / ${n}`;
      piValue.textContent = hits > 0 ? formatNumber((2 * ratio * n) / hits) : '本次没有命中';
    }

    run.addEventListener('click', update);
    length.input.addEventListener('input', update);
    tosses.input.addEventListener('input', update);
    update();
  },
};
