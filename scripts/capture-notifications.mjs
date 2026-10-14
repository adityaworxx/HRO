import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const outDir = path.resolve('screenshots');
const artifactDir = 'C:\\Users\\adity\\.gemini\\antigravity\\brain\\4445bf77-ea56-4237-9627-e3f6a9dd188c\\screenshots';

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(artifactDir, { recursive: true });

async function main() {
  const browser = await chromium.launch({ channel: 'msedge' });

  for (const theme of ['dark', 'light']) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });

    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`[Console Error] ${msg.text()}`);
    });
    page.on('pageerror', (err) => {
      errors.push(`[Page Error] ${err.message}`);
    });

    await page.addInitScript(
      ({ currentTheme }) => {
        localStorage.setItem('hro:demo-role', 'manager');
        localStorage.setItem('theme', currentTheme);
      },
      { currentTheme: theme }
    );

    await page.goto('http://localhost:3000/openings', { waitUntil: 'networkidle' });

    await page.evaluate(
      ({ currentTheme }) => {
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

    await page.waitForTimeout(1000);

    try {
      const bellBtn = page.locator('button[title="Notifications"]');
      await bellBtn.waitFor({ state: 'visible', timeout: 5000 });
      await bellBtn.click();
    } catch (e) {
      console.error('Failed to click bellBtn:', e.message);
      await page.screenshot({ path: path.join(outDir, `debug-${theme}.png`) });
      throw e;
    }
    await page.waitForTimeout(400);

    const notifFilename = `notifications-modal-${theme}.png`;
    const notifLocal = path.join(outDir, notifFilename);
    const notifArt = path.join(artifactDir, notifFilename);
    await page.screenshot({ path: notifLocal });
    fs.copyFileSync(notifLocal, notifArt);
    console.log(`Saved: ${notifFilename}`);

    await page.close();

    if (errors.length > 0) {
      console.error(`Errors in ${theme}:`, errors);
      throw new Error(`Encountered ${errors.length} errors in ${theme}`);
    }
  }

  await browser.close();
  console.log('Notifications modal captured successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
