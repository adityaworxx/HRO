import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const outDir = path.resolve('screenshots');
const artifactDir = 'C:\\Users\\adity\\.gemini\\antigravity\\brain\\abccb2a8-a80b-4f8d-b383-071a2318056f';

fs.mkdirSync(outDir, { recursive: true });

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
        localStorage.setItem('theme', currentTheme);
      },
      { currentTheme: theme }
    );

    await page.goto('http://localhost:3000/shortlist', { waitUntil: 'networkidle' });

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

    // 1. Capture columns view
    const columnsFilename = `shortlist-columns-${theme}.png`;
    const localColumnsPath = path.join(outDir, columnsFilename);
    const artColumnsPath = path.join(artifactDir, columnsFilename);
    await page.screenshot({ path: localColumnsPath });
    fs.copyFileSync(localColumnsPath, artColumnsPath);
    console.log(`Saved: ${columnsFilename}`);

    // 2. Click the first candidate card to open review sheet
    const firstCard = page.locator('div[role="button"]:has-text("exp")').first();
    if (await firstCard.isVisible()) {
      await firstCard.click();
      await page.waitForTimeout(800);

      const sheetFilename = `shortlist-sheet-opened-${theme}.png`;
      const localSheetPath = path.join(outDir, sheetFilename);
      const artSheetPath = path.join(artifactDir, sheetFilename);
      await page.screenshot({ path: localSheetPath });
      fs.copyFileSync(localSheetPath, artSheetPath);
      console.log(`Saved: ${sheetFilename}`);
    }

    await page.close();
  }

  await browser.close();
  console.log('Shortlist columns verification complete!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

