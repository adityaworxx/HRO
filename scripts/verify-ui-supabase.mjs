import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const screenshotDir =
  'C:/Users/adity/.gemini/antigravity/brain/4445bf77-ea56-4237-9627-e3f6a9dd188c/screenshots';
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function verifyUI() {
  console.log('🌐 Launching browser for complete UI & Workflow Verification...');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome' });
  } catch {
    browser = await chromium.launch({ channel: 'msedge' });
  }

  // Helper to toggle theme
  async function setTheme(page, theme) {
    await page.evaluate((t) => {
      if (t === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }, theme);
    await page.waitForTimeout(400);
  }

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // Set active role to HR
  await page.addInitScript(() => {
    localStorage.setItem('hro:active-role', 'hr');
  });

  try {
    // 1. Dashboard as Manager
    console.log('Testing Dashboard...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    await setTheme(page, 'light');
    await page.screenshot({
      path: path.join(screenshotDir, 'supabase-dashboard-light.png'),
      fullPage: true,
    });

    await setTheme(page, 'dark');
    await page.screenshot({
      path: path.join(screenshotDir, 'supabase-dashboard-dark.png'),
      fullPage: true,
    });
    console.log('✓ Captured Manager Dashboard (Light & Dark)');

    // Switch to HR View by clicking the visible Role Switcher
    console.log('Switching to HR Role...');
    const switchButtons = page.locator('button:has-text("Demo Role")');
    const count = await switchButtons.count();
    for (let i = 0; i < count; i++) {
      if (await switchButtons.nth(i).isVisible()) {
        await switchButtons.nth(i).click();
        console.log(`✓ Clicked visible role switch button at index ${i}`);
        break;
      }
    }
    await page.waitForTimeout(1000);

    // 2. Openings
    console.log('Testing Openings Table...');
    await page.goto('http://localhost:3000/openings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    await setTheme(page, 'light');
    await page.screenshot({
      path: path.join(screenshotDir, 'supabase-openings-light.png'),
      fullPage: true,
    });

    await setTheme(page, 'dark');
    await page.screenshot({
      path: path.join(screenshotDir, 'supabase-openings-dark.png'),
      fullPage: true,
    });
    console.log('✓ Captured Openings (Light & Dark)');

    // 3. Candidates Pipeline
    console.log('Testing Candidates Table...');
    await page.goto('http://localhost:3000/candidates', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    await setTheme(page, 'light');
    await page.screenshot({
      path: path.join(screenshotDir, 'supabase-candidates-light.png'),
      fullPage: true,
    });

    await setTheme(page, 'dark');
    await page.screenshot({
      path: path.join(screenshotDir, 'supabase-candidates-dark.png'),
      fullPage: true,
    });
    console.log('✓ Captured Candidates Table (Light & Dark)');

    // 3b. Kanban Pipeline Board
    console.log('Testing Kanban Pipeline Board...');
    await page.goto('http://localhost:3000/pipeline', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    await setTheme(page, 'dark');
    await page.screenshot({
      path: path.join(screenshotDir, 'supabase-pipeline-dark.png'),
      fullPage: true,
    });
    console.log('✓ Captured Kanban Pipeline Board');

    // 4. Onboarding Checklist
    console.log('Testing Onboarding Checklist...');
    await page.goto('http://localhost:3000/onboarding', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    await setTheme(page, 'light');
    await page.screenshot({
      path: path.join(screenshotDir, 'supabase-onboarding-light.png'),
      fullPage: true,
    });

    await setTheme(page, 'dark');
    await page.screenshot({
      path: path.join(screenshotDir, 'supabase-onboarding-dark.png'),
      fullPage: true,
    });
    console.log('✓ Captured Onboarding (Light & Dark)');

    // 5. Reports & Funnels
    console.log('Testing Reports & Funnels...');
    await page.goto('http://localhost:3000/reports', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    await setTheme(page, 'light');
    await page.screenshot({
      path: path.join(screenshotDir, 'supabase-reports-light.png'),
      fullPage: true,
    });

    await setTheme(page, 'dark');
    await page.screenshot({
      path: path.join(screenshotDir, 'supabase-reports-dark.png'),
      fullPage: true,
    });
    console.log('✓ Captured Reports (Light & Dark)');

    // 6. Mobile Viewport (Responsive test)
    console.log('Testing Mobile Viewport (390x844)...');
    const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await mobilePage.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(2000);
    await mobilePage.screenshot({
      path: path.join(screenshotDir, 'supabase-mobile-dashboard.png'),
      fullPage: true,
    });
    console.log('✓ Captured Mobile Dashboard');
    await mobilePage.close();

    console.log('\n🎉 ALL UI & SCREENSHOT VERIFICATIONS COMPLETED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ UI test error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verifyUI();
