import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const artifactDir =
  'C:\\Users\\adity\\.gemini\\antigravity\\brain\\abccb2a8-a80b-4f8d-b383-071a2318056f';

async function main() {
  const browser = await chromium.launch({ channel: 'msedge' });

  for (const theme of ['light', 'dark']) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });

    await page.addInitScript(
      ({ currentTheme }) => {
        localStorage.setItem('theme', currentTheme);
        localStorage.setItem('hro:demo-role', 'manager');
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

    // Full page screenshot
    const pageFile = `shortlist-page-${theme}.png`;
    await page.screenshot({ path: path.join(artifactDir, pageFile) });
    console.log(`Saved ${pageFile}`);

    // Queue card screenshot
    const queueCard = await page.locator('.space-y-2\\.5 > div').first();
    if (await queueCard.isVisible()) {
      const cardFile = `shortlist-queue-card-${theme}.png`;
      await queueCard.screenshot({ path: path.join(artifactDir, cardFile) });
      console.log(`Saved ${cardFile}`);
    }

    // Assessment panel screenshot
    const panel = await page.locator('.lg\\:col-span-7 .rounded-\\[10px\\]').first();
    if (await panel.isVisible()) {
      const panelFile = `shortlist-assessment-panel-${theme}.png`;
      await panel.screenshot({ path: path.join(artifactDir, panelFile) });
      console.log(`Saved ${panelFile}`);
    }

    await page.close();
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
