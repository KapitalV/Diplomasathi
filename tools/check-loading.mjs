// Verify the performance mechanisms under slow CSS and browser fallbacks.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const url = process.env.SITE_URL || 'http://127.0.0.1:4173';
const results = [];
try {
  for (const width of [412, 1350]) {
    const context = await browser.newContext({ viewport: { width, height: 940 }, colorScheme: 'dark' });
    const page = await context.newPage();
    let releaseCSS;
    const cssGate = new Promise(resolve => { releaseCSS = resolve; });
    await context.route('**/*.css', async route => { await cssGate; await route.continue(); });
    let analyticsRequests = 0;
    await context.route('**/gtag/js?*', async route => {
      analyticsRequests++;
      await route.fulfill({ contentType: 'text/javascript', body: 'window.analyticsTestLoaded = true;' });
    });
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('.card').count(), 8, 'Cards must exist at DOMContentLoaded while CSS is pending');
    assert.equal(analyticsRequests, 0);
    assert.equal(await page.evaluate(() => window.dataLayer.length), 2);
    await page.evaluate(() => document.fonts.ready);
    await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });
    const geometry = () => page.evaluate(() => Object.fromEntries(['.navbar', '.hero', '.controls-wrap', '.cards-grid', '.card', '.footer'].map(selector => {
      const r = document.querySelector(selector).getBoundingClientRect();
      return [selector, [r.x, r.y, r.width, r.height]];
    })));
    const criticalGeometry = await geometry();
    for (const id of ['qvOverlay', 'loginOverlay', 'adminOverlay', 'contactBackdrop']) {
      assert.equal(await page.locator(`#${id}`).isVisible(), false);
    }
    releaseCSS();
    await page.waitForFunction(() => [...document.querySelectorAll('link')].some(link => link.rel === 'stylesheet'));
    assert.deepEqual(await geometry(), criticalGeometry, 'Full CSS must not change initial layout');
    await page.click('#darkBtn');
    await page.waitForFunction(() => window.analyticsTestLoaded);
    await page.keyboard.press('Tab');
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(200);
    assert.equal(analyticsRequests, 1, 'GA must load once across multiple interactions');
    results.push({ width, status: 'PASS', checks: ['cards at DOMContentLoaded with stylesheet pending', 'no initial analytics script', 'one analytics load after interaction', 'critical CSS matches complete CSS geometry', 'closed overlays hidden'] });
    await context.close();
  }
  const context = await browser.newContext();
  await context.addInitScript(() => { delete window.IntersectionObserver; });
  await context.route(/google-analytics\.com|googletagmanager\.com/, route => route.abort());
  const page = await context.newPage();
  await page.goto(url);
  assert.equal(await page.locator('.card-thumb-bg[src]').count(), 8);
  results.push({ status: 'PASS', checks: ['images get src with native lazy fallback when IntersectionObserver is unavailable'] });
  await context.close();
  console.log('PASS: loading behavior, critical CSS, analytics and image fallback.');
} finally {
  await writeFile('reports/loading-checks.json', JSON.stringify(results, null, 2));
  await browser.close();
}
