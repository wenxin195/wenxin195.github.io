export function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function createShell(root, config) {
  root.classList.add('interactive-component');
  root.replaceChildren();

  const header = element('header', 'interactive-component__header');
  if (config.title) header.append(element('h3', 'interactive-component__title', config.title));
  if (config.description) {
    header.append(element('p', 'interactive-component__description', config.description));
  }
  if (header.childElementCount) root.append(header);

  const content = element('div', 'interactive-component__content');
  root.append(content);
  return content;
}

export function createStage(className = '') {
  const stage = element('div', `interactive-component__stage ${className}`.trim());
  return stage;
}

export function createRangeControl({ label, min, max, step = 1, value, format = String }) {
  const wrapper = element('label', 'interactive-component__control');
  const heading = element('span', 'interactive-component__control-label', label);
  const output = element('output', 'interactive-component__control-value', format(value));
  const input = element('input', 'interactive-component__range');
  input.type = 'range';
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  // A range value must lie on its step grid. Preserve the author's requested
  // initial value rather than letting browsers silently snap it on first use.
  input.value = String(value);
  if (Number(input.value) !== Number(value)) {
    input.step = 'any';
    input.value = String(value);
  }
  input.setAttribute('aria-label', label);
  input.addEventListener('input', () => {
    output.value = format(Number(input.value));
    output.textContent = output.value;
  });
  wrapper.append(heading, output, input);
  return { wrapper, input, output };
}

export function createSelectControl({ label, options, value }) {
  const wrapper = element('label', 'interactive-component__control');
  wrapper.append(element('span', 'interactive-component__control-label', label));
  const input = element('select', 'interactive-component__select');
  for (const option of options) {
    const item = element('option', null, option.label);
    item.value = String(option.value);
    input.append(item);
  }
  input.value = String(value);
  wrapper.append(input);
  return { wrapper, input };
}

export function createToggleControl({ label, checked = false }) {
  const wrapper = element('label', 'interactive-component__toggle');
  const input = element('input');
  input.type = 'checkbox';
  input.checked = checked;
  wrapper.append(input, element('span', null, label));
  return { wrapper, input };
}

export function createStepControls({ onPrevious, onNext, signal }) {
  const wrapper = element('div', 'interactive-component__actions');
  const previous = createButton('上一步');
  const next = createButton('下一步');
  previous.addEventListener('click', onPrevious, { signal });
  next.addEventListener('click', onNext, { signal });
  wrapper.append(previous, next);
  return { wrapper, previous, next };
}

export function createButton(label, className = 'button button--secondary') {
  const styled = /(?:^|\s)button(?:\s|$)/.test(className) ? `${className} button--rounded` : className;
  const button = element('button', styled, label);
  button.type = 'button';
  return button;
}

export function formatPercent(value, digits = 2) {
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatNumber(value, digits = 4) {
  return Number.isFinite(value) ? value.toFixed(digits) : '—';
}
