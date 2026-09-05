// Recreate the exact pre-optimization sources without changing this checkout.
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
const root = path.join(tmpdir(), 'diplomasathi-perf', 'before');
await mkdir(root, { recursive: true });
for (const name of ['index.html', 'style.css', 'script.js']) {
  const content = execFileSync('git', ['show', `beed5af3af89516e8f30691d999105c5cb06760b:${name}`]);
  await writeFile(path.join(root, name), content);
}
process.argv[2] = root;
process.argv[3] = '4174';
await import('./serve.mjs');
