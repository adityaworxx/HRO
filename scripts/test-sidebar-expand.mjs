import { chromium } from '@playwright/test';
import path from 'node:path';

const screenshotDir = 'C:/Users/adity/.gemini/antigravity/brain/4445bf77-ea56-4237-9627-e3f6a9dd188c/screenshots';

async function testSidebar() {
  console.log('🧪 Testing Sidebar Collapse & Expand...');
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const aside = page.locator('aside.hidden.lg\\:flex');

    // 1. Initial State: Expanded (w-60 = 240px * 0.8 zoom = 192px)
    let box = await aside.boundingBox();
    console.log(`Initial sidebar width: ${box?.width}px (Expected ~192px at 80% zoom)`);
    if (!box || Math.abs(box.width - 192) > 3) {
      throw new Error(`Expected ~192px, got ${box?.width}`);
    }

    // 2. Click Collapse button in sidebar
    console.log('Action: Clicking collapse button in sidebar header...');
    const collapseBtn = aside.locator('button[aria-label="Collapse sidebar"]');
    await collapseBtn.click();
    await page.waitForTimeout(500);

    box = await aside.boundingBox();
    console.log(`Collapsed sidebar width: ${box?.width}px (Expected ~51.2px at 80% zoom)`);
    if (!box || Math.abs(box.width - 51.2) > 3) {
      throw new Error(`Expected ~51.2px, got ${box?.width}`);
    }
    await page.screenshot({ path: path.join(screenshotDir, 'sidebar-test-collapsed.png') });

    // 3. Click Expand button in collapsed sidebar header (H logo / PanelLeftOpen)
    console.log('Action: Clicking expand button in collapsed sidebar header...');
    const expandBtnSidebar = aside.locator('button[aria-label="Expand sidebar"]');
    await expandBtnSidebar.click();
    await page.waitForTimeout(500);

    box = await aside.boundingBox();
    console.log(`Expanded sidebar width after clicking sidebar button: ${box?.width}px (Expected ~192px)`);
    if (!box || Math.abs(box.width - 192) > 3) {
      throw new Error(`Expected ~192px, got ${box?.width}`);
    }
    await page.screenshot({ path: path.join(screenshotDir, 'sidebar-test-expanded.png') });

    // 5. Test Ctrl+B keyboard shortcut
    console.log('Action: Pressing Control+b to collapse...');
    await page.click('body');
    await page.keyboard.press('Control+KeyB');
    await page.waitForTimeout(500);

    box = await aside.boundingBox();
    console.log(`Sidebar width after Control+b: ${box?.width}px (Expected ~51.2px)`);
    if (!box || Math.abs(box.width - 51.2) > 3) {
      throw new Error(`Expected ~51.2px, got ${box?.width}`);
    }

    console.log('Action: Pressing Control+b to expand...');
    await page.keyboard.press('Control+KeyB');
    await page.waitForTimeout(500);

    box = await aside.boundingBox();
    console.log(`Sidebar width after second Control+b: ${box?.width}px (Expected ~192px)`);
    if (!box || Math.abs(box.width - 192) > 3) {
      throw new Error(`Expected ~192px, got ${box?.width}`);
    }

    console.log('\n🎉 ALL SIDEBAR COLLAPSE & EXPAND WORKFLOWS WORKING 100% PERFECTLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testSidebar();
