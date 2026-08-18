const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const { cleanupCreatedTag, openCreateTagDialog, openTagsPage, saveTagDialog, selectTagDialogCategory, tagDialogNameInput, tagRowByName } = require('../helpers/tags');

caseTest('CASE-000410', '标签管理 - 验证标签名称支持中英文字母和数字 [CASE-000410]', async ({ page }, testInfo) => {
  const name = 'AI标签ABC123410';
  await openTagsPage(page);
  try {
    await openCreateTagDialog(page);
    await tagDialogNameInput(page).fill(name);
    await expect(tagDialogNameInput(page)).toHaveValue(name);
    await selectTagDialogCategory(page, '质量');
    await saveTagDialog(page);
    const row = tagRowByName(page, name);
    await expect(row).toHaveCount(1);
    await expect(row.locator('td').nth(1)).toHaveText('质量');
    await expect(row.locator('td').nth(2)).toHaveText('启用');
  } finally {
    await cleanupCreatedTag(page, testInfo, name);
  }
});
