#!/usr/bin/env node
// Browser integration smoke test for optional post renderers. CDN responses are
// stubbed so this verifies site wiring without depending on a network service.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve('_site');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };
const server = http.createServer((request, response) => {
  let file = path.resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://local').pathname));
  if (file !== root && !file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) file += '.html';
  if (!fs.existsSync(file)) { response.writeHead(404).end(); return; }
  response.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(response);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const fixtures = `
<div data-component="plotly"><script type="application/json">{"version":1,"type":"plotly","title":"Plotly fixture","data":[{"x":[1,2],"y":[2,3]}]}</script><p>Plotly fallback</p></div>
<div data-component="observable-plot"><script type="application/json">{"version":1,"type":"observable-plot","title":"Plot fixture","data":[{"x":"A","y":2}],"mark":"bar","x":"x","y":"y"}</script><p>Plot fallback</p></div>
<div data-component="media"><script type="application/json">{"version":1,"type":"media","engine":"video","title":"Video fixture","src":"/assets/video/fixture.mp4","poster":"/assets/images/fixture.jpg","captions":"/assets/video/fixture.vtt"}</script><p>Video fallback</p></div>
<div data-component="media"><script type="application/json">{"version":1,"type":"media","engine":"dotLottie","title":"Animation fixture","src":"/assets/animation/fixture.lottie"}</script><p>Animation fallback</p></div>
<div data-component="media"><script type="application/json">{"version":1,"type":"media","engine":"rive","title":"Rive fixture","src":"/assets/animation/fixture.riv"}</script><p>Rive fallback</p></div>
<div data-component="media"><script type="application/json">{"version":1,"type":"media","engine":"dotLottie","title":"Broken animation fixture","src":"/assets/animation/missing.lottie"}</script><p>Missing animation fallback</p></div>`;
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/plotly-4.1.1.min.js', (route) => route.fulfill({ contentType: 'text/javascript', body: `window.Plotly={newPlot:async(el)=>{el.dataset.rendered='plotly'},purge:(el)=>{el.dataset.purged='true'}};` }));
  await page.route(/\/plot@0\.6\.17\/\+esm/, (route) => route.fulfill({ contentType: 'text/javascript', headers: { 'Access-Control-Allow-Origin': '*' }, body: `export const barY=()=>({});export const lineY=()=>({});export const dot=()=>({});export const plot=()=>{const el=document.createElement('svg');el.dataset.rendered='observable';return el};` }));
  await page.route(/\/dotlottie-web@0\.81\.0\/\+esm/, (route) => route.fulfill({ contentType: 'text/javascript', headers: { 'Access-Control-Allow-Origin': '*' }, body: `export class DotLottie{constructor(options){this.isPlaying=true;this.handlers={};queueMicrotask(()=>this.handlers[options.src.includes('missing')?'loadError':'load']?.())}addEventListener(name,fn){this.handlers[name]=fn}pause(){this.isPlaying=false}play(){this.isPlaying=true}resize(){}destroy(){window.dotDestroyed=true}}` }));
  await page.route(/\/canvas@2\.45\.0\/\+esm/, (route) => route.fulfill({ contentType: 'text/javascript', headers: { 'Access-Control-Allow-Origin': '*' }, body: `export class Rive{constructor(options){this.isPlaying=true;queueMicrotask(options.onLoad)}pause(){this.isPlaying=false}play(){this.isPlaying=true}resizeDrawingSurfaceToCanvas(){}cleanup(){window.riveDestroyed=true}}` }));
  for (const [pattern, name] of [[/\/d3@7\.9\.0\/\+esm/, 'd3'], [/\/pixi\.js@8\.22\.0\/\+esm/, 'pixi'], [/\/gsap@3\.13\.0\/\+esm/, 'gsap']]) {
    await page.route(pattern, (route) => route.fulfill({ contentType: 'text/javascript', headers: { 'Access-Control-Allow-Origin': '*' }, body: `export const fixture='${name}';` }));
  }
  await page.route(origin + '/zh/event-and-probability-simulation', (route) => {
    const html = fs.readFileSync(path.join(root, 'zh/event-and-probability-simulation.html'), 'utf8');
    return route.fulfill({ contentType: 'text/html; charset=utf-8', body: html.replace('</article>', fixtures + '</article>') });
  });
  await page.goto(origin + '/zh/event-and-probability-simulation', { waitUntil: 'domcontentloaded' });
  for (const name of ['plotly', 'observable-plot']) {
    const host = page.locator(`[data-component="${name}"]`).last();
    await host.scrollIntoViewIfNeeded();
    try { await host.locator('[data-rendered]').waitFor({ state: 'attached', timeout: 15000 }); }
    catch (error) { console.error(name, await host.getAttribute('data-component-state'), await host.innerText(), errors,
      await page.evaluate(() => ({ count: document.querySelectorAll('[data-component]').length,
        script: document.querySelector('[data-component-runtime]')?.src,
        states: [...document.querySelectorAll('[data-component]')].map((el) => [el.dataset.component, el.dataset.componentState]),
        parent: document.querySelector('[data-component="plotly"]')?.parentElement?.tagName,
        ready: document.readyState }))); throw error; }
    assert.equal(await host.locator('p').count(), 0, `${name} fallback remained after mount`);
  }
  const media = page.locator('[data-component="media"]');
  for (let i = 0; i < 3; i++) {
    await media.nth(i).scrollIntoViewIfNeeded();
    await page.waitForFunction((index) => document.querySelectorAll('[data-component="media"]')[index]?.dataset.componentMounted === 'true', i);
  }
  assert(await media.nth(0).locator('video[controls]').count());
  assert.equal(await media.nth(0).locator('track[kind="captions"]').count(), 1);
  assert.equal(await media.nth(0).locator('video').getAttribute('poster'), origin + '/assets/images/fixture.jpg');
  await media.nth(1).getByRole('button', { name: '暂停' }).click();
  assert(await media.nth(1).getByRole('button', { name: '播放' }).count());
  await media.nth(3).scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelectorAll('[data-component="media"]')[3]?.dataset.componentState === 'error');
  assert.match(await media.nth(3).innerText(), /Missing animation fallback/);
  assert.match(await media.nth(3).innerText(), /动画资源加载失败/);
  const libraries = await page.evaluate(async () => {
    const { loadVisualLibrary } = await import('@/features/components/libraries.js');
    return Promise.all(['d3', 'pixi', 'gsap'].map(async (name) => (await loadVisualLibrary(name)).fixture));
  });
  assert.deepEqual(libraries, ['d3', 'pixi', 'gsap']);
  assert.deepEqual(errors, []);
  console.log('check-components: ok (Plotly, Observable Plot, video, dotLottie, Rive, D3, PixiJS, GSAP)');
} finally {
  await browser.close();
  server.close();
}
