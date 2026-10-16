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

export function createRangeControl({ label, min, max, step = 1, value, format = String }) {
  const wrapper = element('label', 'interactive-component__control');
  const heading = element('span', 'interactive-component__control-label', label);
  const output = element('output', 'interactive-component__control-value', format(value));
  const input = element('input', 'interactive-component__range');
  input.type = 'range';
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);
  input.setAttribute('aria-label', label);
  input.addEventListener('input', () => {
    output.value = format(Number(input.value));
    output.textContent = output.value;
  });
  wrapper.append(heading, output, input);
  return { wrapper, input, output };
}

export function createButton(label, className = 'button button--secondary') {
  const button = element('button', className, label);
  button.type = 'button';
  return button;
}

export function formatPercent(value, digits = 2) {
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatNumber(value, digits = 4) {
  return Number.isFinite(value) ? value.toFixed(digits) : '—';
}
