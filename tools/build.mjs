// Minify only deployment output. Source CSS/JS remain readable.
import { readFile, writeFile, mkdir, cp, readdir, unlink } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import CleanCSS from 'clean-css';
import postcss from 'postcss';
import { minify } from 'terser';
const css = await readFile('style.css', 'utf8');
const js = await readFile('script.js', 'utf8');
const cssMin = new CleanCSS({ level: 1 }).minify(css);
if (cssMin.errors.length) throw new Error(cssMin.errors.join('\n'));
const jsMin = (await minify(js, { compress: true, mangle: true, format: { comments: false } })).code;

// Keep the complete initial page, both themes, responsive rules and animations.
// Only dialog/admin/contact interiors are deferred. Hidden container rules stay
// inline so those elements cannot flash into the page before the full CSS loads.
const critical = postcss.parse(css);
const deferred = /\.(?:modal|mock-pdf|pdf-|login-|admin-|form-|ani-|btn-ed|btn-rm|cd-|contact-)/;
critical.walkRules(rule => {
  if (deferred.test(rule.selector)
      && !rule.selector.includes('.contact-trigger')
      && !/^(\.modal-overlay|\.login-overlay|\.admin-overlay|\.contact-backdrop|\.contact-drawer)\s*$/.test(rule.selector)) rule.remove();
});
const criticalMin = new CleanCSS({ level: 1 }).minify(critical.toString()).styles;
let html = await readFile('index.html', 'utf8');
html = html.replace(/<!-- critical:start[\s\S]*?<!-- critical:end -->/, `<!-- critical:start — regenerated from style.css by npm run build -->\n<style id="critical-css">\n${critical.toString()}\n</style>\n<!-- critical:end -->`);
await writeFile('index.html', html);
const hash = value => createHash('sha256').update(value).digest('hex').slice(0, 12);
const cssName = `style.${hash(cssMin.styles)}.min.css`;
const jsName = `script.${hash(jsMin)}.min.js`;
await mkdir('dist/assets', { recursive: true });
// Remove only our previous generated outputs, inside this build directory.
for (const name of await readdir('dist/assets')) {
  if (/^(style|script)\.[a-f0-9]{12}\.min\.(css|js)$/.test(name)) await unlink(`dist/assets/${name}`);
}
await writeFile(`dist/assets/${cssName}`, cssMin.styles);
await writeFile(`dist/assets/${jsName}`, jsMin);
// Compatibility URLs requested in the cache policy; HTML uses hashed URLs.
await writeFile('dist/style.css', cssMin.styles);
await writeFile('dist/script.js', jsMin);
const deployHtml = html.replace(/<style id="critical-css">[\s\S]*?<\/style>/, `<style id="critical-css">${criticalMin}</style>`);
await writeFile('dist/index.html', deployHtml.replaceAll('href="style.css"', `href="assets/${cssName}"`).replace('src="script.js"', `src="assets/${jsName}"`));
for (const folder of ['images', 'assets']) {
  try { await cp(folder, `dist/${folder}`, { recursive: true }); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
console.log(`Built ${cssName} (${cssMin.styles.length} chars), ${jsName} (${jsMin.length} chars), critical CSS ${criticalMin.length} chars.`);
