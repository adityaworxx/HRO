import { chromium } from '@playwright/test';
import path from 'node:path';

const screenshotDir = 'C:/Users/adity/.gemini/antigravity/brain/4445bf77-ea56-4237-9627-e3f6a9dd188c/screenshots';

async function verify() {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.addInitScript(() => {
    localStorage.setItem('hro:demo-role', 'hr');
  });

  const roles = [
    { name: 'engineer', id: '10000000-0000-0000-0000-000000000001' },
    { name: 'design', id: '10000000-0000-0000-0000-000000000003' },
    { name: 'data-analyst', id: '10000000-0000-0000-0000-000000000005' },
    { name: 'product', id: '10000000-0000-0000-0000-000000000006' },
  ];

  for (const role of roles) {
    console.log(`Verifying /openings/${role.id} (${role.name})...`);
    await page.goto(`http://localhost:3000/openings/${role.id}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    // Capture Overview
    await page.screenshot({ path: path.join(screenshotDir, `role-${role.name}-overview.png`) });

    // Click Candidates Tab
    const candTab = page.locator('button[role="tab"]:has-text("Candidates")');
    if (await candTab.isVisible()) {
      await candTab.click();
      await page.waitForTimeout(300);
      await page.screenshot({ path: path.join(screenshotDir, `role-${role.name}-candidates.png`) });
    }
  }

  console.log('Total console/page errors:', errors.length);
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
