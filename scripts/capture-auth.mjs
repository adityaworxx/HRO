import { chromium } from '@playwright/test';
import path from 'node:path';

const artifactDir = 'C:\\Users\\adity\\.gemini\\antigravity\\brain\\abccb2a8-a80b-4f8d-b383-071a2318056f';

async function main() {
  const browser = await chromium.launch({ channel: 'msedge' });

  for (const pageType of ['login', 'register']) {
    for (const theme of ['light', 'dark']) {
      const page = await browser.newPage({
        viewport: { width: 1440, height: 900 },
      });

      await page.addInitScript(({ currentTheme }) => {
        localStorage.setItem('theme', currentTheme);
      }, { currentTheme: theme });

      await page.goto(`http://localhost:3000/${pageType}`, { waitUntil: 'networkidle' });

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

      await page.waitForTimeout(800);

      const filename = `auth-${pageType}-${theme}.png`;
      await page.screenshot({ path: path.join(artifactDir, filename) });
      console.log(`Saved: ${filename}`);
      await page.close();
    }
  }

  await browser.close();
  console.log('Auth screenshots captured successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

