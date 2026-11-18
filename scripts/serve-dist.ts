// Serves dist/ the way Vercel does with vercel.json, to check pre-rendered pages locally:
//   exact file → <path>.html (cleanUrls) → <path>/index.html → vercel.json rewrites → 404,
// with vercel.json's response headers (so the Content-Security-Policy can be checked too).
// Run with: npm run preview:static   (after npm run build), then open http://localhost:4174
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const config = JSON.parse(readFileSync(fileURLToPath(new URL('../vercel.json', import.meta.url)), 'utf8')) as {
  rewrites?: Array<{ source: string; destination: string }>;
  headers?: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
};
const PORT = Number(process.env.PORT ?? 4174);
const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.txt': 'text/plain', '.woff2': 'font/woff2',
};

// vercel.json sources use path-to-regexp; ":name*" means any number of segments.
const pattern = (source: string) => new RegExp(`^${source.replace(/:\w+\*/g, '.*').replace(/:\w+/g, '[^/]+')}$`);
const rewrites = (config.rewrites ?? []).map((r) => ({ re: pattern(r.source), destination: r.destination }));
const headerRules = (config.headers ?? []).map((h) => ({ re: pattern(h.source), headers: h.headers }));

const file = (rel: string) => {
  const p = normalize(join(root, rel));
  return p.startsWith(root) && existsSync(p) && statSync(p).isFile() ? p : null;
};

createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
  const rule = rewrites.find((r) => r.re.test(path));
  const hit = file(path) ?? file(`${path}.html`) ?? file(join(path, 'index.html')) ?? (rule ? file(rule.destination) : null);
  if (!hit) {
    res.writeHead(404).end('Not found');
    return;
  }
  const headers: Record<string, string> = {};
  for (const rule of headerRules) if (rule.re.test(path)) for (const h of rule.headers) headers[h.key] = h.value;
  res.writeHead(200, { ...headers, 'content-type': TYPES[extname(hit)] ?? 'application/octet-stream' });
  res.end(readFileSync(hit));
}).listen(PORT, () => console.log(`dist/ served like Vercel (vercel.json) at http://localhost:${PORT}`));
