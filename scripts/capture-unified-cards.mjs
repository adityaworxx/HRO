import { chromium } from '@playwright/test';

const artifactDir = 'C:/Users/adity/.gemini/antigravity/brain/fc37d0ad-3708-4d7f-8488-7ab9c4414fa2';

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  });

  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await ctx.newPage();

  // 1. Manager Dashboard (Manager role)
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    localStorage.setItem('hro:demo-role', 'manager');
  });
  await page.reload();
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: `${artifactDir}/unified-cards-manager-dashboard.png`,
    fullPage: false,
  });

  // 2. Shortlist Review (Manager role)
  await page.goto('http://localhost:3000/shortlist');
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: `${artifactDir}/unified-cards-shortlist-review.png`,
    fullPage: false,
  });

  // 3. Switch to HR role
  await page.evaluate(() => {
    localStorage.setItem('hro:demo-role', 'hr');
  });

  // 4. Pipeline Board (HR role)
  await page.goto('http://localhost:3000/pipeline');
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: `${artifactDir}/unified-cards-pipeline-board.png`,
    fullPage: false,
  });

  // 5. Candidates Directory - Columns View (HR role)
  await page.goto('http://localhost:3000/candidates');
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: `${artifactDir}/unified-cards-candidates-columns.png`,
    fullPage: false,
  });

  // 6. Openings Directory - Columns View (HR role)
  await page.goto('http://localhost:3000/openings');
  await page.waitForTimeout(1500);
  // Switch to Columns/Cards view if not active
  const cardsBtn = page.locator('button', { hasText: 'Columns' });
  if (await cardsBtn.count() > 0) {
    await cardsBtn.click();
    await page.waitForTimeout(800);
  }
  await page.screenshot({
    path: `${artifactDir}/unified-cards-openings-columns.png`,
    fullPage: false,
  });

  await browser.close();
  console.log('Unified cards screenshots captured successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
