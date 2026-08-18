const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const {
  cleanupTagNames, openCreateTagDialog, openEditTagDialog, openTagsPage,
  saveTagDialog, selectTagDialogCategory, tagDialogNameInput, tagRowByName,
} = require('../helpers/tags');

caseTest('CASE-000448', '标签管理 - 编辑标签名称支持中英文字母和数字 [CASE-000448]', async ({ page }, testInfo) => {
  const original = 'AI448原标签';
  const edited = '标签ABC123';
  await openTagsPage(page);
  try {
    await openCreateTagDialog(page);
    await tagDialogNameInput(page).fill(original);
    await selectTagDialogCategory(page, '质量');
    await saveTagDialog(page);
    const dialog = await openEditTagDialog(page, original);
    await tagDialogNameInput(page).fill(edited);
    await expect(tagDialogNameInput(page)).toHaveValue(edited);
    await saveTagDialog(page);
    await expect(dialog).toBeHidden();
    await expect(tagRowByName(page, original)).toHaveCount(0);
    await expect(tagRowByName(page, edited)).toHaveCount(1);
  } finally {
    await cleanupTagNames(page, testInfo, [original, edited]);
  }
});
