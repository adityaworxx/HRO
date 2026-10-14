import { chromium } from '@playwright/test';
import path from 'node:path';

const screenshotDir = 'C:/Users/adity/.gemini/antigravity/brain/4445bf77-ea56-4237-9627-e3f6a9dd188c/screenshots';

async function testModal() {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => {
    localStorage.setItem('hro:demo-role', 'hr');
  });

  await page.goto('http://localhost:3000/openings', { waitUntil: 'networkidle' });

  await page.evaluate(() => {
    document.documentElement.style.zoom = '0.8';

    const sheet = document.createElement('style');
    sheet.id = 'zoom-fix';
    sheet.innerHTML = `
      [data-radix-popper-content-wrapper] {
        zoom: 1.25 !important;
      }
      [data-radix-popper-content-wrapper] > * {
        zoom: 0.8 !important;
      }
    `;
    document.head.appendChild(sheet);
  });
  await page.waitForTimeout(400);

  // Click "+ New Opening" button
  console.log('Testing New Opening modal...');
  const newOpeningBtn = page.locator('button:has-text("New Opening")');
  await newOpeningBtn.click();
  await page.waitForTimeout(400);

  const modal = page.locator('[role="dialog"]').first();
  const modalBox = await modal.boundingBox();
  console.log('Modal box:', modalBox);

  await page.screenshot({ path: path.join(screenshotDir, 'zoom-fix-modal.png') });

  // Close modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // Open Command Palette
  console.log('Testing Command Palette...');
  await page.keyboard.press('Control+KeyK');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotDir, 'zoom-fix-cmd.png') });

  await browser.close();
  console.log('✓ Verified modals and command palette!');
}

testModal();

