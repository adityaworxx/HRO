import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const outDir = path.resolve('screenshots');
const artifactDir = 'C:\\Users\\adity\\.gemini\\antigravity\\brain\\4d3ca75e-ea01-4dc4-a353-c89cd4966ed4\\screenshots';

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
  });

  await page.goto('http://localhost:3000/onboarding', { waitUntil: 'networkidle' });

  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  });

  await page.waitForTimeout(600);

  // 1. Capture default By New Hire view
  const candidateShot = path.join(outDir, 'onboarding-by-candidate-dark.png');
  await page.screenshot({ path: candidateShot, fullPage: true });
  fs.copyFileSync(candidateShot, path.join(artifactDir, 'onboarding-by-candidate-dark.png'));
  console.log('Saved: onboarding-by-candidate-dark.png');

  // 2. Click By Phase tab
  const phaseTab = page.getByRole('tab', { name: /By Phase/i });
  if (await phaseTab.isVisible()) {
    await phaseTab.click();
    await page.waitForTimeout(400);
    const phaseShot = path.join(outDir, 'onboarding-by-phase-dark.png');
    await page.screenshot({ path: phaseShot, fullPage: true });
    fs.copyFileSync(phaseShot, path.join(artifactDir, 'onboarding-by-phase-dark.png'));
    console.log('Saved: onboarding-by-phase-dark.png');
  }

  // 3. Click All Tasks tab
  const allTasksTab = page.getByRole('tab', { name: /All Tasks/i });
  if (await allTasksTab.isVisible()) {
    await allTasksTab.click();
    await page.waitForTimeout(400);
    const allShot = path.join(outDir, 'onboarding-all-tasks-dark.png');
    await page.screenshot({ path: allShot, fullPage: true });
    fs.copyFileSync(allShot, path.join(artifactDir, 'onboarding-all-tasks-dark.png'));
    console.log('Saved: onboarding-all-tasks-dark.png');
  }

  // 4. Open Add Checklist Item Modal
  const addBtn = page.getByRole('button', { name: /Add Checklist Item/i }).first();
  if (await addBtn.isVisible()) {
    await addBtn.click();
    await page.waitForTimeout(400);
    const modalShot = path.join(outDir, 'onboarding-modal-dark.png');
    await page.screenshot({ path: modalShot });
    fs.copyFileSync(modalShot, path.join(artifactDir, 'onboarding-modal-dark.png'));
    console.log('Saved: onboarding-modal-dark.png');
  }

  await page.close();
  await browser.close();
  console.log('All onboarding screenshots captured successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
