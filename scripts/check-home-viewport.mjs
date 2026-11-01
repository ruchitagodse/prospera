import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseline = process.argv.includes("--baseline");
const out = path.resolve(".tmp/home-viewport", baseline ? "before" : "after");
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
const page = await context.newPage();
const errors = [], results = [];
page.on("pageerror", e => errors.push(e.message));
try {
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle", timeout: 90000 });
  await page.getByRole("button", { name: "Enter without audio" }).click({ timeout: 45000 });
  await page.waitForSelector('.prospera[data-intro="complete"]', { timeout: 45000 });
  await page.waitForTimeout(700);
  const sizes = [[320,568],[360,640],[375,667],[390,844],[414,736],[430,932],[768,1024],[844,390],[1366,768],[1920,878]];
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(250);
    await page.evaluate(() => window.scrollTo(0, 0));
    const result = await page.evaluate(() => {
      const selectors = [".p-header", ".p-hero-top", ".p-hero h1", ".p-hero .p-intro p", ".p-hero .p-cta", ".p-hero .p-secondary-cta", ".p-hero .p-art", ".p-hero-bottom"];
      const boxes = selectors.map(selector => {
        const el = document.querySelector(selector), r = el.getBoundingClientRect();
        return { selector, left:r.left, right:r.right, top:r.top, bottom:r.bottom, width:r.width, height:r.height, overflow:el.scrollWidth>el.clientWidth+2 };
      });
      return { width:innerWidth, height:innerHeight, pageWidth:document.documentElement.scrollWidth, pageHeight:document.documentElement.scrollHeight, boxes };
    });
    results.push(result);
    await page.screenshot({ path:path.join(out,`${width}x${height}.png`) });
    if (!baseline) {
      assert.ok(result.pageWidth <= width+1, `Horizontal page overflow at ${width}×${height}`);
      assert.ok(result.pageHeight <= height+1, `Homepage scrolls at ${width}×${height}: ${result.pageHeight}`);
      for (const box of result.boxes) {
        assert.ok(box.top >= -1 && box.bottom <= height+1 && box.left >= -1 && box.right <= width+1, `${box.selector} outside screen at ${width}×${height}: ${JSON.stringify(box)}`);
        // The logo canvas intentionally paints the room across the whole hero;
        // its art anchor is smaller than that decorative drawing surface.
        if (!box.selector.endsWith('.p-art')) assert.ok(!box.overflow, `${box.selector} has internal overflow at ${width}×${height}`);
      }
      assert.ok(result.boxes.find(b=>b.selector.endsWith('.p-art')).height>=100, `Logo space too small at ${width}×${height}`);
    }
    console.log(`${width}×${height}: page ${result.pageWidth}×${result.pageHeight}`);
  }
  if (!baseline) {
    await page.setViewportSize({width:390,height:844});
    await page.locator('.p-hero .p-secondary-cta').click();
    await page.waitForURL('**/work');
    assert.equal(await page.locator('.p-page-stage').getAttribute('data-page'),'work');
    await page.goBack();
    await page.locator('.p-hero .p-cta').click();
    await page.waitForURL('**/contact');
    await page.goBack();
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.waitForSelector('.prospera[data-reduced=true]');
    assert.equal(await page.locator('.p-page-stage').getAttribute('data-page'),'home');
    for (const [width,height] of [[320,568],[390,844],[1366,768]]) {
      await page.setViewportSize({width,height});
      await page.waitForTimeout(100);
      const fallback = await page.locator('.p-hero .p-main-mark').boundingBox();
      assert.ok(fallback.y>=0 && fallback.y+fallback.height<=height+1, 'Static logo must fit without clipping');
      assert.ok(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1));
      await page.screenshot({path:path.join(out,`reduced-${width}x${height}.png`)});
    }
    assert.deepEqual(errors,[]);
    console.log('Home CTAs and reduced-motion layout passed.');
  }
  await fs.writeFile(path.join(out,'report.json'),JSON.stringify({results,errors},null,2));
} finally { await browser.close(); }
