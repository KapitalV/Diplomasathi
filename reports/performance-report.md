# DiplomaSathi performance report

The optimized static build is in `dist/`; readable sources remain in the project root. The final audit scores **100 mobile / 98 desktop**, with LCP **1.06 s / 0.57 s**, CLS **0 / 0.0003**, TBT **19 ms / 0 ms**, and **62.1 KB / 96.5 KB** transferred. The mobile performance, LCP, CLS and transfer/request budgets pass. The exact desktop 100 target was **not reached** in the final run; field INP remains unverified. It preserves the layout, themes, content, photos, gradients and application flows. Fonts and optimized photo copies now ship with the site under content-hashed filenames. Deployment to Vercel has **not** been performed: the after results below measure the production build on a local compressed HTTP server. A live post-deployment run is still needed to confirm CDN latency and response headers.

**Final comparison: Chrome Fast 4G targets.** Lighthouse 13.4.1, Chrome 152, cold browser profiles, simulated 9 Mbps / 60 ms RTT; mobile uses 4× CPU, desktop uses 1× CPU. Mobile viewport: 412×823, DPR 1.75; desktop: 1350×940, DPR 1. The request-level values in saved settings are Chrome's calibrated equivalents (165 ms request latency, 8.1 Mbps download, 1.35 Mbps upload); simulated Lighthouse uses the target RTT and throughput. Each row is one run, not a median or a real-user percentile. KB means 1,000 bytes. Exact timestamps and hardware benchmark indices are in the JSON reports.

<!-- exact:start -->
| Audit | Performance | LCP (s) | CLS | INP | TBT (ms) | Transfer (KB) | Requests |
|---|---:|---:|---:|---|---:|---:|---:|
| [before-fast4g-live mobile](before-fast4g-live-mobile.html) | 82 | 2.44 | 0.0040 | unavailable | 600 | 449.0 | 12 |
| [before-fast4g-live desktop](before-fast4g-live-desktop.html) | 85 | 1.93 | 0.0042 | unavailable | 63 | 449.3 | 12 |
| [before-fast4g-local mobile](before-fast4g-local-mobile.html) | 94 | 1.99 | 0.0000 | unavailable | 269 | 447.2 | 12 |
| [before-fast4g-local desktop](before-fast4g-local-desktop.html) | 89 | 1.73 | 0.0042 | unavailable | 48 | 447.2 | 12 |
| [verified-local mobile](verified-local-mobile.html) | 100 | 1.06 | 0.0000 | unavailable | 19 | 62.1 | 6 |
| [verified-local desktop](verified-local-desktop.html) | 98 | 0.57 | 0.0003 | unavailable | 0 | 96.5 | 9 |
<!-- exact:end -->

The live baseline and untouched local baseline are both included because localhost removes live origin latency. Compare the two local rows to assess the code change under identical serving conditions. The initial live fetch confirmed that CSS and JS matched the original checkout exactly, and HTML matched after normalizing line endings. Original commit: `beed5af3af89516e8f30691d999105c5cb06760b`.

INP is **not available** from these navigation audits; it is not zero and the field INP target is not certified. The browser interaction suite observed maximum Event Timing entries of 104 ms mobile and 72 ms desktop after optimization, on this host without CPU throttling and with analytics blocked to avoid test traffic. These values are diagnostic samples, not INP. Lighthouse audits did not block analytics or images.

**Phase measurements retained for review.** Before source edits, the initial baseline used an explicitly configured 10.24 Mbps / 40 ms simulated network, mobile 4× CPU and desktop 1×. All rows in this phase table use that same custom profile. It is faster than Chrome's current named Fast 4G preset; the separate final table above corrects that distinction. Do not directly compare timings across the two network profiles.

<!-- phases:start -->
| Audit | Performance | LCP (s) | CLS | INP | TBT (ms) | Transfer (KB) | Requests |
|---|---:|---:|---:|---|---:|---:|---:|
| [before-live mobile](before-live-mobile.html) | 97 | 1.66 | 0.0032 | unavailable | 192 | 449.0 | 12 |
| [before-live desktop](before-live-desktop.html) | 93 | 1.43 | 0.0036 | unavailable | 28 | 449.0 | 12 |
| [before-local mobile](before-local-mobile.html) | 95 | 1.60 | 0.0032 | unavailable | 244 | 447.2 | 12 |
| [before-local desktop](before-local-desktop.html) | 92 | 1.37 | 0.0042 | unavailable | 0 | 447.2 | 12 |
| [after-local mobile](after-local-mobile.html) | 85 | 1.73 | 0.0000 | unavailable | 565 | 262.7 | 11 |
| [after-local desktop](after-local-desktop.html) | 97 | 1.18 | 0.0003 | unavailable | 14 | 262.8 | 12 |
| [final-local mobile](final-local-mobile.html) | 100 | 0.78 | 0.0000 | unavailable | 68 | 60.6 | 6 |
| [final-local desktop](final-local-desktop.html) | 100 | 0.51 | 0.0003 | unavailable | 0 | 88.6 | 9 |
<!-- phases:end -->

