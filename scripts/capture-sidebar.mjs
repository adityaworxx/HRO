import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const outDir = path.resolve('screenshots');
const artifactDir = 'C:\\Users\\adity\\.gemini\\antigravity\\brain\\4445bf77-ea56-4237-9627-e3f6a9dd188c\\screenshots';

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(artifactDir, { recursive: true });

async function main() {
  const browser = await chromium.launch({ channel: 'msedge' });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  await page.addInitScript(() => {
    localStorage.setItem('hro:demo-role', 'hr');
    localStorage.setItem('theme', 'dark');
    localStorage.setItem('hro:sidebar-collapsed', 'false');
  });

  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // 1. Capture Expanded Sidebar
  const expandedLocal = path.join(outDir, 'sidebar-expanded-dark.png');
  const expandedArt = path.join(artifactDir, 'sidebar-expanded-dark.png');
  await page.screenshot({ path: expandedLocal, clip: { x: 0, y: 0, width: 320, height: 700 } });
  fs.copyFileSync(expandedLocal, expandedArt);
  console.log('Saved: sidebar-expanded-dark.png');

  // Measure icon X position before collapse
  const firstIconBefore = await page.locator('nav[aria-label="Main Navigation"] svg').first().boundingBox();
  console.log('First icon position before collapse:', firstIconBefore);

  // 2. Collapse Sidebar by clicking collapse button
  const collapseBtn = page.locator('button[title*="Collapse sidebar"]');
  await collapseBtn.click();
  await page.waitForTimeout(400); // Wait for 200ms transition + buffer

  // Measure icon X position after collapse
  const firstIconAfter = await page.locator('nav[aria-label="Main Navigation"] svg').first().boundingBox();
  console.log('First icon position after collapse:', firstIconAfter);

  const deltaX = Math.abs((firstIconBefore?.x ?? 0) - (firstIconAfter?.x ?? 0));
  console.log(`Icon X movement: ${deltaX.toFixed(2)}px (should be ~0px)`);

  // Capture Collapsed Sidebar
  const collapsedLocal = path.join(outDir, 'sidebar-collapsed-dark.png');
  const collapsedArt = path.join(artifactDir, 'sidebar-collapsed-dark.png');
  await page.screenshot({ path: collapsedLocal, clip: { x: 0, y: 0, width: 200, height: 700 } });
  fs.copyFileSync(collapsedLocal, collapsedArt);
  console.log('Saved: sidebar-collapsed-dark.png');

  // 3. Hover over an icon to trigger the Radix Tooltip popup
  const candidatesNav = page.locator('nav[aria-label="Main Navigation"] a[href="/candidates"]');
  await candidatesNav.hover();
  await page.waitForTimeout(300);

  // Capture Collapsed Sidebar with Popup Tooltip
  const popupLocal = path.join(outDir, 'sidebar-collapsed-popup-dark.png');
  const popupArt = path.join(artifactDir, 'sidebar-collapsed-popup-dark.png');
  await page.screenshot({ path: popupLocal, clip: { x: 0, y: 0, width: 260, height: 500 } });
  fs.copyFileSync(popupLocal, popupArt);
  console.log('Saved: sidebar-collapsed-popup-dark.png');

  // 4. Also capture light mode with popup
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
  });
  await page.waitForTimeout(300);

  const popupLightLocal = path.join(outDir, 'sidebar-collapsed-popup-light.png');
  const popupLightArt = path.join(artifactDir, 'sidebar-collapsed-popup-light.png');
  await page.screenshot({ path: popupLightLocal, clip: { x: 0, y: 0, width: 260, height: 500 } });
  fs.copyFileSync(popupLightLocal, popupLightArt);
  console.log('Saved: sidebar-collapsed-popup-light.png');

  await page.close();
  await browser.close();
  console.log('All sidebar tests completed successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
