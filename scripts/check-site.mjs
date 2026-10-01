#!/usr/bin/env node
/**
 * BU-04/05 — scan `_site` for missing critical assets referenced by HTML.
 * Usage: node scripts/check-site.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const site = path.join(__dirname, '..', '_site');
if (!fs.existsSync(path.join(site, 'index.html'))) {
  console.error('check-site: _site/index.html missing');
  process.exit(1);
}
if (!fs.existsSync(path.join(site, 'pagefind'))) {
  console.error('check-site: _site/pagefind missing');
  process.exit(1);
}

const htmlFiles = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (name.endsWith('.html')) htmlFiles.push(p);
  }
}
walk(site);

const missing = [];
const re = /(?:href|src)=["'](\/[^"'#?]+)/g;
for (const file of htmlFiles.slice(0, 80)) {
  const text = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = re.exec(text))) {
    const rel = m[1].replace(/^\//, '');
    if (rel.startsWith('http')) continue;
    const target = path.join(site, rel);
    if (!fs.existsSync(target) && !rel.includes('pagefind')) {
      if (rel.startsWith('assets/') || rel.endsWith('.css') || rel.endsWith('.js')) {
        missing.push({ file: path.relative(site, file), rel });
      }
    }
  }
}

if (missing.length) {
  console.error('check-site: missing assets');
  console.error(missing.slice(0, 20));
  process.exit(1);
}
console.log(`check-site: ok (${htmlFiles.length} html scanned)`);
