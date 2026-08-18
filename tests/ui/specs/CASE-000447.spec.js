const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const {
  cleanupTagNames, openCreateTagDialog, openEditTagDialog, openTagsPage,
  saveTagDialog, selectTagDialogCategory, tagDialogNameInput, tagRowByName,
} = require('../helpers/tags');

caseTest('CASE-000447', '标签管理 - 编辑标签名称回显且可修改 [CASE-000447]', async ({ page }, testInfo) => {
  const original = 'AI447原标签';
  const edited = '新标签123';
  await openTagsPage(page);
  try {
    await openCreateTagDialog(page);
    await tagDialogNameInput(page).fill(original);
    await selectTagDialogCategory(page, '质量');
    await saveTagDialog(page);
    const dialog = await openEditTagDialog(page, original);
    await expect(tagDialogNameInput(page)).toHaveValue(original);
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
