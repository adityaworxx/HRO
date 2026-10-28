import { chromium } from '@playwright/test';

async function testRedirects() {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

  // 1. Test Review Queue redirect
  const reviewQueueLink = page.locator('a:has-text("Open Review Queue")').first();
  await reviewQueueLink.click();
  await page.waitForURL('**/shortlist');
  console.log('✓ Redirect to /shortlist verified!');

  // Go back to Dashboard
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

  // 2. Test Pipeline redirect
  const pipelineLink = page.locator('a:has-text("Open Pipeline Board")').first();
  await pipelineLink.click();
  await page.waitForURL('**/pipeline');
  console.log('✓ Redirect to /pipeline verified!');

  // Go back to Dashboard
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

  // 3. Test Technical Interviews redirect
  const interviewsLink = page.locator('a:has-text("Manage Interview Scorecards")').first();
  await interviewsLink.click();
  await page.waitForURL('**/interviews');
  console.log('✓ Redirect to /interviews verified!');

  // Go back to Dashboard
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

  // 4. Test Active Openings StatCard redirect
  const openingsStatCard = page.locator('a:has-text("Active Openings")').first();
  await openingsStatCard.click();
  await page.waitForURL('**/openings');
  console.log('✓ Redirect to /openings verified!');

  await browser.close();
  console.log('All dashboard redirects tested and verified successfully!');
}

testRedirects().catch((err) => {
  console.error(err);
  process.exit(1);
});

