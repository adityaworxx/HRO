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
    await page.waitForTimeout(300);

    // Switch to HR role if not already
    const switchBtn = page.locator('button:has-text("Switch to HR View")');
    if (await switchBtn.count() > 0) {
      await switchBtn.click();
      await page.waitForTimeout(400);
    }

    // 1. Capture Candidates page
    await page.goto('http://localhost:3000/candidates', { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const candidatesPath = path.join(brainScreenshotsDir, `candidates-page-${theme}.png`);
    await page.screenshot({ path: candidatesPath });
    console.log(`Saved: ${candidatesPath}`);

    // 2. Capture Notifications popover on Candidates page
    const notifBtn = page.locator('button[title="Notifications"]');
    await notifBtn.click();
    await page.waitForTimeout(400);
    const notifPath = path.join(brainScreenshotsDir, `clean-notifications-${theme}.png`);
    await page.screenshot({ path: notifPath });
    console.log(`Saved: ${notifPath}`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);

    // 3. Capture Openings page
    await page.goto('http://localhost:3000/openings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const openingsPath = path.join(brainScreenshotsDir, `openings-page-${theme}.png`);
    await page.screenshot({ path: openingsPath });
    console.log(`Saved: ${openingsPath}`);

    await page.close();
  }

  await browser.close();
  console.log('Finished capturing all update screenshots.');
}

main().catch(console.error);
