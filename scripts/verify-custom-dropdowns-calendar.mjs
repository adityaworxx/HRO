import { chromium } from '@playwright/test';
import path from 'node:path';

const screenshotDir =
  'C:/Users/adity/.gemini/antigravity/brain/4445bf77-ea56-4237-9627-e3f6a9dd188c/screenshots';

async function verify() {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    errors.push(err.message);
  });

  await page.addInitScript(() => {
    localStorage.setItem('hro:demo-role', 'hr');
  });

  console.log('Navigating to /openings/new...');
  await page.goto('http://localhost:3000/openings/new', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // 1. Open Department select
  console.log('Testing Department Select...');
  const deptTrigger = page.locator('button:has-text("Engineering")').first();
  await deptTrigger.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotDir, 'custom-dept-dropdown.png') });

  // Close by selecting Product
  const productOption = page.locator('[role="option"]:has-text("Product")');
  if (await productOption.isVisible()) {
    console.log('Selecting Product...');
    await productOption.click();
  } else {
    // click trigger again to close
    await deptTrigger.click();
  }
  await page.waitForTimeout(300);

  // 2. Open Employment Type select
  console.log('Testing Employment Type Select...');
  const empTrigger = page.locator('button:has-text("Full-time")').first();
  await empTrigger.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotDir, 'custom-employment-dropdown.png') });

  // Close by clicking Contract
  const contractOption = page.locator('[role="option"]:has-text("Contract")');
  if (await contractOption.isVisible()) {
    console.log('Selecting Contract...');
    await contractOption.click();
  } else {
    await empTrigger.click();
  }
  await page.waitForTimeout(300);

  // 3. Open Target Start Date DatePicker
  console.log('Testing Custom DatePicker Calendar...');
  const dateTrigger = page
    .locator('button:has-text("01-11-2026"), button:has-text("Select target start date")')
    .first();
  await dateTrigger.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotDir, 'custom-date-picker.png') });

  console.log('Console errors found:', errors.length);
  if (errors.length > 0) {
    console.warn('Errors:', errors);
  }

  await browser.close();
  console.log('Verification finished successfully!');
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});
