const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const { cleanupCreatedTag, openCreateTagDialog, openTagsPage, saveTagDialog, selectTagDialogCategory, tagDialogNameInput, tagRowByName } = require('../helpers/tags');

caseTest('CASE-000415', '标签管理 - 验证标签名称仅包含数字时创建成功 [CASE-000415]', async ({ page }, testInfo) => {
  const name = '41520260818';
  await openTagsPage(page);
  try {
    await openCreateTagDialog(page);
    await tagDialogNameInput(page).fill(name);
    await expect(tagDialogNameInput(page)).toHaveValue(name);
    expect(name).toMatch(/^\d+$/);
    await selectTagDialogCategory(page, '其他');
    await saveTagDialog(page);
    const row = tagRowByName(page, name);
    await expect(row).toHaveCount(1);
    await expect(row.locator('td').nth(1)).toHaveText('其他');
    await expect(row.locator('td').nth(2)).toHaveText('启用');
  } finally {
    await cleanupCreatedTag(page, testInfo, name);
  }
});
