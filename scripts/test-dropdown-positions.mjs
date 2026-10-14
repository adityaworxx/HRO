import { chromium } from '@playwright/test';
import path from 'node:path';

const screenshotDir = 'C:/Users/adity/.gemini/antigravity/brain/4445bf77-ea56-4237-9627-e3f6a9dd188c/screenshots';

async function testDropdown() {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => {
    localStorage.setItem('hro:demo-role', 'hr');
  });

  await page.goto('http://localhost:3000/openings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Department dropdown trigger
  const deptSelect = page.locator('button:has-text("All Departments")').first();
  await deptSelect.click();
  await page.waitForTimeout(400);

  const triggerBox = await deptSelect.boundingBox();
  const content = page.locator('[role="listbox"]').first();
  const contentBox = await content.boundingBox();

  console.log('--- Department Dropdown ---');
  console.log('Trigger:', triggerBox);
  console.log('Content:', contentBox);
  console.log('Distance X:', Math.abs((contentBox?.x || 0) - (triggerBox?.x || 0)));

  await page.screenshot({ path: path.join(screenshotDir, 'dropdown-test-dept.png') });

  // Close department dropdown
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // 2. Actions dropdown trigger on first table row
  const actionBtn = page.locator('button:has-text("Open menu")').first();
  await actionBtn.click();
  await page.waitForTimeout(400);

  const actionTriggerBox = await actionBtn.boundingBox();
  const menuContent = page.locator('[role="menu"]').first();
  const menuBox = await menuContent.boundingBox();

  console.log('--- Actions Dropdown ---');
  console.log('Action Trigger:', actionTriggerBox);
  console.log('Menu Content:', menuBox);
  console.log('Distance X:', Math.abs((menuBox?.x || 0) - (actionTriggerBox?.x || 0)));

  await page.screenshot({ path: path.join(screenshotDir, 'dropdown-test-actions.png') });

  await browser.close();
}

testDropdown();
