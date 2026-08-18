const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { openModule } = require('../helpers/auth');

const EVIDENCE_ROOT = path.resolve(
  'reports/evidence/EXPLORATION-20260818-TAGS-STRICT-01',
);

test('标签管理直接探索环境与控件结构', async ({ page }) => {
  fs.mkdirSync(EVIDENCE_ROOT, { recursive: true });
  await openModule(
    page,
    '标签管理',
    '/admin/scene-tags',
    () => page.getByRole('columnheader', { name: /标签名称/ }),
  );
  await expect(page.getByRole('columnheader', { name: /标签名称/ })).toBeVisible();

  const structure = {
    url: page.url(),
    headers: await page.getByRole('columnheader').allTextContents(),
    buttons: await page.getByRole('button').allTextContents(),
    inputs: await page.locator('input').evaluateAll((nodes) => nodes.map((node) => ({
      type: node.type,
      placeholder: node.getAttribute('placeholder'),
      role: node.getAttribute('role'),
      value: node.value,
      ariaLabel: node.getAttribute('aria-label'),
    }))),
    rows: await page.getByRole('row').filter({ has: page.getByRole('cell') }).allTextContents(),
  };
  await page.screenshot({
    path: path.join(EVIDENCE_ROOT, 'page-structure.png'),
    fullPage: true,
  });

  const createButton = page.getByRole('button', { name: /新建|新增/ }).first();
  await expect(createButton).toBeVisible();
  await createButton.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  structure.dialog = {
    text: await dialog.innerText(),
    buttons: await dialog.getByRole('button').allTextContents(),
    inputs: await dialog.locator('input').evaluateAll((nodes) => nodes.map((node) => ({
      type: node.type,
      placeholder: node.getAttribute('placeholder'),
      role: node.getAttribute('role'),
      value: node.value,
      ariaLabel: node.getAttribute('aria-label'),
    }))),
    comboboxes: await dialog.getByRole('combobox').count(),
  };
  await page.screenshot({
    path: path.join(EVIDENCE_ROOT, 'create-dialog-structure.png'),
    fullPage: true,
  });
  fs.writeFileSync(
    path.join(EVIDENCE_ROOT, 'page-structure.json'),
    JSON.stringify(structure, null, 2),
    'utf8',
  );
});