`after-local` is phase 1: deferred application JS, immediate cards, repaired downloads, smaller native-lazy photos, variable font declarations, critical CSS, minification and versioned assets. It reduced transfer but increased mobile TBT, so it was not the final candidate. `final-local` is phase 2: analytics on first interaction, tighter thumbnail look-ahead, one DOM insertion and early saved-theme restoration. The Fast 4G build also includes a critical-CSS footer correction caught by intentionally delaying the stylesheet: loading the full CSS now produces identical page geometry on both viewports.

Further tuning used the exact Fast 4G profile. `final-fast4g-local` retained external fonts/photos. `release-fast4g-local` tried eager loading of visible photos: it did not improve measured timings, so that experiment was reverted. `final-assets-local` served the identical WOFF2 files and 200 px WebP photo copies locally, removing font/image connection dependencies. `verified-local` in the final table repeats that finished build with the preview server's explicit WebP response MIME type. The retained photos, gradients and animations were not removed to chase a score.

<!-- tuning:start -->
| Audit | Performance | LCP (s) | CLS | INP | TBT (ms) | Transfer (KB) | Requests |
|---|---:|---:|---:|---|---:|---:|---:|
| [final-fast4g-local mobile](final-fast4g-local-mobile.html) | 99 | 1.03 | 0.0000 | unavailable | 110 | 60.7 | 6 |
| [final-fast4g-local desktop](final-fast4g-local-desktop.html) | 98 | 0.72 | 0.0003 | unavailable | 0 | 88.6 | 9 |
| [release-fast4g-local mobile](release-fast4g-local-mobile.html) | 99 | 1.16 | 0.0000 | unavailable | 112 | 60.7 | 6 |
| [release-fast4g-local desktop](release-fast4g-local-desktop.html) | 98 | 0.76 | 0.0003 | unavailable | 0 | 88.7 | 9 |
| [final-assets-local mobile](final-assets-local-mobile.html) | 100 | 1.03 | 0.0000 | unavailable | 50 | 62.1 | 6 |
| [final-assets-local desktop](final-assets-local-desktop.html) | 99 | 0.56 | 0.0003 | unavailable | 0 | 96.6 | 9 |
<!-- tuning:end -->

**Verified findings and changes.**

| Prior finding | Verification and final behavior |
|---|---|
| Parser-blocking application JS | Confirmed. `script.js` is deferred in the head and renders immediately after parsing, before DOMContentLoaded. |
| Cards wait for load plus 650 ms | Confirmed. Removed the load handler, timer, skeleton markup and hidden grid. Existing card entrance animations remain. |
| Seven font downloads | Not confirmed: seven styles/weights were requested, but Chrome downloaded one variable Latin font. CSS uses 400, 500, 600, 700 and 800; 500 is required. Removed 300 and italic declarations, kept swap and every language subset, and preloaded the shared variable Latin WOFF2 used by the 800-weight hero/navbar. The unmodified WOFF2 files are self-hosted with their OFL license. Font transfer is approximately unchanged; earlier discovery and no external font connection/stylesheet are the gains. |
| Missing confetti | Confirmed by two baseline ReferenceErrors, from card and preview downloads. Removed the broken effect; download URL, popup timing, target and noopener remain unchanged. No new library. |
| Eight photo requests | Eight cards share four actual requested branch photos. Retained the same photos/crops/gradients; local WebP files were downloaded at `w=200&q=60&auto=format&fit=crop&fm=webp`. All six branch variants remain available, including branches absent from the default cards. Images use empty alt text, `loading=lazy`, `decoding=async`, fixed container geometry and cover positioning. IntersectionObserver uses a 600 px look-ahead; a native-lazy fallback works without IntersectionObserver. The lower-resolution photos are intentionally softer; layout and design are unchanged. |
| Blocking full CSS | Inline critical CSS is generated from the same readable stylesheet, including both themes, breakpoints, footer and hidden overlay containers. The complete minified CSS loads with preload/onload, plus a noscript fallback. A slow-CSS test verifies unchanged geometry when the complete sheet arrives. |
| No asset caching | Live assets required revalidation. `vercel.json` sets the requested immutable policy for CSS, JS, assets and images, and revalidation for HTML. Deployed HTML references content-hashed CSS/JS filenames, so edits get fresh URLs. The local server exercises equivalent headers; actual Vercel headers remain to be checked after deployment. |
| Third-party work | Added GTM connection hints; Unsplash/font hints were removed once those assets became first-party. Analytics queues the existing config immediately and loads once after the first pointer, keyboard or scroll event, after giving that interaction a paint. **Non-interacting bounces no longer send a page view.** GA's approximately 174 KB transfer is shifted to interaction, not eliminated. Scrolling also loads remaining photos; the first-load budget excludes that later work. |
| Minification | `npm run build` uses Terser and CleanCSS without bundling. Readable HTML/CSS/JS stay readable; only deployed copies are minified. Build output excludes tests, reports, npm dependencies and source tooling. |

