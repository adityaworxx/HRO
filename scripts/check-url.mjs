import { chromium } from '@playwright/test';

async function checkUrl() {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForSelector('a[href="/shortlist"]', { timeout: 10000 });
  console.log('Current URL:', page.url());
  const links = await page.locator('a[href="/shortlist"]').allInnerTexts();
  console.log('Shortlist links found:', links);

  // Click it to test redirect
  await page.locator('a[href="/shortlist"]').first().click();
  await page.waitForURL('**/shortlist');
  console.log('✓ Successfully redirected to:', page.url());

  await browser.close();
}

checkUrl().catch(console.error);
