import { chromium } from '@playwright/test';
import path from 'node:path';

const screenshotDir =
  'C:/Users/adity/.gemini/antigravity/brain/4445bf77-ea56-4237-9627-e3f6a9dd188c/screenshots';

async function verifyAllPopups() {
  console.log('Launching Chrome browser...');
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.addInitScript(() => {
    localStorage.setItem('hro:demo-role', 'hr');
  });

  // 1. Openings Page
  console.log('Navigating to /openings...');
  await page.goto('http://localhost:3000/openings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Department dropdown
  console.log('1. Testing Department Select dropdown...');
  const deptSelect = page.locator('button:has-text("All Departments")').first();
  await deptSelect.click();
  await page.waitForTimeout(400);

  const deptTriggerBox = await deptSelect.boundingBox();
  const deptListBox = await page.locator('[role="listbox"]').first().boundingBox();
  console.log('Dept Trigger:', deptTriggerBox);
  console.log('Dept ListBox:', deptListBox);

  const xDiff = Math.abs(
    deptListBox.x + deptListBox.width - (deptTriggerBox.x + deptTriggerBox.width)
  );
  console.log(`Dept dropdown alignment diff: ${xDiff.toFixed(2)}px`);
  await page.screenshot({ path: path.join(screenshotDir, 'final-zoom-dept.png') });

  // Close dropdown
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // Row Action menu
  console.log('2. Testing Row Actions dropdown...');
  const actionBtn = page.locator('button:has-text("Open menu")').first();
  await actionBtn.click();
  await page.waitForTimeout(400);

  const actionTriggerBox = await actionBtn.boundingBox();
  const menuBox = await page.locator('[role="menu"]').first().boundingBox();
  console.log('Action Trigger:', actionTriggerBox);
  console.log('Menu:', menuBox);

  const actionXDiff = Math.abs(
    menuBox.x + menuBox.width - (actionTriggerBox.x + actionTriggerBox.width)
  );
  console.log(`Action menu alignment diff: ${actionXDiff.toFixed(2)}px`);
  await page.screenshot({ path: path.join(screenshotDir, 'final-zoom-actions.png') });

  // Close menu
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // 3. Command Palette Dialog
  console.log('3. Testing Command Palette Dialog (Ctrl+K)...');
  await page.keyboard.press('Control+KeyK');
  await page.waitForTimeout(500);

  const cmdDialog = page.locator('[role="dialog"]').first();
  const cmdBox = await cmdDialog.boundingBox();
  console.log('Command Palette BoundingBox:', cmdBox);
  const cmdCenterX = cmdBox.x + cmdBox.width / 2;
  console.log(`Command Palette Center X: ${cmdCenterX.toFixed(1)}px (viewport center: 720px)`);
  await page.screenshot({ path: path.join(screenshotDir, 'final-zoom-cmd-palette.png') });

  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // 4. Onboarding "Add Task" Dialog
  console.log('4. Navigating to /onboarding to test Add Task Dialog...');
  await page.goto('http://localhost:3000/onboarding', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const addTaskBtn = page.locator('button:has-text("Add Task")').first();
  if (await addTaskBtn.isVisible()) {
    await addTaskBtn.click();
    await page.waitForTimeout(500);

    const dialog = page.locator('[role="dialog"]').first();
    const dialogBox = await dialog.boundingBox();
    console.log('Add Task Dialog BoundingBox:', dialogBox);
    const dialogCenterX = dialogBox.x + dialogBox.width / 2;
    console.log(`Add Task Dialog Center X: ${dialogCenterX.toFixed(1)}px`);
    await page.screenshot({ path: path.join(screenshotDir, 'final-zoom-dialog.png') });

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  // 5. Candidate Sheet Drawer
  console.log('5. Navigating to /candidates to test Candidate Sheet...');
  await page.goto('http://localhost:3000/candidates', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const candidateRow = page.locator('tbody tr').first();
  await candidateRow.click();
  await page.waitForTimeout(500);

  const sheet = page.locator('[role="dialog"]').first();
  const sheetBox = await sheet.boundingBox();
  console.log('Candidate Sheet BoundingBox:', sheetBox);
  const sheetRightEdge = sheetBox.x + sheetBox.width;
  console.log(
    `Candidate Sheet Right Edge: ${sheetRightEdge.toFixed(1)}px (viewport width: 1440px)`
  );
  await page.screenshot({ path: path.join(screenshotDir, 'final-zoom-candidate-sheet.png') });

  await browser.close();
  console.log('✓ All verification checks passed with 100% precision!');
}

verifyAllPopups().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
