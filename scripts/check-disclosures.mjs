#!/usr/bin/env node
// Browser regression for the shared disclosure contract and the real article.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve('_site');
const article = fs.readFileSync(path.join(root, 'zh/counterfactual-randomization.html'), 'utf8');
const scriptBase = JSON.parse(article.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports['@/'];
const stylesheet = article.match(/<link rel="stylesheet" href=['"]([^'"]+)/)[1];
const fixture = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<link rel="stylesheet" href="${stylesheet}"><script type="importmap">{"imports":{"@/":"${scriptBase}"}}</script>
<style>body{max-width:760px;margin:24px auto;padding:16px}details{margin:24px 0}</style>
<main>${['first', 'second', 'third'].map((name) => `<details id="${name}" data-component-disclosure class="interactive-disclosure">
<summary class="interactive-disclosure__summary">${name} exploration</summary>
<div id="${name}-host" data-component="test" class="interactive-component" data-component-state="pending"><script type="application/json">{"version":1,"type":"test","name":"${name}"}</script><p>${name} fallback</p></div>
<div class="interactive-disclosure__print">${name} printable fallback</div></details>`).join('')}</main>
<script type="module">
import { init } from '@/features/components/runtime.js';
window.stats={loads:0,preloads:0,mounts:0,active:0,maxActive:0,ticks:{},destroyed:0};
window.failPreload=location.search.includes('fail-preload');window.failMount=location.search.includes('fail-mount');
const delay=(ms)=>new Promise(r=>setTimeout(r,ms));
const implementation={validate(){},async preload(c){stats.preloads++;await delay(120);stats.active--;if(c.name==='first'&&window.failPreload){window.failPreload=false;throw Error('fixture resource failure')}},
async mount(host,c){stats.mounts++;await delay(40);if(c.name==='first'&&window.failMount){window.failMount=false;throw Error('fixture mount failure')}
host.replaceChildren();const input=document.createElement('input');input.type='range';input.value='30';host.append(input);
const target=document.createElement('p');target.id=c.name+'-result';target.textContent='Interactive result';host.append(target);
let paused=false;const timer=setInterval(()=>{if(!paused)stats.ticks[c.name]=(stats.ticks[c.name]||0)+1},20);
return {pause(){paused=true},resume(){paused=false},resize(){host.dataset.width=host.clientWidth},destroy(){clearInterval(timer);stats.destroyed++}}}};
window.dispose=init({registry:new Map([['test',async()=>{stats.loads++;stats.active++;stats.maxActive=Math.max(stats.maxActive,stats.active);await delay(80);return implementation}]])});
window.fixtureReady=true;
</script></html>`;
const chartFixture = `<!doctype html><html lang="en"><meta charset="utf-8">
<link rel="stylesheet" href="${stylesheet}"><script type="importmap">{"imports":{"@/":"${scriptBase}"}}</script>
<details data-component-disclosure id="chart-demo" class="interactive-disclosure"><summary>Chart exploration</summary>
<div id="chart-host" class="interactive-component" data-component="chart"><script type="application/json">{"version":1,"type":"chart","chart":{"type":"bar","data":{"labels":["A"],"datasets":[{"data":[2]}]}}}</script><p>Chart fallback</p></div></details>
<script type="module" data-component-runtime data-chart-src="/fixture-chart.js" src="${scriptBase}entries/components.js"></script></html>`;
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = http.createServer((request, response) => {
  const url = new URL(request.url, 'http://local');
  if (url.pathname === '/fixture') { response.setHeader('Content-Type', mime['.html']); response.end(fixture); return; }
  if (url.pathname === '/chart-fixture') { response.setHeader('Content-Type', mime['.html']); response.end(chartFixture); return; }
  if (url.pathname === '/fixture-chart.js') {
    response.setHeader('Content-Type', mime['.js']);
    response.end('window.chartCount=0;window.Chart=class{constructor(ctx){window.chartCount++;window.chartWidth=ctx.canvas.clientWidth}resize(){window.chartResized=true}destroy(){}}'); return;
  }
  let file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
  if (!file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) file += '.html';
  if (!fs.existsSync(file)) { response.writeHead(404).end(); return; }
  response.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(response);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
let failures = 0;
async function check(name, run) {
  try { await run(); console.log('PASS', name); }
  catch (error) { failures++; console.error('FAIL', name, error.stack); }
}
async function fixturePage(query = '', saveData = false) {
  const page = await browser.newPage();
  if (saveData) await page.addInitScript(() => Object.defineProperty(navigator, 'connection', { value: { saveData: true } }));
  await page.goto(origin + '/fixture' + query);
  await page.waitForFunction(() => window.fixtureReady);
  return page;
}
const ready = (page, id = 'first-host') => page.waitForFunction((id) => document.getElementById(id)?.dataset.componentReady === 'true', id);
try {
  await check('nearby prefetch is bounded and does not mount closed components', async () => {
    const page = await fixturePage();
    await page.waitForFunction(() => stats.preloads === 3);
    assert.equal(await page.evaluate(() => stats.mounts), 0);
    assert(await page.evaluate(() => stats.maxActive <= 2));
    await page.locator('#first > summary').click(); await ready(page);
    const input = page.locator('#first-host input'); await input.fill('70');
    const mounts = await page.evaluate(() => stats.mounts);
    await page.locator('#first > summary').click();
    await page.waitForTimeout(80);
    const paused = await page.evaluate(() => stats.ticks.first);
    await page.waitForTimeout(100);
    assert.equal(await page.evaluate(() => stats.ticks.first), paused);
    // A foreground event must not resume a closed instance.
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await page.waitForTimeout(80);
    assert.equal(await page.evaluate(() => stats.ticks.first), paused);
    const started = performance.now();
    await page.locator('#first > summary').click();
    assert.equal(await input.inputValue(), '70');
    assert.equal(await page.evaluate(() => stats.mounts), mounts);
    await page.waitForFunction(() => Number(document.getElementById('first-host').dataset.width) > 0);
    console.log('  warm reopen including automation:', Math.round(performance.now() - started), 'ms');
    await page.waitForFunction((before) => stats.ticks.first > before, paused);
    await page.reload(); await ready(page);
    assert(await page.locator('#first').evaluate((d) => d.open));
    await page.locator('#first > .interactive-disclosure__close').click();
    assert(await page.locator('#first > summary').evaluate((s) => s === document.activeElement));
    await page.evaluate(() => window.dispose());
    assert.equal(await page.evaluate(() => stats.destroyed), 1);
    await page.close();
  });
  await check('save-data skips intent/nearby fetch; close during cold prepare defers mount', async () => {
    const page = await fixturePage('', true);
    await page.locator('#first > summary').focus(); await page.waitForTimeout(250);
    assert.equal(await page.evaluate(() => stats.loads), 0);
    await page.locator('#first > summary').click();
    await page.waitForFunction(() => stats.loads === 1);
    await page.locator('#first > summary').click();
    await page.waitForTimeout(300);
    assert.equal(await page.evaluate(() => stats.mounts), 0);
    await page.locator('#first > summary').click(); await ready(page);
    assert.equal(await page.evaluate(() => stats.mounts), 1);
    await page.close();
  });
  await check('speculative failure is silent and click retries; mount failure keeps fallback', async () => {
    const page = await fixturePage('?fail-preload');
    await page.waitForFunction(() => document.getElementById('first-host').dataset.componentResources === 'error');
    assert.equal(await page.locator('.interactive-component__error').count(), 0);
    await page.locator('#first > summary').click(); await ready(page);
    await page.goto(origin + '/fixture?fail-mount');
    await page.waitForFunction(() => window.fixtureReady);
    await page.locator('#first').evaluate((d) => { d.open = true; });
    await page.locator('#first-host .interactive-component__error').waitFor();
    assert.match(await page.locator('#first-host').innerText(), /first fallback/);
    await page.getByRole('button', { name: '重新加载', exact: true }).click(); await ready(page);
    assert.equal(await page.locator('#first-host input').count(), 1);
    await page.close();
  });
  await check('deep links reveal static and dynamically mounted targets', async () => {
    const page = await fixturePage('#second-host/second-result');
    await ready(page, 'second-host');
    assert(await page.locator('#second').evaluate((d) => d.open));
    await page.evaluate(() => { location.hash = '#third-host'; });
    await ready(page, 'third-host');
    assert(await page.locator('#third').evaluate((d) => d.open));
    await page.close();
  });
  await check('collapsed summaries stay visible during reading-anchor restoration', async () => {
    const page = await fixturePage('', true);
    const state = await page.evaluate(async () => {
      const { isDisclosed, openAncestors } = await import('@/features/components/disclosure.js');
      const summary = document.querySelector('#first > summary');
      const host = document.getElementById('first-host');
      const visible = [isDisclosed(summary), isDisclosed(host)];
      openAncestors(summary);
      return { visible, open: summary.parentElement.open };
    });
    assert.deepEqual(state, { visible: [true, false], open: false });
    await page.close();
  });
  await check('printing shows fallback without mounting and restores open state', async () => {
    const page = await fixturePage('', true);
    await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(100);
    assert.equal(await page.evaluate(() => stats.mounts), 0);
    assert(await page.locator('#first > .interactive-disclosure__print').isVisible());
    assert(!await page.locator('#first-host').isVisible());
    await page.emulateMedia({ media: 'screen' });
    await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
    assert.equal(await page.locator('details[open]').count(), 0);
    await page.close();
  });
  await check('ordinary Chart renderer supports preload, visible sizing and instance reuse', async () => {
    const page = await browser.newPage();
    await page.goto(origin + '/chart-fixture');
    await page.waitForFunction(() => window.Chart);
    assert.equal(await page.evaluate(() => window.chartCount), 0);
    await page.locator('summary').click(); await ready(page, 'chart-host');
    assert(await page.evaluate(() => window.chartWidth > 0));
    await page.locator('summary').click(); await page.locator('summary').click();
    await page.waitForFunction(() => window.chartResized);
    assert.equal(await page.evaluate(() => window.chartCount), 1);
    await page.close();
  });
  for (const mobile of [false, true]) await check(`real article ${mobile ? 'mobile' : 'desktop'}: four collapsed demos, independent controls and no overflow`, async () => {
    const page = await browser.newPage({ viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 }, isMobile: mobile, hasTouch: mobile });
    const errors = []; page.on('pageerror', (e) => errors.push(e.message));
    if (!process.argv.includes('--math')) await page.route('**/mathjax@*/**', (route) => route.abort());
    await page.goto(origin + '/zh/counterfactual-randomization', { waitUntil: 'domcontentloaded' });
    const details = page.locator('[data-component-disclosure]');
    assert.equal(await details.count(), 4);
    assert.equal(await page.locator('[data-component-disclosure][open]').count(), 0);
    assert.equal(await page.locator('[data-component-mounted]').count(), 0);
    for (let i = 0; i < 4; i++) {
      const detail = details.nth(i), host = detail.locator(':scope > [data-component]');
      const start = performance.now();
      await detail.locator(':scope > summary').click();
      await host.locator('input[type="range"]').first().waitFor();
      await page.waitForFunction((id) => document.getElementById(id)?.dataset.componentReady === 'true', await host.getAttribute('id'));
      console.log(`  ${mobile ? 'mobile' : 'desktop'} demo ${i + 1}: click to ready including automation ${Math.round(performance.now() - start)} ms`);
      const range = host.locator('input[type="range"]').first();
      const value = await range.inputValue();
      const next = await range.evaluate((input) => String(Math.min(Number(input.max), Number(input.value) + (Number(input.step) || 0.01))));
      await range.fill(next);
      const content = await host.textContent();
      await detail.locator(':scope > .interactive-disclosure__close').click();
      await detail.locator(':scope > summary').click();
      assert.equal(await range.inputValue(), next);
      if (!process.argv.includes('--math')) assert.equal(await host.textContent(), content);
      await range.fill(value);
      if (process.argv.includes('--math')) {
        const formula = host.locator('[data-component-math]').first();
        await formula.scrollIntoViewIfNeeded();
        await formula.locator('mjx-container svg').first().waitFor({ timeout: 60000 });
        assert.equal(await host.locator('mjx-merror').count(), 0);
        const mathCount = await formula.locator('mjx-container').count();
        await detail.locator(':scope > .interactive-disclosure__close').click();
        await detail.locator(':scope > summary').click();
        assert.equal(await formula.locator('mjx-container').count(), mathCount);
      }
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await detail.locator(':scope > .interactive-disclosure__close').click();
    }
    await page.locator('.js-theme-toggle').evaluate((button) => button.click());
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    fs.mkdirSync('test-results/disclosures', { recursive: true });
    await details.first().scrollIntoViewIfNeeded();
    await details.first().screenshot({ path: `test-results/disclosures/${mobile ? 'mobile' : 'desktop'}-collapsed.png` });
    assert.deepEqual(errors, []);
    await page.close();
  });
  await check('no-JS article preserves native expansion and printable explanations', async () => {
    const page = await browser.newPage({ javaScriptEnabled: false });
    await page.goto(origin + '/zh/counterfactual-randomization');
    const detail = page.locator('[data-component-disclosure]').first();
    await detail.locator('summary').click();
    assert(await detail.locator('[data-component] > p').isVisible());
    await detail.locator('summary').click();
    await page.emulateMedia({ media: 'print' });
    assert(await detail.locator('.interactive-disclosure__print').isVisible());
    await page.close();
  });
} finally {
  await browser.close(); await new Promise((resolve) => server.close(resolve));
}
if (failures) process.exitCode = 1;
