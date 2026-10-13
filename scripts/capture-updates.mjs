import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const brainScreenshotsDir = 'C:/Users/adity/.gemini/antigravity/brain/4445bf77-ea56-4237-9627-e3f6a9dd188c/screenshots';
fs.mkdirSync(brainScreenshotsDir, { recursive: true });

async function main() {
  const browser = await chromium.launch({ channel: 'msedge' });

  for (const theme of ['dark', 'light']) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });

    await page.addInitScript(
      ({ currentTheme }) => {
        localStorage.setItem('hro:demo-role', 'hr');
        localStorage.setItem('theme', currentTheme);
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        }
      },
      { currentTheme: theme }
    );

    // 1. Capture Manager Dashboard (Manager role)
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.evaluate(({ currentTheme }) => {
      document.documentElement.setAttribute('data-theme', currentTheme);
      if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    }, { currentTheme: theme });
    await page.waitForTimeout(400);

    // Make sure role is Manager
    const switchMgr = page.locator('button:has-text("Switch to Manager View")');
    if (await switchMgr.count() > 0) {
      await switchMgr.click();
      await page.waitForTimeout(400);
    }
    const mgrDashPath = path.join(brainScreenshotsDir, `manager-dashboard-top-${theme}.png`);
    await page.screenshot({ path: mgrDashPath });
    console.log(`Saved: ${mgrDashPath}`);

    // 2. Switch to HR View and capture HR Dashboard
    const switchHr = page.locator('button:has-text("Switch to HR View")');
    if (await switchHr.count() > 0) {
      await switchHr.click();
      await page.waitForTimeout(400);
    }
    const hrDashPath = path.join(brainScreenshotsDir, `hr-dashboard-top-${theme}.png`);
    await page.screenshot({ path: hrDashPath });
    console.log(`Saved: ${hrDashPath}`);

    // 3. Capture Openings page with left-aligned breadcrumb
    await page.goto('http://localhost:3000/openings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const openingsPath = path.join(brainScreenshotsDir, `openings-page-left-nav-${theme}.png`);
    await page.screenshot({ path: openingsPath });
    console.log(`Saved: ${openingsPath}`);

    await page.close();
  }

  await browser.close();
  console.log('Finished capturing all update screenshots.');
}

main().catch(console.error);
