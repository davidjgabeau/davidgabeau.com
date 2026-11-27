// Only this directory is served statically. Camera originals stay in a function bundle.
import fs from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd(), output = path.join(root, 'public-site');
await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(output, { recursive: true });
const excluded = new Set(['public-site', 'private', 'api', 'lib', 'assets', 'scripts', 'node_modules', 'package.json', 'package-lock.json', 'vercel.json']);
for (const item of await fs.readdir(root, { withFileTypes: true })) {
  if (item.name.startsWith('.') || item.name.startsWith('docs-') || excluded.has(item.name)) continue;
  await fs.cp(path.join(root, item.name), path.join(output, item.name), { recursive: true });
}
console.log('Prepared public site; camera roll originals are excluded from static hosting.');
