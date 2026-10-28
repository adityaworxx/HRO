import { chromium } from '@playwright/test';
import path from 'node:path';

const screenshotDir =
  'C:/Users/adity/.gemini/antigravity/brain/4445bf77-ea56-4237-9627-e3f6a9dd188c/screenshots';

async function testScrollStable() {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.addInitScript(() => {
    localStorage.setItem('hro:demo-role', 'hr');
  });

  console.log('Navigating to /openings/new...');
  await page.goto('http://localhost:3000/openings/new', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Initial screenshot
  await page.screenshot({ path: path.join(screenshotDir, 'opening-stable-initial.png') });

  // Get initial preview bounding box
  const previewBoxInitial = await page.locator('text=Directory Live Preview').first().boundingBox();
  console.log('Preview Box Initial:', previewBoxInitial);

  // Scroll the form down
  console.log('Scrolling form...');
  const formScrollContainer = page.locator('form > div').first();
  await formScrollContainer.evaluate((el) => {
    el.scrollTop = 400;
  });
  await page.waitForTimeout(400);

  // Get preview bounding box after scroll
  const previewBoxAfterScroll = await page
    .locator('text=Directory Live Preview')
    .first()
    .boundingBox();
  console.log('Preview Box After Scroll:', previewBoxAfterScroll);

  const diffY = Math.abs((previewBoxAfterScroll?.y || 0) - (previewBoxInitial?.y || 0));
  console.log(`Live Preview Y displacement after scroll: ${diffY.toFixed(2)}px`);

  if (diffY < 2) {
    console.log('PASS: Live Preview remained 100% stable and stationary while form scrolled!');
  } else {
    console.error('FAIL: Live Preview moved by ' + diffY + 'px');
  }

  // Scrolled screenshot
  await page.screenshot({ path: path.join(screenshotDir, 'opening-stable-scrolled.png') });

  await browser.close();
}

testScrollStable().catch((err) => {
  console.error(err);
  process.exit(1);
});
