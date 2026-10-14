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

    await page.addInitScript(
      ({ currentTheme }) => {
        localStorage.setItem('hro:demo-role', 'hr');
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

    await page.waitForTimeout(500);

    // Look for a Reactivate button or trigger toast
    const reactivateBtn = page.locator('button:has-text("Reactivate")').first();
    await reactivateBtn.waitFor({ state: 'visible', timeout: 5000 });
    await reactivateBtn.click();

    const toastLocator = page.locator('[data-sonner-toast]');
    await toastLocator.waitFor({ state: 'visible', timeout: 5000 });
    await page.waitForTimeout(400);

    const toastFilename = `toast-${theme}.png`;
    const toastLocal = path.join(outDir, toastFilename);
    const toastArt = path.join(artifactDir, toastFilename);
    await page.screenshot({ path: toastLocal });
    fs.copyFileSync(toastLocal, toastArt);
    console.log(`Saved: ${toastFilename}`);

    await page.close();
  }

  await browser.close();
  console.log('Toasts captured successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
