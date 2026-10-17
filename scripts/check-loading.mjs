#!/usr/bin/env node
// Local browser regression for resource loading. Does not publish or change source files.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve('_site');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.wasm': 'application/wasm' };
const server = http.createServer((request, response) => {
  let file;
  try { file = path.resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://local').pathname)); }
  catch { response.writeHead(400).end(); return; }
  if (file !== root && !file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) file += '.html';
  if (!fs.existsSync(file)) { response.writeHead(404).end(); return; }
  response.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(response);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const url = origin + '/zh/event-and-probability-simulation';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
let failures = 0;
async function check(name, run) {
  try { await run(); console.log('PASS', name); }
  catch (error) { failures++; console.error('FAIL', name, error.stack); }
}
const context = async (mobile, blockMath = true) => {
  const ctx = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 }, isMobile: mobile, hasTouch: mobile });
  if (blockMath) await ctx.route('**/mathjax@*/**', (route) => route.abort());
  return ctx;
};
try {
  for (const mobile of [false, true]) await check(`${mobile ? 'mobile' : 'desktop'} loading, resize, retry, reload, first lightbox click`, async () => {
    const ctx = await context(mobile);
    try {
      const page = await ctx.newPage();
      const requests = [], errors = [];
      page.on('request', (r) => requests.push(r.url()));
      page.on('pageerror', (e) => errors.push(e.message));
      let failSurvey = true;
      await page.route('**/models/sensitivity-survey.js*', (r) => failSurvey ? r.abort() : r.continue());
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const first = page.locator('[data-model="buffon-needle"]');
      await first.waitFor();
      await page.waitForFunction(() => document.querySelector('[data-model="buffon-needle"]')?.dataset.componentMounted === 'true');
      assert(!requests.some((s) => /models\/(monty-hall|sensitivity-survey)\.js/.test(s)), 'offscreen models fetched');
      assert(!requests.some((s) => /lib\/(gallery|swiper)\.js/.test(s)), 'lightbox dependencies fetched before intent');
      const values = await first.locator('dd').allTextContents();
      await page.setViewportSize(mobile ? { width: 844, height: 390 } : { width: 1000, height: 800 });
      await page.waitForTimeout(250);
      assert.deepEqual(await first.locator('dd').allTextContents(), values, 'resize reran random simulation');
      await page.setViewportSize(mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 });
      await page.waitForFunction(() => [...document.querySelectorAll('.flyout__media')].every((el) => !!el.getAttribute('src')));
      const survey = page.locator('[data-model="sensitivity-survey"]');
      await survey.scrollIntoViewIfNeeded();
      await survey.locator('button', { hasText: '重新加载' }).waitFor();
      failSurvey = false;
      await survey.locator('button', { hasText: '重新加载' }).click();
      await page.waitForFunction(() => document.querySelector('[data-model="sensitivity-survey"]')?.dataset.componentMounted === 'true');
      const heading = page.locator('.js-article-body h2[id]').nth(1);
      await heading.evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 100, behavior: 'instant' }));
      await page.waitForFunction(() => document.querySelector('[data-model="monty-hall"]')?.dataset.componentMounted === 'true');
      await page.waitForTimeout(250);
      const before = await heading.evaluate((el) => el.getBoundingClientRect().top);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      const after = await heading.evaluate((el) => el.getBoundingClientRect().top);
      assert(Math.abs(after - before) <= 8, `anchor drift ${before} -> ${after}`);
      const image = page.locator('.js-article-body img').first();
      await image.scrollIntoViewIfNeeded();
      await image.click();
      await page.locator('.js-lightbox-modal.modal--show').waitFor();
      await page.keyboard.press('Escape');
      assert.deepEqual(errors, []);
      console.log(JSON.stringify({ mobile, anchorBefore: before, anchorAfter: after, scriptRequests: requests.filter((s) => s.includes('/scripts/')).length }));
      fs.mkdirSync('test-results/loading', { recursive: true });
      await page.screenshot({ path: `test-results/loading/${mobile ? 'mobile' : 'desktop'}.png` });
    } finally { await ctx.close(); }
  });
  await check('no JavaScript descriptions, dimensions and print fallback', async () => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    try {
      const page = await ctx.newPage(); await page.goto(url);
      assert.equal(await page.locator('[data-component] .interactive-component__title').count(), 3);
      assert(await page.locator('.js-article-body img').evaluateAll((els) => els.every((e) => e.width > 0 && e.getAttribute('height'))));
      await page.emulateMedia({ media: 'print' });
      assert(await page.locator('[data-component]').first().isVisible());
    } finally { await ctx.close(); }
  });
  if (process.argv.includes('--math')) {
    for (const mobile of [false, true]) await check(`live MathJax ${mobile ? 'mobile' : 'desktop'} restore and numbering`, async () => {
      const ctx = await context(mobile, false);
      try {
        const page = await ctx.newPage();
        const errors = []; page.on('pageerror', (e) => errors.push(e.message));
        await page.addInitScript(() => {
          window.longTasks = [];
          new PerformanceObserver((list) => longTasks.push(...list.getEntries().map((e) => Math.round(e.duration)))).observe({ type: 'longtask', buffered: true });
        });
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => document.querySelector('.js-article-body')?.dataset.mathReady === 'true', null, { timeout: 60000 });
        await page.waitForFunction(() => document.querySelector('mjx-container svg'), null, { timeout: 30000 });
        const header = page.locator('.js-article-body h2[id]').nth(1);
        await header.evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 100, behavior: 'instant' }));
        await page.waitForTimeout(2000);
        const before = await header.evaluate((el) => el.getBoundingClientRect().top);
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => document.querySelector('.js-article-body')?.dataset.mathReady === 'true', null, { timeout: 60000 });
        await page.waitForTimeout(2000);
        const after = await header.evaluate((el) => el.getBoundingClientRect().top);
        assert(Math.abs(after - before) < 12, `math anchor drift ${before} -> ${after}`);
        assert.equal(await page.locator('[data-mml-node="merror"]').count(), 0);
        console.log(JSON.stringify({ mobile, before, after, math: await page.evaluate(() => ({ tasks: longTasks, tags: MathJax.startup.document.inputJax[0].parseOptions.tags.allLabels })) }));
        assert.deepEqual(errors, []);
      } finally { await ctx.close(); }
    });
  }
  if (process.argv.includes('--extended')) {
    await check('legacy chart fences render on approach and resize', async () => {
      const ctx = await context(false);
      try {
        const page = await ctx.newPage();
        await page.route(url, async (route) => {
          const response = await route.fetch();
          const html = (await response.text()).replace('</article>', '<pre><code class="language-chart">{"type":"bar","data":{"labels":["A","B"],"datasets":[{"label":"Example","data":[1,2]}]}}</code></pre></article>');
          await route.fulfill({ response, body: html });
        });
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        const chart = page.locator('.language-chart');
        await chart.scrollIntoViewIfNeeded();
        await page.waitForFunction(() => document.querySelector('.language-chart')?.dataset.componentMounted === 'true', null, { timeout: 60000 });
        assert(await chart.locator('canvas').isVisible());
        await page.setViewportSize({ width: 390, height: 844 });
        await page.waitForTimeout(300);
        assert(await chart.locator('canvas').evaluate((el) => el.getBoundingClientRect().width <= innerWidth));
      } finally { await ctx.close(); }
    });
    await check('hash restore yields to user scroll and history return', async () => {
      const ctx = await context(false);
      try {
        const page = await ctx.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        const id = await page.locator('.js-article-body h2[id]').nth(1).getAttribute('id');
        await page.goto(url + '#' + encodeURIComponent(id), { waitUntil: 'domcontentloaded' });
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1500);
        assert(Math.abs(await page.evaluate((id) => document.getElementById(id).getBoundingClientRect().top, id)) < 8);
        await page.mouse.wheel(0, 450);
        await page.waitForTimeout(400);
        const before = await page.evaluate(() => scrollY);
        await page.evaluate(() => document.querySelector('.js-article-body').prepend(Object.assign(document.createElement('div'), { style: 'height:100px' })));
        await page.waitForTimeout(300);
        const after = await page.evaluate(() => scrollY);
        assert(Math.abs(after - before) <= 110, 'restoration overrode user scroll');
        await page.goto(origin + '/zh/');
        await page.goBack({ waitUntil: 'domcontentloaded' });
        assert(page.url().includes(encodeURIComponent(id)));
      } finally { await ctx.close(); }
    });
    await check('Mermaid near viewport and first zoom click', async () => {
      const ctx = await context(false);
      try {
        const page = await ctx.newPage(); const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));
        await page.goto(origin + '/zh/component-of-powerbi', { waitUntil: 'domcontentloaded' });
        const diagram = page.locator('.mermaid').first();
        await diagram.scrollIntoViewIfNeeded();
        await page.waitForFunction(() => document.querySelector('.mermaid[data-processed] svg'), null, { timeout: 60000 });
        await diagram.click();
        await page.locator('.js-mermaid-zoom-modal.modal--show').waitFor({ timeout: 20000 });
        assert.deepEqual(errors, []);
      } finally { await ctx.close(); }
    });
    await check('search engine remains on demand and opens on first click', async () => {
      const ctx = await context(false);
      try {
        const page = await ctx.newPage(); const requests = [];
        page.on('request', (r) => requests.push(r.url()));
        await page.goto(origin + '/zh/', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(300);
        assert(!requests.some((u) => u.includes('/pagefind/')));
        await page.locator('.js-search-toggle').first().click();
        await page.locator('#pagefind-search-input input').waitFor();
        await page.locator('#pagefind-search-input input').fill('概率');
        await page.waitForFunction(() => typeof PagefindModularUI !== 'undefined');
        await page.locator('#pagefind-search-results a').first().waitFor({ timeout: 15000 });
      } finally { await ctx.close(); }
    });
    await check('long math article: lazy SVG output and forward labels', async () => {
      const ctx = await context(true, false);
      try {
        const page = await ctx.newPage();
        await page.addInitScript(() => {
          window.longTasks = [];
          new PerformanceObserver((l) => longTasks.push(...l.getEntries().map((e) => Math.round(e.duration)))).observe({ type: 'longtask', buffered: true });
        });
        await page.goto(origin + '/zh/event-and-probability', { waitUntil: 'domcontentloaded' });
        const first = page.locator('[data-math-block]').first();
        await first.scrollIntoViewIfNeeded();
        await page.waitForFunction(() => document.querySelector('.js-article-body')?.dataset.mathReady === 'true', null, { timeout: 60000 });
        await page.waitForTimeout(1000);
        const stats = await page.evaluate(() => ({
          total: [...MathJax.startup.document.math].length,
          pending: document.querySelectorAll('mjx-lazy').length,
          labels: Object.keys(MathJax.startup.document.inputJax[0].parseOptions.tags.allLabels),
          maxTask: Math.max(0, ...longTasks),
          links: [...document.querySelectorAll('mjx-container a')].slice(0, 3).map((a) => a.outerHTML.slice(0, 300)),
        }));
        assert(stats.pending > 0, 'all math was rendered eagerly');
        assert(stats.labels.includes('eq:古典概型'), 'forward label not compiled');
        assert.equal(await page.locator('[data-mml-node="merror"]').count(), 0);
        console.log(JSON.stringify({ longMath: stats }));
        const reference = await page.evaluate(() => {
          const item = [...MathJax.startup.document.math].find((m) => /\\(?:eq)?ref\{/.test(m.math));
          const node = item?.typesetRoot || item?.start.node?.parentElement;
          node?.scrollIntoView({ block: 'center' });
          return item?.math;
        });
        assert(reference, 'reference fixture missing');
        await page.waitForTimeout(1000);
        const links = await page.locator('mjx-container a').evaluateAll((els) => els.map((el) => ({ href: el.getAttribute('href'), xlink: el.getAttribute('xlink:href'), data: el.getAttribute('data-mjx-href') })));
        console.log(JSON.stringify({ reference, links }));
      } finally { await ctx.close(); }
    });
  }
} finally { await browser.close(); server.close(); }
process.exitCode = failures ? 1 : 0;
