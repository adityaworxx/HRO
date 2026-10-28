import { chromium } from '@playwright/test';
import path from 'node:path';

const screenshotDir =
  'C:/Users/adity/.gemini/antigravity/brain/4445bf77-ea56-4237-9627-e3f6a9dd188c/screenshots';

async function testZoomFixDetailed() {
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

  // 1. Department dropdown
  const deptSelect = page.locator('button:has-text("All Departments")').first();
  await deptSelect.click();
  await page.waitForTimeout(300);

  const deptTriggerBox = await deptSelect.boundingBox();
  const deptListBox = await page.locator('[role="listbox"]').first().boundingBox();
  console.log('Dept Trigger:', deptTriggerBox);
  console.log('Dept ListBox:', deptListBox);

  await page.screenshot({ path: path.join(screenshotDir, 'zoom-fix-dept.png') });

  // Close
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // 2. Action menu
  const actionBtn = page.locator('button:has-text("Open menu")').first();
  await actionBtn.click();
  await page.waitForTimeout(300);

  const actionTriggerBox = await actionBtn.boundingBox();
  const menuBox = await page.locator('[role="menu"]').first().boundingBox();
  console.log('Action Trigger:', actionTriggerBox);
  console.log('Menu:', menuBox);

  await page.screenshot({ path: path.join(screenshotDir, 'zoom-fix-actions.png') });

  await browser.close();
}

testZoomFixDetailed();
