#!/usr/bin/env node
/**
 * CF-06 — build with non-empty baseurl into a temp dir and assert prefixes.
 * Usage: node scripts/check-baseurl.mjs
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dest = fs.mkdtempSync(path.join(os.tmpdir(), 'statsphere-baseurl-'));
const base = '/tmp-base';

try {
  execSync(
    `bundle exec jekyll build --baseurl "${base}" --destination "${dest}"`,
    { cwd: root, stdio: 'inherit', env: { ...process.env, JEKYLL_ENV: 'production' } },
  );
  const index = path.join(dest, 'index.html');
  if (!fs.existsSync(index)) throw new Error('no index');
  const html = fs.readFileSync(index, 'utf8');
  const css = html.match(/href="([^"]+\.css)"/);
  if (css && css[1].startsWith('/') && !css[1].startsWith(base)) {
    throw new Error(`css href missing baseurl prefix: ${css[1]}`);
  }
  console.log('check-baseurl: ok', dest);
} catch (e) {
  console.error(e);
  process.exit(1);
}
