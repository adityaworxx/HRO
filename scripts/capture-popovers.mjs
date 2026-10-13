import { chromium } from '@playwright/test';
import path from 'node:path';

const outDir = path.resolve('screenshots');

async function main() {
  const browser = await chromium.launch({ channel: 'msedge' });

  for (const theme of ['dark', 'light']) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });

    await page.addInitScript(
      ({ currentTheme }) => {
        localStorage.setItem('hro:demo-role', 'manager');
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

    await page.waitForTimeout(600);

    // 1. Capture Notification Popover open
    const notifBtn = page.locator('button[title="Notifications"]');
    await notifBtn.click();
    await page.waitForTimeout(400);

    const notifPath = path.join(outDir, `notifications-popover-${theme}.png`);
    await page.screenshot({ path: notifPath });
    console.log(`Saved: ${notifPath}`);

    // Close notifications by pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // 2. Open Search Command Palette
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(500);

    const searchPath = path.join(outDir, `search-command-palette-${theme}.png`);
    await page.screenshot({ path: searchPath });
    console.log(`Saved: ${searchPath}`);

    await page.close();
  }

  await browser.close();
  console.log('Popover & Search screenshots captured successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

