// Serves dist/ the way Cloudflare Pages does, to check pre-rendered pages locally:
//   exact file → <path>.html → <path>/index.html → _redirects 200 rewrites → index.html (SPA fallback).
// Run with: npm run preview:static   (after npm run build), then open http://localhost:4174
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const PORT = Number(process.env.PORT ?? 4174);
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.txt': 'text/plain', '.woff2': 'font/woff2',
};

const rewrites = existsSync(join(root, '_redirects'))
  ? readFileSync(join(root, '_redirects'), 'utf8').split('\n').map((l) => l.trim().split(/\s+/)).filter((p) => p.length >= 3 && p[2] === '200')
  : [];

const file = (rel: string) => {
  const p = normalize(join(root, rel));
  return p.startsWith(root) && existsSync(p) && statSync(p).isFile() ? p : null;
};

createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
  const rule = rewrites.find(([from]) => (from.endsWith('/*') ? path.startsWith(from.slice(0, -1)) : path === from));
  const hit =
    file(path) ?? file(`${path}.html`) ?? file(join(path, 'index.html')) ?? (rule ? file(rule[1]) : null) ?? file('index.html');
  res.writeHead(200, { 'content-type': TYPES[extname(hit!)] ?? 'application/octet-stream' });
  res.end(readFileSync(hit!));
}).listen(PORT, () => console.log(`dist/ served like Cloudflare Pages at http://localhost:${PORT}`));
