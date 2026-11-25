// Targeted checks against the current build. --tex also checks the real MathJax CDN.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve('_site');
const verifyTex = process.argv.includes('--tex');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const server = http.createServer((request, response) => {
  let file = path.resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://local').pathname));
  if (!file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) file += '.html';
  if (!fs.existsSync(file)) { response.writeHead(404).end(); return; }
  response.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(response);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/*', (route) => {
    const url = route.request().url();
    return url.startsWith(origin) || (verifyTex && /^https:\/\/cdn\.jsdelivr\.net\/npm\/(?:mathjax@|@mathjax\/)/.test(url))
      ? route.continue() : route.abort();
  });
  await page.goto(origin + '/zh/counterfactual-randomization', { waitUntil: 'domcontentloaded' });
  const host = page.locator('[data-model="potential-outcomes"]');
  await host.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('[data-model="potential-outcomes"]')?.dataset.componentState === 'ready');
  const sizes = await host.locator('.potential-outcomes__graphic').evaluateAll((nodes) => nodes.map((node) => {
    const box = node.getBoundingClientRect();
    return { width: box.width, height: box.height };
  }));
  assert(sizes.every(({ width, height }) => width <= 480 && height <= 305), 'Distribution graphics should stay compact on desktop');
  if (verifyTex) {
    await host.locator('.potential-outcomes__sliders mjx-container').first().waitFor({ state: 'visible', timeout: 45000 });
    await host.locator('.potential-outcomes__ate').scrollIntoViewIfNeeded();
    await host.locator('.potential-outcomes__ate mjx-container svg').first().waitFor({ state: 'visible' });
    await page.evaluate(() => {
      window.potentialOutcomesMath = document.querySelector('.potential-outcomes__ate mjx-container');
    });
  }
  const free = host.getByRole('button', { name: '自由调整联合分布', exact: true });
  const fixed = host.getByRole('button', { name: '固定边缘分布', exact: true });
  const reset = host.getByRole('button', { name: '重置演示' });
  const values = () => host.locator('.potential-outcomes__sliders output').allTextContents();
  const ate = () => host.locator('.potential-outcomes__ate-value').textContent();
  const statValues = () => host.locator('.potential-outcomes__stat strong').allTextContents();
  const setRange = (locator, value) => locator.evaluate((input, next) => {
    input.value = String(next);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
  assert.deepEqual(await values(), ['40.0%', '20.0%', '10.0%', '30.0%']);
  assert.equal(await ate(), '+10.0 pp');
  assert.deepEqual(await statValues(), ['30.0%', '0.2900']);
  const sliders = host.locator('.potential-outcomes__sliders input');
  await setRange(sliders.nth(0), 70);
  assert.deepEqual(await values(), ['70.0%', '10.0%', '5.0%', '15.0%']);
  assert.equal(await ate(), '+5.0 pp');
  assert.deepEqual(await statValues(), ['15.0%', '0.1475']);
  if (verifyTex) {
    assert(await page.evaluate(() => window.potentialOutcomesMath === document.querySelector('.potential-outcomes__ate mjx-container')),
      'Slider updates should preserve typeset formulas');
    assert.match(await host.locator('.potential-outcomes__ate p').innerText(), /0\.100 − 0\.050/);
  }
  await setRange(sliders.nth(0), 100);
  assert.deepEqual(await values(), ['100.0%', '0.0%', '0.0%', '0.0%']);
  await setRange(sliders.nth(0), 40);
  assert.deepEqual(await values(), ['40.0%', '20.0%', '20.0%', '20.0%']);
  // A deterministic sequence exercises repeated normalization and every corner.
  for (let i = 0; i < 32; i++) {
    await setRange(sliders.nth(i % 4), (i * 37) % 101);
    const probabilities = await sliders.evaluateAll((inputs) => inputs.map((input) => Number(input.value) / 100));
    assert(probabilities.every((p) => Number.isFinite(p) && p >= 0 && p <= 1));
    assert(Math.abs(probabilities.reduce((sum, p) => sum + p, 0) - 1) < 1e-10);
    assert.equal(await ate(), `${probabilities[1] > probabilities[2] ? '+' : ''}${((probabilities[1] - probabilities[2]) * 100).toFixed(1)} pp`);
  }
  await fixed.click();
  assert.deepEqual(await values(), ['25.0%', '25.0%', '25.0%', '25.0%']);
  assert.equal(await fixed.getAttribute('aria-pressed'), 'true');
  if (verifyTex) {
    await host.locator('.potential-outcomes__fixed [data-component-math] mjx-container svg').first().waitFor({ state: 'visible' });
    assert.equal(await host.locator('mjx-merror, [data-mml-node="merror"]').count(), 0);
  }
  const agreement = host.getByRole('slider', { name: '潜在结果的一致程度' });
  for (const [name, expected, stats] of [
    ['完全负相关', ['0.0%', '50.0%', '50.0%', '0.0%'], ['100.0%', '1.0000']],
    ['完全正相关', ['50.0%', '0.0%', '0.0%', '50.0%'], ['0.0%', '0.0000']],
    ['相互独立', ['25.0%', '25.0%', '25.0%', '25.0%'], ['50.0%', '0.5000']],
  ]) {
    await host.getByRole('button', { name, exact: true }).click();
    assert.deepEqual(await values(), expected);
    assert.deepEqual(await statValues(), stats);
    assert.equal(await ate(), '0.0 pp');
    assert.deepEqual(await host.locator('.potential-outcomes__rate strong').allTextContents(), ['50.0%', '50.0%']);
  }
  await setRange(agreement, 73);
  assert.deepEqual(await values(), ['36.5%', '13.5%', '13.5%', '36.5%']);
  assert.deepEqual(await statValues(), ['27.0%', '0.2700']);
  await agreement.focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await agreement.inputValue(), '74');
  await free.click();
  assert.deepEqual(await values(), ['40.0%', '20.0%', '10.0%', '30.0%']);
  const presetButtons = host.locator('.potential-outcomes__preset');
  for (let i = 0; i < 4; i++) {
    await fixed.click();
    await presetButtons.nth(i).click();
    assert.equal(await free.getAttribute('aria-pressed'), 'true');
    assert.equal(await presetButtons.nth(i).getAttribute('aria-pressed'), 'true');
    assert.equal(await ate(), i === 0 ? '+10.0 pp' : '0.0 pp');
    assert.equal((await statValues())[0], ['30.0%', '0.0%', '100.0%', '50.0%'][i]);
  }
  await fixed.click();
  await reset.click();
  assert.equal(await free.getAttribute('aria-pressed'), 'true');
  assert.deepEqual(await values(), ['40.0%', '20.0%', '10.0%', '30.0%']);
  const desktopShot = path.join(os.tmpdir(), 'potential-outcomes-desktop.png');
  await host.screenshot({ path: desktopShot });
  for (const width of [375, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => document.documentElement.dataset.theme = 'dark');
    await fixed.click();
    assert(await host.evaluate((node) => node.scrollWidth <= node.clientWidth + 1));
    assert(await host.locator('.potential-outcomes').evaluate((node) => node.scrollWidth <= node.clientWidth + 1));
    if (width === 375) await host.screenshot({ path: path.join(os.tmpdir(), 'potential-outcomes-mobile-dark.png') });
    await reset.click();
  }
  // Mount a second instance, verify isolation, then verify event cleanup.
  const lifecycle = await page.evaluate(async () => {
    const { potentialOutcomesModel: model } = await import('@/features/components/models/potential-outcomes.js');
    const config = { parameters: { probabilities: [0.4, 0.2, 0.1, 0.3] } };
    const copy = document.createElement('div');
    document.body.append(copy);
    const destroy = model.mount(copy, config);
    const buttons = copy.querySelectorAll('.potential-outcomes__modes button');
    buttons[1].click();
    const otherUnchanged = document.querySelector('[data-model="potential-outcomes"] .potential-outcomes__ate-value').textContent === '+10.0 pp';
    destroy();
    buttons[0].click();
    const stopped = buttons[1].getAttribute('aria-pressed') === 'true';
    copy.remove();
    let rejected = 0;
    for (const probabilities of [[1, 1, 0, 0], [-0.1, 0.1, 0.5, 0.5], [1], [NaN, 0, 0, 0]]) {
      try { model.validate({ parameters: { probabilities } }); } catch { rejected++; }
    }
    return { otherUnchanged, stopped, rejected };
  });
  assert.deepEqual(lifecycle, { otherUnchanged: true, stopped: true, rejected: 4 });
  const noJS = await browser.newPage({ javaScriptEnabled: false });
  await noJS.goto(origin + '/zh/counterfactual-randomization', { waitUntil: 'domcontentloaded' });
  assert.match(await noJS.locator('[data-model="potential-outcomes"]').innerText(), /平均处理效应为 \+10 个百分点/);
  assert.deepEqual(errors, []);
  console.log('check-potential-outcomes: ok (defaults, sliders, boundaries, modes, presets, reset, keyboard, 320/375px, dark theme, isolation, cleanup, validation, no-JS fallback)');
  if (verifyTex) console.log('MathJax: ok (real CDN, formulas rendered, numeric updates preserve typesetting, hidden mode renders)');
  console.log(`Screenshots: ${desktopShot}; ${path.join(os.tmpdir(), 'potential-outcomes-mobile-dark.png')}`);
} finally {
  await browser?.close();
  server.close();
}
