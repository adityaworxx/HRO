import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const outDir = path.resolve('screenshots');
const artifactDir =
  'C:\\Users\\adity\\.gemini\\antigravity\\brain\\069b58e3-44c2-44dc-962c-29343339bedb';

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(artifactDir, { recursive: true });

async function main() {
  const browser = await chromium.launch({ channel: 'msedge' });

  for (const theme of ['dark', 'light']) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });

    await page.addInitScript(
      ({ currentTheme }) => {
        localStorage.setItem('theme', currentTheme);
        localStorage.setItem('hro:demo-role', 'hr');
      },
      { currentTheme: theme }
    );

    await page.goto('http://localhost:3000/candidates', { waitUntil: 'networkidle' });

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

    const outPath = path.join(outDir, `candidates-table-${theme}.png`);
    const artPath = path.join(artifactDir, `candidates-table-${theme}.png`);

    await page.screenshot({ path: outPath, fullPage: false });
    await page.screenshot({ path: artPath, fullPage: false });
    console.log(`Saved screenshot to ${outPath} and ${artPath}`);
    await page.close();
  }

  await browser.close();
}

main().catch(console.error);
