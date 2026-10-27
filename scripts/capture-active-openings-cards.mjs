import { chromium } from '@playwright/test';
import path from 'node:path';

const artifactDir = 'C:\\Users\\adity\\.gemini\\antigravity\\brain\\fc37d0ad-3708-4d7f-8488-7ab9c4414fa2';

async function capture() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 }
  });
  const page = await context.newPage();

  // Test light theme
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('hro:demo-role', 'manager');
    localStorage.setItem('theme', 'light');
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Scroll main container to bottom
  await page.evaluate(() => {
    const main = document.querySelector('main');
    if (main) main.scrollTop = main.scrollHeight;
  });
  await page.waitForTimeout(600);

  const lightBottomPath = path.join(artifactDir, 'verify-manager-active-openings-bottom-light.png');
  await page.screenshot({ path: lightPathScreenshot(lightBottomPath) });
  console.log('Saved bottom screenshot to', lightBottomPath);

  // Test clicking next page in Engineering column
  const nextBtn = page.locator('button[title="Next page"]').first();
  if (await nextBtn.isVisible()) {
    console.log('Clicking next page in first column...');
    await nextBtn.click();
    await page.waitForTimeout(500);
    const pagedPath = path.join(artifactDir, 'verify-manager-active-openings-paged-light.png');
    await page.screenshot({ path: lightPathScreenshot(pagedPath) });
    console.log('Saved paged screenshot to', pagedPath);
  }

  await browser.close();
}

function lightPathScreenshot(p) {
  return p;
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});

