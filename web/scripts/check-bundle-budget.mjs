import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const html = readFileSync(resolve(root, 'dist/index.html'), 'utf8');
const scriptFiles = [...html.matchAll(/<script[^>]+src=["']([^"']+\.js)["']/g)].map((match) => match[1]);
const styleFiles = [...html.matchAll(/<link[^>]+href=["']([^"']+\.css)["'][^>]*>/g)].map((match) => match[1]);

const gzipSize = (file) => gzipSync(readFileSync(resolve(root, 'dist', file.replace(/^\.\//, '')))).byteLength;
const jsBytes = scriptFiles.reduce((total, file) => total + gzipSize(file), 0);
const cssBytes = styleFiles.reduce((total, file) => total + gzipSize(file), 0);
const limits = { js: 250 * 1024, css: 100 * 1024 };

const format = (bytes) => `${(bytes / 1024).toFixed(1)} KiB gzip`;
console.log(`Initial JS: ${format(jsBytes)} / ${format(limits.js)}`);
console.log(`Initial CSS: ${format(cssBytes)} / ${format(limits.css)}`);

if (jsBytes > limits.js || cssBytes > limits.css) {
  console.error('Initial bundle exceeds the configured performance budget.');
  process.exitCode = 1;
}
