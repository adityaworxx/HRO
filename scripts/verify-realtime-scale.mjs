import { chromium } from '@playwright/test';

const artifactDir = 'C:/Users/adity/.gemini/antigravity/brain/fc37d0ad-3708-4d7f-8488-7ab9c4414fa2';

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  });

  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 950 },
  });
  const page = await ctx.newPage();

  // 1. Visit dashboard and ensure manager role
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1000);

  // Set manager role in localStorage
  await page.evaluate(() => {
    localStorage.setItem('hro:demo-role', 'manager');
  });
  await page.reload();
  await page.waitForTimeout(1500);

  await page.screenshot({
    path: `${artifactDir}/verify-manager-dashboard-search-pagination.png`,
    fullPage: false,
  });

  // 2. Test search in Candidates Awaiting Review
  const searchInput = page.locator('input[placeholder="Search candidates..."]');
  if ((await searchInput.count()) > 0) {
    await searchInput.fill('Senior');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: `${artifactDir}/verify-manager-review-search-filtered.png`,
    });
    await searchInput.fill('');
    await page.waitForTimeout(500);
  }

  // 3. Interviews View
  await page.goto('http://localhost:3000/interviews');
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: `${artifactDir}/verify-interviews-view-pagination.png`,
  });

  // 4. Shortlist Review
  await page.goto('http://localhost:3000/shortlist');
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: `${artifactDir}/verify-shortlist-review-pagination.png`,
  });

  // 5. Switch to HR role
  await page.evaluate(() => {
    localStorage.setItem('hro:demo-role', 'hr');
  });
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: `${artifactDir}/verify-hr-dashboard-sla-pagination.png`,
  });

  // 6. Pipeline Board (HR view)
  await page.goto('http://localhost:3000/pipeline');
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: `${artifactDir}/verify-pipeline-board-pagination.png`,
  });

  // 7. Candidates Directory (Columns view)
  await page.goto('http://localhost:3000/candidates');
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: `${artifactDir}/verify-candidates-columns-pagination.png`,
  });

  // 8. Onboarding Dashboard
  await page.goto('http://localhost:3000/onboarding');
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: `${artifactDir}/verify-onboarding-pagination.png`,
  });

  await browser.close();
  console.log('Visual verification complete!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
