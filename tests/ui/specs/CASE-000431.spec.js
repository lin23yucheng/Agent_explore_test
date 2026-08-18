const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const { cleanupCreatedTag, openCreateTagDialog, openTagsPage, saveTagDialog, selectTagDialogCategory, tagDialogNameInput, tagRowByName } = require('../helpers/tags');

caseTest('CASE-000431', '标签管理 - 新增标签时选择分类为其他 [CASE-000431]', async ({ page }, testInfo) => {
  const name = 'AI测试标签B431';
  await openTagsPage(page);
  try {
    await openCreateTagDialog(page);
    await tagDialogNameInput(page).fill(name);
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
