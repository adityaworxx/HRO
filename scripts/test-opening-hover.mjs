import { chromium } from '@playwright/test';
import path from 'node:path';

async function main() {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => {
    localStorage.setItem('hro:demo-role', 'hr');
    localStorage.setItem('theme', 'dark');
  });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('dark');
  });
  await page.waitForTimeout(500);

  // 1. Hover on row box (Budget or location column), NOT the title
  const row = page.locator('a[href^="/openings/"]').first();
  const budgetText = row.locator('span', { hasText: 'LPA' }).first();
  await budgetText.hover();
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.resolve('screenshots/openings-hover-row.png') });

  // 2. Hover directly on the opening title text
  const titleSpan = row.locator('span', { hasText: 'Senior Backend Engineer' }).first();
  await titleSpan.hover();
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.resolve('screenshots/openings-hover-title.png') });

  await browser.close();
  console.log('Opening hover screenshots captured successfully!');
}

main().catch(console.error);
