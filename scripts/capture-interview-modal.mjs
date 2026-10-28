import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const outDir = path.resolve('screenshots');
const artifactDir =
  'C:\\Users\\adity\\.gemini\\antigravity\\brain\\4445bf77-ea56-4237-9627-e3f6a9dd188c\\screenshots';

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(artifactDir, { recursive: true });

async function main() {
  const browser = await chromium.launch({ channel: 'msedge' });

  for (const theme of ['dark', 'light']) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });

    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`[Console Error] ${msg.text()}`);
    });
    page.on('pageerror', (err) => {
      errors.push(`[Page Error] ${err.message}`);
    });

    await page.addInitScript(
      ({ currentTheme }) => {
        localStorage.setItem('theme', currentTheme);
      },
      { currentTheme: theme }
    );

    await page.goto('http://localhost:3000/interviews', { waitUntil: 'networkidle' });

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

    // Click Reschedule button to open the modal
    const rescheduleBtn = page.locator('button:has-text("Reschedule")').first();
    await rescheduleBtn.click();
    await page.waitForTimeout(400);

    // Save modal overview screenshot
    const modalFilename = `interview-schedule-modal-${theme}.png`;
    const modalLocal = path.join(outDir, modalFilename);
    const modalArt = path.join(artifactDir, modalFilename);
    await page.screenshot({ path: modalLocal });
    fs.copyFileSync(modalLocal, modalArt);
    console.log(`Saved: ${modalFilename}`);

    // Click the Date Time Picker to show custom calendar & time slots
    const dtTrigger = page.locator('button:has-text("Oct")').first();
    if (await dtTrigger.isVisible()) {
      await dtTrigger.click();
      await page.waitForTimeout(400);

      const dtFilename = `interview-datetime-picker-${theme}.png`;
      const dtLocal = path.join(outDir, dtFilename);
      const dtArt = path.join(artifactDir, dtFilename);
      await page.screenshot({ path: dtLocal });
      fs.copyFileSync(dtLocal, dtArt);
      console.log(`Saved: ${dtFilename}`);

      // Close the date time picker by pressing Escape or clicking outside
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }

    // Click the Format Select dropdown
    const formatTrigger = page.locator('button[role="combobox"]').first();
    if (await formatTrigger.isVisible()) {
      await formatTrigger.click();
      await page.waitForTimeout(400);

      const formatFilename = `interview-format-select-${theme}.png`;
      const formatLocal = path.join(outDir, formatFilename);
      const formatArt = path.join(artifactDir, formatFilename);
      await page.screenshot({ path: formatLocal });
      fs.copyFileSync(formatLocal, formatArt);
      console.log(`Saved: ${formatFilename}`);
    }

    await page.close();

    if (errors.length > 0) {
      console.error(`Errors in ${theme}:`, errors);
      throw new Error(`Encountered ${errors.length} errors in ${theme}`);
    }
  }

  await browser.close();
  console.log('Interview schedule modal and controls captured successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
