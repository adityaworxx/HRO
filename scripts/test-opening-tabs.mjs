import { chromium } from '@playwright/test';

async function testTabs() {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => { localStorage.setItem('hro:demo-role', 'hr'); });
  await page.goto('http://localhost:3000/openings/10000000-0000-0000-0000-000000000001', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  // Click Candidates tab
  await page.locator('button[role="tab"]:has-text("Candidates")').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'C:/Users/adity/.gemini/antigravity/brain/4445bf77-ea56-4237-9627-e3f6a9dd188c/screenshots/detail-tab-candidates.png' });

  // Click Timeline tab
  await page.locator('button[role="tab"]').last().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'C:/Users/adity/.gemini/antigravity/brain/4445bf77-ea56-4237-9627-e3f6a9dd188c/screenshots/detail-tab-timeline.png' });

  await browser.close();
}

testTabs().catch(console.error);
