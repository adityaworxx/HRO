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

async function main() {
  const browser = await chromium.launch({ channel: 'msedge' });

  for (const theme of ['light', 'dark']) {
    console.log(`\n--- Capturing ${theme.toUpperCase()} theme ---`);
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });

    await page.addInitScript(
      ({ currentTheme }) => {
        localStorage.setItem('hro:demo-role', 'manager');
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
      { currentTheme: theme }
    );

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

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

    await page.waitForTimeout(600);

    // 1. Sidebar & Dashboard rows overview
    await saveScreenshot(page, `feel-sidebar-dashboard-${theme}.png`);

    // 2. Open Command Palette (Ctrl+K), press arrow down to highlight row
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(400);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(200);
    await saveScreenshot(page, `feel-command-palette-${theme}.png`);

    // Close command palette
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // 3. Open Profile Dropdown
    const profileBtn = page.locator('button[aria-label="User profile menu"]');
    await profileBtn.click();
    await page.waitForTimeout(400);
    await saveScreenshot(page, `feel-dropdown-${theme}.png`);

    // Close dropdown
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // 4. Open Notifications Popover
    const notifBtn = page.locator('button[title="Notifications"]');
    await notifBtn.click();
    await page.waitForTimeout(400);
    await saveScreenshot(page, `feel-notifications-${theme}.png`);

    // Close notifications
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // 5. Open Candidate Profile Sheet Drawer (or Dialog)
    const profileSheetBtn = page.locator('button:has-text("Profile")').first();
    if (await profileSheetBtn.isVisible()) {
      await profileSheetBtn.click();
      await page.waitForTimeout(400);
      await saveScreenshot(page, `feel-dialog-sheet-${theme}.png`);

      // Close sheet
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }

    await page.close();
  }

  await browser.close();
  console.log('\nAll FEEL SYSTEM screenshots captured successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
