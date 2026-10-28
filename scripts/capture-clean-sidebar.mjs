import { chromium } from '@playwright/test';
import path from 'node:path';

const artifactDir =
  'C:\\Users\\adity\\.gemini\\antigravity\\brain\\abccb2a8-a80b-4f8d-b383-071a2318056f';

async function main() {
  const browser = await chromium.launch({ channel: 'msedge' });

  for (const theme of ['light', 'dark']) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });

    await page.addInitScript(
      ({ currentTheme }) => {
        localStorage.setItem('theme', currentTheme);
        localStorage.setItem('hro:demo-role', 'manager');
      },
      { currentTheme: theme }
    );

    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });

    await page.evaluate(
      ({ currentTheme }) => {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        }
      },
      { currentTheme: theme }
    );

    await page.waitForTimeout(600);

    // Sidebar footer screenshot
    const sidebarFooter = page.locator('aside .border-t').last();
    if (await sidebarFooter.isVisible()) {
      const file = `clean-sidebar-footer-${theme}.png`;
      await sidebarFooter.screenshot({ path: path.join(artifactDir, file) });
      console.log(`Saved: ${file}`);
    }

    // Full layout screenshot
    const fullFile = `clean-layout-${theme}.png`;
    await page.screenshot({ path: path.join(artifactDir, fullFile) });
    console.log(`Saved: ${fullFile}`);

    await page.close();
  }

  await browser.close();
  console.log('Sidebar clean screenshots captured successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
