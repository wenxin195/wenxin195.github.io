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

function simulate(lengthRatio, tosses) {
  const needles = [];
  let hits = 0;
  for (let i = 0; i < tosses; i += 1) {
    const x = Math.random();
    const baseLine = Math.floor(Math.random() * 5) * 44;
    const distance = Math.random() * 22;
    const centerY = baseLine + (Math.random() < 0.5 ? distance : -distance);
    const angle = Math.random() * Math.PI;
    const hit = distance <= lengthRatio * 22 * Math.sin(angle);
    if (hit) hits++;
    if (i < 700) needles.push({ x, centerY, angle, hit });
  }
  return { needles, hits, lengthRatio };
}
function draw(canvas, result) {
  if (!result) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  const width = Math.max(1, Math.round(canvas.clientWidth || 640));
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio); canvas.height = Math.round(220 * ratio);
  context.scale(ratio, ratio);
  context.clearRect(0, 0, width, 220);
  context.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-border');
  for (let y = 0; y <= 220; y += 44) {
    context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke();
  }
  for (const needle of result.needles) {
    const dx = result.lengthRatio * 22 * Math.cos(needle.angle);
    const dy = result.lengthRatio * 22 * Math.sin(needle.angle);
    context.strokeStyle = needle.hit ? '#d9485f' : '#2878b5';
    context.beginPath(); context.moveTo(needle.x * width - dx, needle.centerY - dy);
    context.lineTo(needle.x * width + dx, needle.centerY + dy); context.stroke();
  }
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

    let result;
    function update() {
      const n = Number(tosses.input.value);
      const ratio = Number(length.input.value);
      result = simulate(ratio, n);
      const { hits } = result;
      draw(canvas, result);
      probabilityValue.textContent = formatPercent((2 * ratio) / Math.PI);
      hitValue.textContent = `${hits} / ${n}`;
      piValue.textContent = hits > 0 ? formatNumber((2 * ratio * n) / hits) : '本次没有命中';
    }

    let frame = 0;
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    run.addEventListener('click', schedule);
    length.input.addEventListener('input', schedule);
    tosses.input.addEventListener('input', schedule);
    const observer = new ResizeObserver(() => draw(canvas, result));
    observer.observe(canvas);
    const theme = new MutationObserver(() => draw(canvas, result));
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    update();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); theme.disconnect();
      run.removeEventListener('click', schedule);
      length.input.removeEventListener('input', schedule);
      tosses.input.removeEventListener('input', schedule);
    };
  },
};
