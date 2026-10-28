import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const outDir = path.resolve('screenshots/responsive-suite');
fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: 'phone-375', width: 375, height: 667 },
  { name: 'phone-414', width: 414, height: 896 },
  { name: 'phone-landscape-812', width: 812, height: 375 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'laptop-1280', width: 1280, height: 800 },
  { name: 'desktop-1440', width: 1440, height: 900 },
];

const routes = [
  { path: '/', name: 'dashboard' },
  { path: '/onboarding', name: 'onboarding' },
  { path: '/candidates', name: 'candidates' },
  { path: '/openings', name: 'openings' },
  { path: '/pipeline', name: 'pipeline' },
  { path: '/reports', name: 'reports' },
  { path: '/settings', name: 'settings' },
];

async function main() {
  const browser = await chromium.launch({ channel: 'msedge' });

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.addInitScript(() => {
      localStorage.setItem('hro:demo-role', 'hr');
      localStorage.setItem('theme', 'dark');
    });

    for (const r of routes) {
      await page.goto(`http://localhost:3000${r.path}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.classList.add('dark');
      });
      await page.waitForTimeout(250);
      await page.screenshot({ path: path.join(outDir, `${r.name}-${vp.name}.png`) });
    }

    // On phone-375, also test mobile sidebar open state
    if (vp.name === 'phone-375') {
      await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.classList.add('dark');
      });
      await page.waitForTimeout(200);
      const menuBtn = page.getByRole('button', { name: /Open Navigation/i });
      if (await menuBtn.isVisible()) {
        await menuBtn.click();
        await page.waitForTimeout(350);
        await page.screenshot({ path: path.join(outDir, 'mobile-drawer-open-375.png') });
      }
    }

    await page.close();
    console.log(`Finished viewport: ${vp.name}`);
  }

  await browser.close();
  console.log('All responsive suite captures completed successfully!');
}

main().catch(console.error);
