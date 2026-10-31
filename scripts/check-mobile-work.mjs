import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import ts from "typescript";
import { chromium } from "playwright-core";

const baseline = process.argv.includes("--baseline");
const motionOnly = process.argv.includes("--motion-only");
const base = process.env.PROSPERA_TEST_URL || "http://localhost:3000";
const output = path.resolve(".tmp/mobile-audit", baseline ? "before" : "after");
await fs.mkdir(output, { recursive: true });
const source = await fs.readFile("content/work.ts", "utf8");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { workProjects } = await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, reducedMotion: "reduce" });
const page = await context.newPage();
const errors = [];
page.on("pageerror", error => errors.push(error.message));
const results = [];
const navigation = [];
let gallery, controls;
async function ready(target = page) {
  await target.getByRole("button", { name: "Enter without audio" }).click({ timeout: 45000 });
  await target.waitForSelector('.prospera[data-intro="complete"]', { timeout: 45000 });
}
try {
  if (!motionOnly) {
  await page.goto(`${base}/work/${workProjects[0].slug}`, { waitUntil: "networkidle", timeout: 90000 });
  await ready();
  for (let i = 0; i < workProjects.length; i++) {
    const project = workProjects[i];
    const response = await fetch(`${base}/work/${project.slug}`);
    assert.equal(response.status, 200, `${project.slug}: direct route`);
    await page.locator(".p-case-heading h1").waitFor();
    assert.equal(await page.locator(".p-case-heading h1").textContent(), project.title);
    for (const width of [320, 390, 430, 768]) {
      await page.setViewportSize({ width, height: width === 768 ? 1024 : 844 });
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const layout = await page.evaluate(() => {
        const width = innerWidth;
        const overflow = [...document.querySelectorAll('.p-work-case h1,.p-work-case h2,.p-work-case dt,.p-work-case dd,.p-case-tags span,.p-case-media figcaption,.p-case-back,.p-case-contact a')].filter(el => {
          const r = el.getBoundingClientRect();
          return r.width && (r.right > width + 1 || r.left < -1 || el.scrollWidth > el.clientWidth + 2);
        }).map(el => ({ tag: el.tagName, text: el.textContent.slice(0, 85), width: Math.round(el.getBoundingClientRect().width), scrollWidth: el.scrollWidth }));
        return { width, documentWidth: document.documentElement.scrollWidth, overflow, mediaWidths: [...document.querySelectorAll('.p-case-pair img')].map(el => Math.round(el.getBoundingClientRect().width)), cover: (() => { const el = document.querySelector('.p-case-cover'); return { width: Math.round(el.clientWidth), height: Math.round(el.clientHeight) }; })() };
      });
      results.push({ slug: project.slug, ...layout });
      if (width === 390 || (width === 320 && i === 0)) await page.screenshot({ path: path.join(output, `${project.slug}-${width}.png`) });
      if (!baseline) {
        assert.equal(layout.overflow.length, 0, `${project.slug} overflow at ${width}: ${JSON.stringify(layout.overflow)}`);
        assert.ok(layout.documentWidth <= width + 1, `${project.slug}: document wider than viewport`);
        if (width <= 430) assert.ok(layout.mediaWidths.every(w => w >= width * .8), `${project.slug}: screenshots too small on mobile`);
      }
    }
    // Make every lazy-loaded case image actually request its source.
    const images = page.locator('.p-work-case .p-case-media img');
    const imageCount = await images.count();
    for (let j = 0; j < imageCount; j++) {
      await images.nth(j).scrollIntoViewIfNeeded();
      await images.nth(j).evaluate(el => el.decode());
    }
    if (i === 0 || i === 4) await page.locator('.p-case-pair').first().screenshot({ path: path.join(output, `${project.slug}-media.png`) });
    await page.locator('.p-case-back button').click();
    await page.waitForURL('**/work');
    const restored = await page.locator('.p-work-caption h2').textContent();
    navigation.push({ slug: project.slug, restored });
    if (!baseline) assert.equal(restored, project.title, 'Back-to-work must restore selected project');
    if (restored !== project.title) await page.getByRole('button', { name: `Show ${project.title}`, exact: true }).click();
    await page.locator('.p-work-caption>a').click();
    await page.waitForURL(`**/work/${project.slug}`);
    const next = workProjects[(i + 1) % workProjects.length];
    await page.locator('.p-case-next').click();
    await page.waitForURL(`**/work/${next.slug}`);
    assert.equal(await page.locator('.p-case-heading h1').textContent(), next.title);
    await page.goBack();
    assert.equal(await page.locator('.p-case-heading h1').textContent(), project.title);
    await page.goForward();
    assert.equal(await page.locator('.p-case-heading h1').textContent(), next.title);
    console.log(`${project.slug}: four widths, ${imageCount} images, direct route and navigation checked`);
  }
  // Back-to-work should restore the case's carousel selection.
  await page.setViewportSize({ width: 320, height: 844 });
  await page.locator('.p-case-back button').click();
  await page.waitForURL('**/work');
  gallery = await page.locator('.p-work-caption h2').textContent();
  controls = await page.locator('.p-work-controls').evaluate(el => ({ width: innerWidth, rect: { left: el.getBoundingClientRect().left, right: el.getBoundingClientRect().right }, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
  await page.screenshot({ path: path.join(output, 'gallery-320.png') });
  if (!baseline) {
    assert.equal(gallery, workProjects[0].title);
    assert.ok(controls.rect.right <= controls.width + 1 && controls.rect.left >= -1, 'Carousel controls overflow');
  }
  await page.locator('.p-work-filter summary').click();
  await page.getByRole('button', { name: /Branding & Creative Design/ }).click();
  assert.equal(await page.locator('.p-work-caption h2').textContent(), 'Branding and Festival Creatives');
  await page.locator('.p-work-caption>a').click();
  await page.waitForURL('**/work/branding-festival-creatives');
  await page.locator('.p-case-back button').click();
  assert.equal(await page.locator('.p-work-caption h2').textContent(), 'Branding and Festival Creatives');
  // The contact link changes the visible page as well as the URL.
  await page.locator('.p-work-caption>a').click();
  await page.locator('.p-case-contact a').click();
  await page.waitForURL('**/contact');
  assert.equal(await page.locator('.p-page-stage').getAttribute('data-page'), 'contact');
  await page.goBack();
  await page.waitForURL('**/work/branding-festival-creatives');
  assert.equal(await page.locator('.p-case-heading h1').textContent(), 'Branding and Festival Creatives');
  await page.locator('.p-case-next').click();
  await page.waitForURL('**/work/stock-market-analyzer');
  await page.locator('.p-case-back button').click();
  assert.equal(await page.locator('.p-work-caption h2').textContent(), 'Stock Market Analyzer');
  assert.match(await page.locator('.p-work-filter button[aria-pressed=true]').textContent(), /^All/);
  console.log(`Gallery filters, open/back, contact link checked. Browser errors: ${errors.length}`);
  }
  if (!baseline) {
    const movingContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    const moving = await movingContext.newPage();
    moving.on('pageerror', error => errors.push(error.message));
    await moving.goto(`${base}/work`, { waitUntil: 'networkidle' });
    await ready(moving);
    await moving.locator('.p-work-stage[data-work-gl=true]').waitFor();
    const focusStage = moving.locator('.p-work-stage');
    // Pointer focus must not display HTML fallback cards over the WebGL scene.
    for (const width of [390, 1200]) {
      await moving.setViewportSize({ width, height: width === 390 ? 844 : 800 });
      await focusStage.click({ position: { x: 15, y: 15 } });
      await moving.waitForTimeout(250);
      assert.equal(await moving.locator('.p-work-fallback').evaluate(el => getComputedStyle(el).opacity), '0', `Pointer focus reveals duplicate cards at ${width}px`);
      assert.equal(await moving.locator('.p-work-canvas').evaluate(el => getComputedStyle(el).visibility), 'visible');
      await moving.screenshot({ path: path.join(output, `pointer-focus-${width}.png`) });
    }
    // Keyboard users can still reach the fallback, with the canvas hidden.
    await moving.keyboard.press('Tab');
    await moving.waitForTimeout(250);
    assert.ok(await moving.locator('.p-work-fallback-card').first().evaluate(el => el.matches(':focus-visible')));
    assert.equal(await moving.locator('.p-work-canvas').evaluate(el => getComputedStyle(el).visibility), 'hidden');
    await focusStage.click({ position: { x: 15, y: 15 } });
    await moving.setViewportSize({ width: 390, height: 844 });
    // Traverse more than the original 18 visual slots to exercise carousel wrap.
    for (let i = 1; i <= 21; i++) {
      await moving.getByRole('button', { name: 'Next project', exact: true }).click();
      await moving.waitForTimeout(850);
      assert.equal(await moving.locator('.p-work-caption h2').textContent(), workProjects[i % workProjects.length].title);
    }
    await moving.screenshot({ path: path.join(output, 'animated-gallery-390.png') });
    const selected = await moving.locator('.p-work-caption h2').textContent();
    const target = workProjects.find(project => project.title === selected);
    const stage = moving.locator('.p-work-stage');
    const bounds = await stage.boundingBox();
    await stage.tap({ position: { x: bounds.width / 2, y: bounds.height * .36 } });
    await moving.waitForURL(`**/work/${target.slug}`, { timeout: 15000 });
    await moving.locator('.p-work-flight').waitFor({ state: 'detached' });
    assert.equal(await moving.locator('.p-case-heading h1').textContent(), selected);
    await moving.locator('.p-case-back button').click();
    await moving.waitForURL('**/work');
    await moving.locator('.p-work-flight').waitFor({ state: 'detached' });
    assert.equal(await moving.locator('.p-work-caption h2').textContent(), selected);
    // A real touch drag should select a different card.
    const cdp = await movingContext.newCDPSession(moving);
    const drag = await stage.boundingBox();
    const x = drag.x + drag.width / 2, y = drag.y + drag.height * .36;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x + 60, y }] });
    for (let i = 1; i <= 6; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + 60 - i * 22, y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await moving.waitForTimeout(800);
    assert.notEqual(await moving.locator('.p-work-caption h2').textContent(), selected, 'Touch swipe must change selected card');
    await moving.getByRole('button', { name: 'Open menu' }).click();
    await moving.getByRole('link', { name: 'Open Contact', exact: true }).click();
    await moving.waitForURL('**/contact');
    await moving.getByRole('button', { name: 'Open menu' }).click();
    await moving.getByRole('link', { name: 'Open Work', exact: true }).click();
    await moving.waitForURL('**/work');
    await movingContext.close();
    // Save readable phone screenshots and confirm desktop paired media remain paired.
    await page.goto(`${base}/work/fitness-application`, { waitUntil: 'networkidle' });
    await ready();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('.p-case-pair').first().scrollIntoViewIfNeeded();
    await page.locator('.p-case-pair').first().screenshot({ path: path.join(output, 'fitness-media-phone.png') });
    await page.setViewportSize({ width: 1440, height: 1000 });
    const desktop = await page.locator('.p-case-pair').first().evaluate(el => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    assert.equal(desktop, 2, 'Desktop retains paired screenshots');
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(output, 'desktop-1440.png') });
    console.log('Normal motion: 21 carousel steps, card tap, touch swipe, menu and contact navigation passed. Desktop composition retained.');
  }
  await fs.writeFile(path.join(output, motionOnly ? 'motion-report.json' : 'report.json'), JSON.stringify({ results, navigation, gallery, controls, errors }, null, 2));
  if (!baseline) assert.deepEqual(errors, [], 'Browser runtime errors');
  console.log(`Audit saved: ${output}. ${motionOnly ? 'Motion and desktop checks passed.' : `${results.filter(r => r.overflow.length).length} layouts contain overflowing text.`}`);
} finally { await browser.close(); }
