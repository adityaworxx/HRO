import { chromium } from '@playwright/test';
import path from 'node:path';

const screenshotDir =
  'C:/Users/adity/.gemini/antigravity/brain/4445bf77-ea56-4237-9627-e3f6a9dd188c/screenshots';

async function capture() {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.addInitScript(() => {
    localStorage.setItem('hro:demo-role', 'hr');
  });

  // 1. New Opening Page - Dark Mode
  console.log('Navigating to /openings/new (Dark)...');
  await page.goto('http://localhost:3000/openings/new', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  await page.screenshot({
    path: path.join(screenshotDir, 'opening-form-dark-full.png'),
    fullPage: false,
  });

  // 2. Test Live Preview update by typing a new title
  console.log('Testing live interactive updates...');
  const titleInput = page.locator('input[placeholder*="Senior Frontend"]').first();
  await titleInput.fill('Staff Distributed Systems Architect');
  await page.waitForTimeout(400);

  // Take screenshot showing live preview updating in the right sidebar!
  await page.screenshot({
    path: path.join(screenshotDir, 'opening-form-interactive-live-preview.png'),
  });

  // 3. Switch to Light Mode
  console.log('Testing Light Mode...');
  const themeToggle = page.locator('button[aria-label="Toggle theme"]').first();
  if (await themeToggle.isVisible()) {
    await themeToggle.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotDir, 'opening-form-light-full.png') });
  }

  await browser.close();
  console.log('✓ Successfully captured all screenshots!');
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
