const { chromium } = require('playwright');

async function readRowTransforms(page) {
  return page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('section div[class*="w-max"]'));
    return rows.map((el) => getComputedStyle(el).transform);
  });
}

async function testViewport(browser, name, viewport) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });

  await page.goto('http://localhost:3000/', { waitUntil: 'load' });

  // Let the preloader clear (MIN_DISPLAY_MS=1100ms) and the loop tween get moving.
  await page.waitForTimeout(2500);

  const t1 = await readRowTransforms(page);
  await page.waitForTimeout(1500);
  const t2 = await readRowTransforms(page);

  const section = page.locator('section').first();
  const position = await section.evaluate((el) => getComputedStyle(el).position);
  const height = await section.evaluate((el) => el.getBoundingClientRect().height);

  console.log(`\n=== ${name} (${viewport.width}x${viewport.height}) ===`);
  console.log('section position (should be static/relative, no pin):', position);
  console.log('section height (px):', Math.round(height));
  console.log('row transforms @t1:', t1);
  console.log('row transforms @t2 (+1.5s):', t2);
  const moved = t1.map((v, i) => v !== t2[i]);
  console.log('rows animating?', moved);
  console.log('console/page errors:', errors.length ? errors : 'none');

  await page.close();
}

(async () => {
  const browser = await chromium.launch();
  await testViewport(browser, 'DESKTOP', { width: 1440, height: 900 });
  await testViewport(browser, 'MOBILE', { width: 390, height: 844 });
  await browser.close();
})();
