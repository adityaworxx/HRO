import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const outDir = path.resolve('screenshots');
const artifactDir = 'C:\\Users\\adity\\.gemini\\antigravity\\brain\\4445bf77-ea56-4237-9627-e3f6a9dd188c\\screenshots';

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(artifactDir, { recursive: true });

async function saveScreenshot(page, filename) {
  const localPath = path.join(outDir, filename);
  const artPath = path.join(artifactDir, filename);
  await page.screenshot({ path: localPath });
  fs.copyFileSync(localPath, artPath);
  console.log(`Saved: ${filename}`);
}

async function captureRole(browser, role, vp, theme) {
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
    ({ currentTheme, currentRole }) => {
      document.documentElement.setAttribute('data-theme', currentTheme);
      if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('hro:demo-role', currentRole);
    },
    { currentTheme: theme, currentRole: role }
  );

  await page.waitForTimeout(600);
  await saveScreenshot(page, `active-openings-${role}-${vp.name}-${theme}.png`);
  await page.close();
}

async function main() {
  const browser = await chromium.launch({ channel: 'msedge' });

  const viewports = [
    { name: '1440', width: 1440, height: 900 },
    { name: '1024', width: 1024, height: 900 },
  ];

  const themes = ['dark', 'light'];

  for (const vp of viewports) {
    for (const theme of themes) {
      console.log(`\n--- Capturing ${vp.name}px - ${theme.toUpperCase()} ---`);
      await captureRole(browser, 'hr', vp, theme);
      await captureRole(browser, 'manager', vp, theme);
    }
  }

  await browser.close();
  console.log('All verification screenshots captured successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

