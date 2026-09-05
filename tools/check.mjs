// Browser regression checks against an untouched baseline and the deploy build.
// Start baseline on 4174 and production preview on 4173 before running npm test.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
await mkdir('reports/screenshots', { recursive: true });
const results = [];
const behaviors = {};
try {
  for (const [label, url] of [['before', 'http://127.0.0.1:4174'], ['after', process.env.SITE_URL || 'http://127.0.0.1:4173']]) {
    for (const mobile of [true, false]) {
      const profile = mobile ? 'mobile' : 'desktop';
      console.log(`Checking ${label} ${profile}`);
      const context = await browser.newContext({ viewport: mobile ? { width: 412, height: 823 } : { width: 1350, height: 940 }, colorScheme: 'dark' });
      // Prevent analytics test traffic. The separate Lighthouse audits use the
      // real network, without interception or resource blocking.
      await context.route(/google-analytics\.com|googletagmanager\.com/, route => route.abort());
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(() => {
        window.testOpened = [];
        window.open = (...args) => { window.testOpened.push(args); return null; };
        window.testEvents = [];
        new PerformanceObserver(list => {
          for (const e of list.getEntries()) if (e.interactionId) window.testEvents.push({ name: e.name, duration: e.duration });
        }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
      });
      await page.goto(url);
      await page.waitForSelector('.card');
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1500);
      // Freeze animation only for deterministic visual comparisons.
      await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}' });
      const signatures = {};
      for (const theme of ['dark', 'light']) {
        if (await page.locator('html').getAttribute('data-theme') !== theme) await page.click('#darkBtn');
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: `reports/screenshots/${label}-${profile}-${theme}-top.png` });
        await page.locator('.card').first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(700);
        await page.screenshot({ path: `reports/screenshots/${label}-${profile}-${theme}-cards.png` });
        signatures[theme] = await page.evaluate(() => {
          const selectors = ['.navbar', '.hero', '.hero h1', '.hero-sub', '.controls-wrap', '.cards-grid', '.card', '.card-title', '.card-thumb', '.footer'];
          return Object.fromEntries(selectors.map(selector => {
            const el = document.querySelector(selector), r = el.getBoundingClientRect(), s = getComputedStyle(el);
            return [selector, { width: r.width, height: r.height, font: s.font, color: s.color, background: s.backgroundColor }];
          }));
        });
      }
      // Theme storage survives reload.
      await page.reload();
      await page.waitForSelector('.card');
      assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
      assert.equal(await page.evaluate(() => localStorage.getItem('ds-theme')), 'light');
      const cardIds = () => page.locator('.card').evaluateAll(cards => cards.map(c => c.dataset.id));
      const initial = await cardIds();
      assert.equal(initial.length, 8);
      const filters = {};
      for (const id of ['fYear', 'fSem', 'fBranch', 'fSort']) {
        const options = await page.locator(`#${id} option`).evaluateAll(options => options.map(o => o.value));
        for (const value of options) {
          await page.selectOption(`#${id}`, value);
          filters[`${id}:${value}`] = await cardIds();
        }
        await page.click('#resetBtn');
      }
      await page.fill('#q', 'Electrical Engineering PYQ');
      await page.waitForTimeout(200);
      assert.deepEqual(await cardIds(), ['5']);
      await page.fill('#q', 'no matching document xyz');
      await page.waitForTimeout(200);
      assert.equal(await page.locator('#emptyState').isVisible(), true);
      await page.locator('#emptyState button').click();
      assert.deepEqual(await cardIds(), initial);
      await page.selectOption('#fYear', '2023');
      await page.selectOption('#fSem', '2');
      await page.selectOption('#fBranch', 'electrical');
      assert.deepEqual(await cardIds(), ['5']);
      await page.click('#resetBtn');

      await page.locator('.btn-download').first().click();
      await page.locator('.btn-preview').first().click();
      assert.equal(await page.locator('#qvOverlay').isVisible(), true);
      assert.equal(await page.locator('#qvTitle').textContent(), 'All Branch 2nd Semester PYQ 2025');
      await page.click('#qvDownloadBtn');
      const opened = await page.evaluate(() => window.testOpened);
      assert.equal(opened.length, 2);
      assert.deepEqual(opened[0], opened[1]);
      assert.match(opened[0][0], /^https:\/\/drive.google.com\/uc\?export=download&id=/);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#qvOverlay').isVisible(), false);
      await page.locator('.btn-preview').first().click();
      await page.click('#qvClose');

      await page.click('#openLoginBtn');
      await page.fill('#loginUser', 'wrong');
      await page.fill('#loginPass', 'wrong');
      await page.click('#loginBtn');
      assert.equal(await page.locator('#loginErr').isVisible(), true);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#loginOverlay').isVisible(), false);
      await page.click('#openLoginBtn');
      await page.fill('#loginUser', 'admin');
      await page.fill('#loginPass', 'admin123');
      await page.press('#loginPass', 'Enter');
      assert.equal(await page.locator('#adminOverlay').isVisible(), true);
      await page.click('#saveBtn');
      assert.match(await page.locator('#formFeedback').textContent(), /required/);
      await page.fill('#fTitle', 'Performance regression test');
      await page.fill('#fDesc', 'Temporary local test only');
      await page.selectOption('#fYr', { index: 1 });
      await page.selectOption('#fSemF', '2');
      await page.selectOption('#fBranchF', 'cs');
      await page.fill('#fLink', 'https://example.com/test.pdf');
      await page.click('#saveBtn');
      assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('ds-materials')).length), 9);
      await page.click('#tabBtnList');
      await page.locator('.btn-ed').last().click();
      await page.fill('#fTitle', 'Performance test edited');
      await page.click('#saveBtn');
      assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('ds-materials')).at(-1).title), 'Performance test edited');
      await page.click('#tabBtnList');
      await page.locator('.btn-ed').last().click();
      // Existing site bug: CSS keeps Cancel Edit hidden even after startEdit.
      // Exercise its existing handler without claiming the button is usable.
      assert.equal(await page.locator('#cancelEditBtn').isVisible(), false);
      await page.locator('#cancelEditBtn').evaluate(button => button.click());
      assert.equal(await page.inputValue('#fTitle'), '');
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#adminOverlay').isVisible(), false);
      await page.reload();
      await page.waitForSelector('.card');
      assert.equal(await page.locator('.card').count(), 9);
      await page.click('#openLoginBtn');
      await page.fill('#loginUser', 'admin');
      await page.fill('#loginPass', 'admin123');
      await page.click('#loginBtn');
      await page.click('#tabBtnList');
      page.once('dialog', dialog => dialog.dismiss());
      await page.locator('.btn-rm').last().click();
      assert.equal(await page.locator('.admin-note-item').count(), 9);
      page.once('dialog', dialog => dialog.accept());
      await page.locator('.btn-rm').last().click();
      assert.equal(await page.locator('.admin-note-item').count(), 8);
      await page.click('#adminClose');
      assert.equal(await page.evaluate(() => document.body.style.overflow), '');

      await page.click('#footerContactBtn');
      assert.equal(await page.locator('#contactDrawer').evaluate(el => el.classList.contains('open')), true);
      await page.click('#cdSendBtn');
      assert.match(await page.locator('#cdFeedback').textContent(), /required/);
      await page.fill('#cdName', 'Local test');
      await page.fill('#cdEmail', 'invalid');
      await page.fill('#cdMsg', 'Local test');
      await page.click('#cdSendBtn');
      assert.match(await page.locator('#cdFeedback').textContent(), /valid email/);
      await page.fill('#cdEmail', 'test@example.com');
      await page.click('#cdSendBtn');
      await page.waitForTimeout(1400);
      assert.match(await page.locator('#cdFeedback').textContent(), /Message sent/);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#contactDrawer').evaluate(el => el.classList.contains('open')), false);
      await page.evaluate(() => window.scrollTo(0, 0));
      if (mobile) {
        await page.click('#ham');
        assert.equal(await page.locator('#ham').getAttribute('aria-expanded'), 'true');
      }
      await page.locator('#navLinks a[href="#contact"]').click();
      await page.click('#cdClose');
      await page.click('#footerContactBtn');
      await page.locator('#contactBackdrop').click({ position: { x: 2, y: 2 }, force: true });
      if (!mobile) assert.equal(await page.locator('#contactDrawer').evaluate(el => el.classList.contains('open')), false);
      await page.keyboard.press('Escape');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(200);
      await page.click('#stb');
      await page.waitForFunction(() => window.scrollY === 0);
      assert.equal(await page.evaluate(() => window.scrollY), 0);
      if (label === 'after') assert.deepEqual(errors, []);
      else assert.equal(errors.filter(e => e.includes('confetti')).length, 2);
      const events = await page.evaluate(() => window.testEvents);
      behaviors[`${label}-${profile}`] = { filters, signatures };
      results.push({ label, profile, status: 'PASS', errors, maxObservedEventMs: Math.max(0, ...events.map(e => e.duration)), note: 'Lab event timing on this host, not field INP. Contact success is the existing simulated UI; no delivery backend.' });
      await context.close();
      console.log(`Passed ${label} ${profile}`);
    }
  }
  for (const profile of ['mobile', 'desktop']) {
    assert.deepEqual(behaviors[`after-${profile}`].filters, behaviors[`before-${profile}`].filters);
    assert.deepEqual(behaviors[`after-${profile}`].signatures, behaviors[`before-${profile}`].signatures);
  }
  console.log('PASS: before/after filter outputs, layout, computed styles and all feature checks.');
} finally {
  await writeFile('reports/browser-checks.json', JSON.stringify({ results, behaviors }, null, 2));
  await browser.close();
}
