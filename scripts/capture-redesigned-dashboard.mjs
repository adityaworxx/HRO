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

    await page.addInitScript(
      ({ currentTheme }) => {
        localStorage.setItem('theme', currentTheme);
      },
      { currentTheme: theme }
    );

    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

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

    const filename = `dashboard-clean-${theme}.png`;
    const localPath = path.join(outDir, filename);
    const artPath = path.join(artifactDir, filename);
    await page.screenshot({ path: localPath, fullPage: false });
    fs.copyFileSync(localPath, artPath);
    console.log(`Saved: ${filename}`);

    await page.close();
  }

  await browser.close();
  console.log('Clean dashboard screenshots captured!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
