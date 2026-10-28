import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const artifactDir = 'C:\\Users\\adity\\.gemini\\antigravity\\brain\\ec6c76ac-059a-4331-936d-42988c000706';
fs.mkdirSync(artifactDir, { recursive: true });

async function main() {
  const browser = await chromium.launch({ channel: 'msedge' });

  for (const theme of ['light', 'dark']) {
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

    // 1. Capture AI Matcher Sheet from /openings
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

    const aiMatchBtn = page.locator('button:has-text("AI Match")').first();
    if (await aiMatchBtn.isVisible()) {
      await aiMatchBtn.click();
      await page.waitForTimeout(800);

      const shotPath = path.join(artifactDir, `ai-matcher-sheet-${theme}-after.png`);
      await page.screenshot({ path: shotPath });
      console.log(`Saved screenshot to ${shotPath}`);

      // Close sheet
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
    }

    // 2. Open first opening detail page (click the title link inside the card)
    const cardTitleLink = page.locator('h4 a[href^="/openings/"]').first();
    if (await cardTitleLink.isVisible()) {
      await cardTitleLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(800);

      const detailShotPath = path.join(artifactDir, `opening-detail-matcher-${theme}-after.png`);
      await page.screenshot({ path: detailShotPath });
      console.log(`Saved screenshot to ${detailShotPath}`);
    }

    await page.close();
  }

  await browser.close();
}

main().catch(console.error);

