// Cold-cache Lighthouse audit. Run: node tools/audit.mjs URL LABEL
// PERF_TOOLS can point to an external node_modules while capturing the baseline.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(process.env.PERF_TOOLS ? `${process.env.PERF_TOOLS}/package.json` : import.meta.url);
const { default: lighthouse } = await import(pathToFileURL(require.resolve('lighthouse')).href);
const { launch } = await import(pathToFileURL(require.resolve('chrome-launcher')).href);
const { default: desktopConfig } = await import(pathToFileURL(require.resolve('lighthouse/core/config/desktop-config.js')).href);
const [url, label = 'audit'] = process.argv.slice(2);
await mkdir('reports', { recursive: true });
for (const desktop of [false, true]) {
  const profile = desktop ? 'desktop' : 'mobile';
  if (process.env.AUDIT_PROFILE && process.env.AUDIT_PROFILE !== profile) continue;
  const chrome = await launch({ chromePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', chromeFlags: ['--headless=new', '--no-first-run'] });
  try {
    const result = await lighthouse(url, {
      port: chrome.port, onlyCategories: ['performance'], output: ['json', 'html'],
      // Chrome Fast 4G targets: 60 ms RTT, 9 Mbps, 4x mobile CPU.
      // DevTools request-level values include Chrome's calibration factors.
      throttlingMethod: 'simulate',
      throttling: { rttMs: 60, throughputKbps: 9000, requestLatencyMs: 165, downloadThroughputKbps: 8100, uploadThroughputKbps: 1350, cpuSlowdownMultiplier: desktop ? 1 : 4 },
    }, desktop ? desktopConfig : undefined);
    const lhr = result.lhr;
    const prefix = `reports/${label}-${profile}`;
    await writeFile(`${prefix}.json`, result.report[0]);
    await writeFile(`${prefix}.html`, result.report[1]);
    const a = lhr.audits;
    const requests = a['network-requests'].details.items.filter(r => /^https?:/.test(r.url));
    const summary = {
      url, profile, lighthouseVersion: lhr.lighthouseVersion, fetched: lhr.fetchTime,
      performance: lhr.categories.performance.score * 100,
      lcpMs: a['largest-contentful-paint'].numericValue, cls: a['cumulative-layout-shift'].numericValue,
      inpMs: null, inpNote: 'Navigation Lighthouse does not measure field INP.',
      tbtMs: a['total-blocking-time'].numericValue,
      transferredBytes: requests.reduce((n, r) => n + (r.transferSize || 0), 0), requestCount: requests.length,
      warnings: lhr.runWarnings, runtimeError: lhr.runtimeError,
    };
    await writeFile(`${prefix}-summary.json`, JSON.stringify(summary, null, 2));
    const rows = requests.map(r => {
      const third = new URL(r.url).origin !== new URL(url).origin;
      const blocking = label.startsWith('before') && (r.resourceType === 'Stylesheet' || /\/script.js/.test(r.url));
      const placement = r.statusCode >= 400 ? 'unused: failed request' : r.resourceType === 'Image'
        ? (/photo-1456513080510/.test(r.url) ? 'above-fold first card; also shared below-fold' : 'below-fold')
        : /google(?:tagmanager|-analytics)/.test(r.url) ? 'analytics; no visual content' : 'above-fold dependency';
      const unused = ['unused-javascript', 'unused-css-rules'].flatMap(id => a[id]?.details?.items || []).find(item => item.url === r.url);
      const unusedLabel = unused ? `; ${Math.round(unused.wastedPercent || 100 * unused.wastedBytes / unused.totalBytes)}% unused during navigation (interaction code retained)` : '';
      return `| ${r.url.replaceAll('|', '%7C')} | ${r.resourceType} | ${r.statusCode} | ${r.transferSize || 0} | ${blocking ? 'render/parser-blocking' : 'non-blocking'}; ${third ? 'third-party' : 'first-party'}; ${placement}${unusedLabel} |`;
    });
    await writeFile(`${prefix}-requests.md`, `# ${label} ${profile}: all HTTP requests\n\nCaptured ${lhr.fetchTime}. Byte counts include response headers where Lighthouse reports them. Classification is contextual; shared CSS/JS contains both initial and interaction-only code. See the raw report for unused CSS/JS coverage (unused during navigation does not mean safe to delete).\n\n| URL | Type | Status | Bytes | Classification |\n|---|---|---|---:|---|\n${rows.join('\n')}\n`);
    console.log(JSON.stringify(summary));
  } finally {
    // Windows may briefly retain a lock on Chrome's temporary profile after exit.
    try { await chrome.kill(); } catch (error) { console.warn(`Chrome cleanup: ${error.code || error.message}`); }
  }
}
