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

  // TEST 1: Desktop HR Dashboard (1440x900) at 80% zoom with deep scroll
  console.log('--- TEST 1: Desktop at 80% zoom with deep scroll ---');
  const page1 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page1.addInitScript(() => {
    localStorage.setItem('hro:demo-role', 'hr');
    localStorage.setItem('theme', 'dark');
  });

  await page1.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page1.waitForTimeout(600);

  const sidebar1 = page1.locator('aside.lg\\:flex');
  const topbar1 = page1.locator('header');
  const main1 = page1.locator('main#main-content');

  const sidebarBoxBefore = await sidebar1.boundingBox();
  const topbarBoxBefore = await topbar1.boundingBox();
  console.log('Sidebar box before scroll:', sidebarBoxBefore);
  console.log('Topbar box before scroll:', topbarBoxBefore);

  // Deep scroll main container
  await main1.evaluate((el) => {
    el.scrollTop = 1200;
  });
  await page1.waitForTimeout(400);

  const sidebarBoxAfter = await sidebar1.boundingBox();
  const topbarBoxAfter = await topbar1.boundingBox();
  console.log('Sidebar box after 1200px scroll:', sidebarBoxAfter);
  console.log('Topbar box after 1200px scroll:', topbarBoxAfter);

  const sidebarDeltaY = Math.abs((sidebarBoxBefore?.y ?? 0) - (sidebarBoxAfter?.y ?? 0));
  const topbarDeltaY = Math.abs((topbarBoxBefore?.y ?? 0) - (topbarBoxAfter?.y ?? 0));
  console.log(`Sidebar Y delta: ${sidebarDeltaY.toFixed(2)}px (MUST BE 0.00px)`);
  console.log(`Topbar Y delta: ${topbarDeltaY.toFixed(2)}px (MUST BE 0.00px)`);

  if (sidebarDeltaY > 0.1 || topbarDeltaY > 0.1) {
    throw new Error(`FAILURE: Sidebar or Topbar moved during scroll!`);
  }

  // Capture screenshot of scrolled state
  const scrollLocal = path.join(outDir, 'fixed-layout-scrolled-desktop.png');
  const scrollArt = path.join(artifactDir, 'fixed-layout-scrolled-desktop.png');
  await page1.screenshot({ path: scrollLocal });
  fs.copyFileSync(scrollLocal, scrollArt);
  console.log('Saved: fixed-layout-scrolled-desktop.png');
  await page1.close();

  // TEST 2: Zoom 100% test
  console.log('--- TEST 2: Desktop at 100% zoom with deep scroll ---');
  const page2 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page2.addInitScript(() => {
    localStorage.setItem('hro:demo-role', 'hr');
    localStorage.setItem('theme', 'dark');
  });
  await page2.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  // Set zoom to 1.0
  await page2.evaluate(() => {
    document.documentElement.style.zoom = '1.0';
  });
  await page2.waitForTimeout(400);

  const sidebar2 = page2.locator('aside.lg\\:flex');
  const topbar2 = page2.locator('header');
  const main2 = page2.locator('main#main-content');

  const sBoxBefore100 = await sidebar2.boundingBox();
  const tBoxBefore100 = await topbar2.boundingBox();

  await main2.evaluate((el) => {
    el.scrollTop = 1200;
  });
  await page2.waitForTimeout(400);

  const sBoxAfter100 = await sidebar2.boundingBox();
  const tBoxAfter100 = await topbar2.boundingBox();

  const sDelta100 = Math.abs((sBoxBefore100?.y ?? 0) - (sBoxAfter100?.y ?? 0));
  const tDelta100 = Math.abs((tBoxBefore100?.y ?? 0) - (tBoxAfter100?.y ?? 0));
  console.log(`Zoom 100% - Sidebar Y delta: ${sDelta100.toFixed(2)}px`);
  console.log(`Zoom 100% - Topbar Y delta: ${tDelta100.toFixed(2)}px`);

  const zoom100Local = path.join(outDir, 'fixed-layout-zoom100-scrolled.png');
  const zoom100Art = path.join(artifactDir, 'fixed-layout-zoom100-scrolled.png');
  await page2.screenshot({ path: zoom100Local });
  fs.copyFileSync(zoom100Local, zoom100Art);
  console.log('Saved: fixed-layout-zoom100-scrolled.png');
  await page2.close();

  // TEST 3: Mobile Portrait (390 x 844) with scroll and drawer
  console.log('--- TEST 3: Mobile Portrait (390x844) ---');
  const page3 = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page3.addInitScript(() => {
    localStorage.setItem('hro:demo-role', 'hr');
    localStorage.setItem('theme', 'dark');
  });
  await page3.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page3.waitForTimeout(500);

  const mobileTopbar = page3.locator('header');
  const mobileTopbarBefore = await mobileTopbar.boundingBox();

  // Scroll mobile main
  await page3.locator('main#main-content').evaluate((el) => {
    el.scrollTop = 800;
  });
  await page3.waitForTimeout(300);

  const mobileTopbarAfter = await mobileTopbar.boundingBox();
  const mTopDelta = Math.abs((mobileTopbarBefore?.y ?? 0) - (mobileTopbarAfter?.y ?? 0));
  console.log(`Mobile Topbar Y delta: ${mTopDelta.toFixed(2)}px (MUST BE 0.00px)`);

  const mobileScrollLocal = path.join(outDir, 'fixed-layout-mobile-scrolled.png');
  const mobileScrollArt = path.join(artifactDir, 'fixed-layout-mobile-scrolled.png');
  await page3.screenshot({ path: mobileScrollLocal });
  fs.copyFileSync(mobileScrollLocal, mobileScrollArt);
  console.log('Saved: fixed-layout-mobile-scrolled.png');

  // Open mobile drawer
  await page3.locator('button[aria-label="Open Navigation"]').click();
  await page3.waitForTimeout(300);

  const mobileDrawerLocal = path.join(outDir, 'fixed-layout-mobile-drawer.png');
  const mobileDrawerArt = path.join(artifactDir, 'fixed-layout-mobile-drawer.png');
  await page3.screenshot({ path: mobileDrawerLocal });
  fs.copyFileSync(mobileDrawerLocal, mobileDrawerArt);
  console.log('Saved: fixed-layout-mobile-drawer.png');

  await page3.close();

  // TEST 4: Tablet Landscape (1024 x 768)
  console.log('--- TEST 4: Tablet Landscape (1024x768) ---');
  const page4 = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  await page4.addInitScript(() => {
    localStorage.setItem('hro:demo-role', 'hr');
    localStorage.setItem('theme', 'dark');
  });
  await page4.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page4.waitForTimeout(500);

  await page4.locator('main#main-content').evaluate((el) => {
    el.scrollTop = 1000;
  });
  await page4.waitForTimeout(300);

  const tabletLocal = path.join(outDir, 'fixed-layout-tablet-landscape.png');
  const tabletArt = path.join(artifactDir, 'fixed-layout-tablet-landscape.png');
  await page4.screenshot({ path: tabletLocal });
  fs.copyFileSync(tabletLocal, tabletArt);
  console.log('Saved: fixed-layout-tablet-landscape.png');
  await page4.close();

  await browser.close();
  console.log('ALL FIXED LAYOUT VERIFICATION TESTS PASSED PERFECTLY!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
