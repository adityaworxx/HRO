import { chromium } from '@playwright/test';

async function debugZoom() {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => {
    localStorage.setItem('hro:demo-role', 'hr');
  });

  // Test with zoom 0.8 on html
  await page.goto('http://localhost:3000/openings', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.documentElement.style.zoom = '0.8';
  });
  await page.waitForTimeout(500);

  const deptSelect = page.locator('button:has-text("All Departments")').first();
  await deptSelect.click();
  await page.waitForTimeout(400);

  const wrapper = page.locator('[data-radix-popper-content-wrapper]').first();
  const style = await wrapper.getAttribute('style');
  const triggerBox = await deptSelect.boundingBox();
  const wrapperBox = await wrapper.boundingBox();

  console.log('Trigger box:', triggerBox);
  console.log('Wrapper box:', wrapperBox);
  console.log('Inline style on wrapper:', style);

  // Check what getBoundingClientRect returns inside the page context
  const rects = await page.evaluate(() => {
    const trigger = document.querySelector('button[aria-haspopup="listbox"], button:has-text("All Departments")');
    const wrap = document.querySelector('[data-radix-popper-content-wrapper]');
    return {
      triggerRect: trigger ? trigger.getBoundingClientRect() : null,
      wrapRect: wrap ? wrap.getBoundingClientRect() : null,
      htmlZoom: getComputedStyle(document.documentElement).zoom,
      bodyZoom: getComputedStyle(document.body).zoom,
    };
  });
  console.log('In-page rects:', rects);

  await browser.close();
}

debugZoom();