**Every request and unused-code classification.** Each Lighthouse HTML report has the complete request and coverage details. Matching `*-requests.md` files classify every captured HTTP request as blocking/non-blocking, first/third party, above/below fold, analytics or failed/unused. Key inventories: [original live mobile](before-live-mobile-requests.md), [final mobile](verified-local-mobile-requests.md), [final desktop](verified-local-desktop-requests.md). Only proven navigation-unused percentages are labeled; admin/search/dialog code is required despite being idle at startup. Unused font faces did not create network requests. The existing missing `/favicon.ico` request is reported as a 404 and remains included in the totals. Asset provenance, sizes and SHA-256 checksums are recorded in `assets/sources.json`.

**Feature checklist confirmation.** These are automated real-Chrome browser checks plus visual review of captured screenshots, not a claim that a human manually tested every action. The untouched original and optimized build passed the same suite at mobile and desktop widths. Saved results: [browser-checks.json](browser-checks.json), [loading-checks.json](loading-checks.json), and [screenshots](screenshots/).

- [x] Dark/light toggle and `ds-theme` restoration after reload; both themes visually reviewed.
- [x] Search, no-result state, empty-state reset and ordinary reset.
- [x] Every year, semester (including even/odd/all), branch and sorting option; before/after result IDs match exactly. Combined filters also checked.
- [x] Preview title/content, close button and Escape.
- [x] Card and preview downloads request the same original URL with `_blank` and `noopener`; popup calls intercepted to avoid real downloads. Optimized clicks produce no JavaScript errors.
- [x] Admin invalid login, valid login via Enter/button, required-field validation, add, edit, list, reload persistence, delete cancellation/confirmation, close and Escape. `ds-materials` survives and retains records. Cancel Edit's existing handler was tested programmatically because its button is already hidden by CSS in the original.
- [x] Contact drawer via navigation and footer, close button, desktop backdrop, Escape, required/email validation and the existing simulated success/reset state. No message was sent.
- [x] Mobile hamburger and scroll-to-top.
- [x] Escape closes preview, login, admin and contact and restores scrolling.
- [x] Initial page geometry matches with and without the full stylesheet; overlay containers stay hidden during slow CSS.
- [x] Cards exist at DOMContentLoaded while full CSS is still pending; analytics makes no initial script request, then loads exactly once across multiple interactions.
- [x] Image fallback works without IntersectionObserver.
- [x] Full-style layout dimensions and selected computed fonts/colors/backgrounds match the original on both viewports and both themes.
- [ ] Live Vercel post-deployment audit, real-device manual smoke test and field INP confirmation remain deployment follow-ups.

The original contact form has no delivery backend and only displays simulated success. The original admin Cancel Edit button stays hidden because clearing its inline display does not override `display:none` in CSS. The performance work preserves both existing limitations. Existing filter semantics and available admin years are also preserved.

**Build, repeat and inspect.** Run `npm ci` then `npm run build`. Run `npm run preview` in one terminal. Run `node tools/baseline.mjs` in a second terminal to serve the original Git revision on port 4174. Run `npm test` and `node tools/check-loading.mjs` in a third terminal. Run `npm run audit -- http://127.0.0.1:4173 final-fast4g-local` for both Lighthouse profiles, and `node tools/report.mjs` to regenerate saved tables/inventories. The audit and browser scripts currently use installed Chrome on Windows. Use `npm run audit -- https://diplomasathi.live after-live` after deploying to obtain the missing production comparison. `dist/assets/*.min.css` and `*.min.js` are the minified deployment copies; `dist/style.css` and `dist/script.js` are compatibility copies. Edit root sources, not generated files.

**Rollback note.** For a complete rollback, redeploy original commit `beed5af3af89516e8f30691d999105c5cb06760b` and ensure the restored HTML uses fresh versioned CSS/JS URLs if compatibility URLs have been cached. For a targeted rollback, restore the affected source block and rebuild: restore the original async GA tag to recover non-interacting page views; revert thumbnail URLs/renderer/CSS together if image quality is unacceptable; restore the Google Fonts link and remove direct font-face/preload declarations together if fonts regress; restore the blocking stylesheet link and disable critical extraction if styling regresses. Keep the repaired download handler. Every rebuilt CSS/JS change gets a new content hash; never overwrite a referenced immutable asset under the same filename. No rollback needs to clear `ds-materials` or `ds-theme`.

Method references: [Chrome Fast 4G preset source](https://chromium.googlesource.com/devtools/devtools-frontend/+/HEAD/front_end/core/sdk/NetworkManager.ts), [Lighthouse throttling](https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md), [Vercel static configuration](https://vercel.com/docs/project-configuration/vercel-json), [Vercel cache-control guidance](https://vercel.com/docs/caching/cache-control-headers).
