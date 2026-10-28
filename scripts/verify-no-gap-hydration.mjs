import { chromium } from '@playwright/test';
import path from 'node:path';

const screenshotDir =
  'C:/Users/adity/.gemini/antigravity/brain/4445bf77-ea56-4237-9627-e3f6a9dd188c/screenshots';

async function verify() {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' && msg.text().includes('Hydration')) {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    if (err.message.includes('Hydration')) {
      errors.push(err.message);
    }
  });

  await page.addInitScript(() => {
    localStorage.setItem('hro:demo-role', 'hr');
  });

  console.log('Navigating to /openings/new...');
  await page.goto('http://localhost:3000/openings/new', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Check top view
  await page.screenshot({ path: path.join(screenshotDir, 'opening-no-gap-top.png') });

  // Scroll main container to bottom
  console.log('Scrolling down...');
  const main = page.locator('#main-content');
  await main.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await page.waitForTimeout(400);

  // Capture bottom view
  await page.screenshot({ path: path.join(screenshotDir, 'opening-no-gap-bottom.png') });

  console.log('Hydration errors found:', errors.length);
  if (errors.length > 0) {
    console.error('Hydration errors:', errors);
    throw new Error('Hydration error detected!');
  } else {
    console.log('PASS: Zero hydration errors!');
  }

  // Verify sticky live preview is still visible and pinned
  const preview = page.locator('text=Directory Live Preview').first();
  const isVisible = await preview.isVisible();
  const box = await preview.boundingBox();
  console.log('Live preview visible after scroll?', isVisible, box);

  if (isVisible && box && box.y > 0 && box.y < 200) {
    console.log('PASS: Sticky Live Preview is pinned perfectly at the top!');
  } else {
    console.error('FAIL: Live Preview not properly pinned at top:', box);
  }

  await browser.close();
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});
