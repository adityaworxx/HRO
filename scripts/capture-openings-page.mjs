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

    await page.waitForTimeout(600);

    // Save table screenshot
    const tableFilename = `openings-table-${theme}.png`;
    const tableLocalPath = path.join(outDir, tableFilename);
    const tableArtPath = path.join(artifactDir, tableFilename);
    await page.screenshot({ path: tableLocalPath });
    fs.copyFileSync(tableLocalPath, tableArtPath);
    console.log(`Saved: ${tableFilename}`);

    // Click the select trigger to open the custom dropdown menu
    const selectTrigger = page.locator('button[role="combobox"]').first();
    if (await selectTrigger.isVisible()) {
      await selectTrigger.click();
      await page.waitForTimeout(400);
    }

    const filename = `openings-dropdown-${theme}.png`;
    const localPath = path.join(outDir, filename);
    const artPath = path.join(artifactDir, filename);
    await page.screenshot({ path: localPath });
    fs.copyFileSync(localPath, artPath);
    console.log(`Saved: ${filename}`);
    await page.close();

    if (errors.length > 0) {
      console.error(`Errors in ${theme}:`, errors);
      throw new Error(`Encountered ${errors.length} errors in ${theme}`);
    }
  }

  await browser.close();
  console.log('Openings table captured successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
