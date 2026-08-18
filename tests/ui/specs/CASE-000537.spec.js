const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const {
  cleanupTagNames, openCreateTagDialog, openTagsPage, saveTagDialog,
  selectTagDialogCategory, tagDialogNameInput, tagRowByName,
} = require('../helpers/tags');

function currentName() {
  const testRun = (process.env.TEST_RUN_ID || String(Date.now())).replace(/[^A-Za-z0-9]/g, '');
  return `AI${testRun.slice(-10)}C000537TAG`;
}

caseTest('CASE-000537', '标签管理 - 禁用标签后直接生效 [CASE-000537]', async ({ page }, testInfo) => {
  const name = currentName();
  await openTagsPage(page);
  await expect(tagRowByName(page, name)).toHaveCount(0);
  try {
    await openCreateTagDialog(page);
    await tagDialogNameInput(page).fill(name);
    await selectTagDialogCategory(page, '质量');
    await saveTagDialog(page);
    const row = tagRowByName(page, name);
    await expect(row.locator('td').nth(2)).toHaveText('启用');
    await row.getByRole('button', { name: '禁用', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(row.locator('td').nth(2)).toHaveText('禁用');
    await expect(row.getByRole('button', { name: '启用', exact: true })).toBeVisible();
    await expect(page.locator('.el-message:visible').filter({ hasText: '标签已禁用' })).toBeVisible();
  } finally {
    await cleanupTagNames(page, testInfo, [name]);
  }
});
