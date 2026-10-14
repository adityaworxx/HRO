import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const outDir = path.resolve('screenshots');
const artifactDir = 'C:\\Users\\adity\\.gemini\\antigravity\\brain\\069b58e3-44c2-44dc-962c-29343339bedb';

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(artifactDir, { recursive: true });

async function main() {
  const browser = await chromium.launch({ channel: 'msedge' });

  // 1. HR Mode (Dark and Light)
  for (const theme of ['dark', 'light']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.addInitScript(
      ({ currentTheme }) => {
        localStorage.setItem('hro:demo-role', 'hr');
        localStorage.setItem('theme', currentTheme);
      },
      { currentTheme: theme }
    );

    await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle' });
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
        document.querySelector('nextjs-portal')?.remove();
      },
      { currentTheme: theme }
    );

    await page.waitForTimeout(500);
    await page.evaluate(() => {
      document.querySelector('nextjs-portal')?.remove();
    });

    const filename = `settings-hr-${theme}.png`;
    await page.screenshot({ path: path.join(outDir, filename) });
    await page.screenshot({ path: path.join(artifactDir, filename) });
    console.log(`Saved: ${filename}`);
    await page.close();
  }

  // 2. Manager Mode (Dark)
  {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.addInitScript(() => {
      localStorage.setItem('hro:demo-role', 'manager');
      localStorage.setItem('theme', 'dark');
    });

    await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle' });
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.querySelector('nextjs-portal')?.remove();
    });

    await page.waitForTimeout(500);
    await page.evaluate(() => {
      document.querySelector('nextjs-portal')?.remove();
    });

    const filename = 'settings-manager-dark.png';
    await page.screenshot({ path: path.join(outDir, filename) });
    await page.screenshot({ path: path.join(artifactDir, filename) });
    console.log(`Saved: ${filename}`);
    await page.close();
  }

  await browser.close();
}

main().catch(console.error);
