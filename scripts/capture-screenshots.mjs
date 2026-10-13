import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const viewports = [
  { width: 1920, height: 1080, name: '1920' },
  { width: 1440, height: 900, name: '1440' },
  { width: 1280, height: 800, name: '1280' },
  { width: 1024, height: 768, name: '1024' },
  { width: 768, height: 1024, name: '768' },
];

const themes = ['dark', 'light'];
const roles = ['hr', 'manager'];

async function main() {
  const browser = await chromium.launch({ channel: 'msedge' });

  for (const role of roles) {
    for (const theme of themes) {
      for (const vp of viewports) {
        const page = await browser.newPage({
          viewport: { width: vp.width, height: vp.height },
        });

        await page.addInitScript(
          ({ currentTheme, currentRole }) => {
            localStorage.setItem('hro:demo-role', currentRole);
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
          { currentTheme: theme, currentRole: role }
        );

        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

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

        const filePath = path.join(outDir, `${role}-dashboard-${theme}-${vp.name}.png`);
        await page.screenshot({ path: filePath, fullPage: true });
        console.log(`Saved screenshot: ${filePath}`);

        await page.close();
      }
    }
  }

  await browser.close();
  console.log('All screenshots captured successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
