import { chromium } from '@playwright/test';

async function check() {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/openings', { waitUntil: 'networkidle' });

  const result = await page.evaluate(() => {
    const rules = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (
            rule.selectorText &&
            (rule.selectorText.includes('html') ||
              rule.selectorText.includes('popper') ||
              rule.selectorText.includes('zoom'))
          ) {
            rules.push({ selector: rule.selectorText, cssText: rule.cssText });
          }
        }
      } catch (e) {
        rules.push({ error: e.message, href: sheet.href });
      }
    }
    return {
      rules,
      htmlZoom: window.getComputedStyle(document.documentElement).zoom,
      bodyZoom: window.getComputedStyle(document.body).zoom,
    };
  });

  console.log('Result:', JSON.stringify(result, null, 2));
  await browser.close();
}

check();
