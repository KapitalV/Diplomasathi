// Rebuild human-readable inventories and comparison tables from saved audits.
import { readdir, readFile, writeFile } from 'node:fs/promises';
const files = await readdir('reports');
for (const file of files.filter(name => name.endsWith('-summary.json'))) {
  const prefix = file.replace('-summary.json', '');
  const r = JSON.parse(await readFile(`reports/${prefix}.json`, 'utf8'));
  const baseline = prefix.startsWith('before');
  const requests = r.audits['network-requests'].details.items.filter(item => /^https?:/.test(item.url));
  const rows = requests.map(item => {
    const thirdParty = new URL(item.url).origin !== new URL(r.finalDisplayedUrl).origin;
    const blocking = baseline && (item.resourceType === 'Stylesheet' || /\/script.js/.test(item.url));
    const role = item.statusCode >= 400 ? 'unused: failed request' : item.resourceType === 'Image'
      ? (/photo-1456513080510/.test(item.url) ? 'above-fold first card; shared below-fold' : 'below-fold')
      : /google(?:tagmanager|-analytics)/.test(item.url) ? 'analytics; no visual content' : 'above-fold dependency';
    const unused = ['unused-javascript', 'unused-css-rules'].flatMap(id => r.audits[id]?.details?.items || []).find(entry => entry.url === item.url);
    const coverage = unused ? `; ${Math.round(unused.wastedPercent || 100 * unused.wastedBytes / unused.totalBytes)}% unused during navigation` : '';
    return `| ${item.url.replaceAll('|', '%7C')} | ${item.resourceType} | ${item.statusCode} | ${item.transferSize || 0} | ${blocking ? 'render/parser-blocking' : 'non-blocking'}; ${thirdParty ? 'third-party' : 'first-party'}; ${role}${coverage} |`;
  });
  await writeFile(`reports/${prefix}-requests.md`, `# ${prefix}: every HTTP request\n\nCaptured ${r.fetchTime}. Data URLs are embedded assets, not network transfers. Byte counts include response headers where reported. Above-fold classification uses the captured viewport: the first shared book photo reaches the fold on both profiles; other branch photos are lower down. Navigation-only unused coverage does not justify deleting interaction code. CSS and app JS also contain below-fold and interaction styles/handlers.\n\n| URL | Type | Status | Bytes | Classification |\n|---|---|---|---:|---|\n${rows.join('\n')}\n`);
}
const table = async labels => {
  const rows = [];
  for (const label of labels) for (const profile of ['mobile', 'desktop']) {
    const s = JSON.parse(await readFile(`reports/${label}-${profile}-summary.json`, 'utf8'));
    rows.push(`| [${label} ${profile}](${label}-${profile}.html) | ${s.performance} | ${(s.lcpMs / 1000).toFixed(2)} | ${s.cls.toFixed(4)} | unavailable | ${Math.round(s.tbtMs)} | ${(s.transferredBytes / 1000).toFixed(1)} | ${s.requestCount} |`);
  }
  return `| Audit | Performance | LCP (s) | CLS | INP | TBT (ms) | Transfer (KB) | Requests |\n|---|---:|---:|---:|---|---:|---:|---:|\n${rows.join('\n')}`;
};
let report = await readFile('reports/performance-report.md', 'utf8');
report = report.replace(/<!-- exact:start -->[\s\S]*?<!-- exact:end -->/, `<!-- exact:start -->\n${await table(['before-fast4g-live', 'before-fast4g-local', 'verified-local'])}\n<!-- exact:end -->`);
report = report.replace(/<!-- tuning:start -->[\s\S]*?<!-- tuning:end -->/, `<!-- tuning:start -->\n${await table(['final-fast4g-local', 'release-fast4g-local', 'final-assets-local'])}\n<!-- tuning:end -->`);
report = report.replace(/<!-- phases:start -->[\s\S]*?<!-- phases:end -->/, `<!-- phases:start -->\n${await table(['before-live', 'before-local', 'after-local', 'final-local'])}\n<!-- phases:end -->`);
await writeFile('reports/performance-report.md', report);
console.log('Updated report tables and all request inventories from saved Lighthouse JSON.');
