import { chromium } from '@playwright/test';
import path from 'node:path';

const artifactDir = 'C:\\Users\\adity\\.gemini\\antigravity\\brain\\fc37d0ad-3708-4d7f-8488-7ab9c4414fa2';

async function capture() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  // 1. Light Mode
  await page.goto('http://localhost:3000/openings/new', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('hro:demo-role', 'hr');
    localStorage.setItem('theme', 'light');
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  });
  await page.goto('http://localhost:3000/openings/new', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const section = page.locator('text=Candidate Profile & Screening Criteria').first();
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  const lightPath = path.join(artifactDir, 'verify-clean-screening-light.png');
  await page.screenshot({ path: lightPath });
  console.log('Saved light screenshot to', lightPath);

  // 2. Dark Mode
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add('dark');
  });
  await page.waitForTimeout(500);

  const darkPath = path.join(artifactDir, 'verify-clean-screening-dark.png');
  await page.screenshot({ path: darkPath });
  console.log('Saved dark screenshot to', darkPath);

  // 3. Test typing custom skill & clicking suggestion
  // Click "PostgreSQL" in Nice-to-Have
  const nicePgBtn = page.locator('button:has-text("PostgreSQL")').last();
  if (await nicePgBtn.isVisible()) {
    await nicePgBtn.click();
    await page.waitForTimeout(300);
  }

  // Type custom skill "GraphQL" in Must-Have
  const mustInput = page.locator('input[placeholder*="Type a skill"], input[placeholder*="Add skill"]').first();
  await mustInput.fill('GraphQL');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);

  const interactionPath = path.join(artifactDir, 'verify-clean-screening-interacted.png');
  await page.screenshot({ path: interactionPath });
  console.log('Saved interacted screenshot to', interactionPath);

  await browser.close();
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});

