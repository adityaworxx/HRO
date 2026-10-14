import { chromium } from '@playwright/test';
import path from 'node:path';

const screenshotDir = 'C:/Users/adity/.gemini/antigravity/brain/4445bf77-ea56-4237-9627-e3f6a9dd188c/screenshots';

async function verifySuite() {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.addInitScript(() => {
    localStorage.setItem('hro:demo-role', 'hr');
  });

  // 1. Openings List
  console.log('1. Capturing Openings Table...');
  await page.goto('http://localhost:3000/openings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, 'demo-openings-table.png') });

  // 2. Data Analyst with Candidates
  console.log('2. Capturing Data Analyst Opening with Candidates...');
  await page.goto('http://localhost:3000/openings/10000000-0000-0000-0000-000000000005', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const candTab = page.locator('button[role="tab"]:has-text("Candidates")');
  await candTab.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotDir, 'demo-data-analyst-candidates.png') });

  // 3. Product Designer with Candidates
  console.log('3. Capturing Product Designer Opening with Candidates...');
  await page.goto('http://localhost:3000/openings/10000000-0000-0000-0000-000000000003', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const designCandTab = page.locator('button[role="tab"]:has-text("Candidates")');
  await designCandTab.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(screenshotDir, 'demo-design-candidates.png') });

  // 4. Pipeline Kanban Board
  console.log('4. Capturing Pipeline Kanban Board...');
  await page.goto('http://localhost:3000/pipeline', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, 'demo-pipeline-kanban.png') });

  // 5. Onboarding Dashboard
  console.log('5. Capturing Onboarding Dashboard...');
  await page.goto('http://localhost:3000/onboarding', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, 'demo-onboarding-dashboard.png') });

  await browser.close();
  console.log('🎉 Verification suite completed!');
}

verifySuite().catch(console.error);

