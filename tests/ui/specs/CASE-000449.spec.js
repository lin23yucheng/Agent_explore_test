const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const {
  cleanupTagNames, openCreateTagDialog, openEditTagDialog, openTagsPage,
  saveTagDialog, selectTagDialogCategory, tagDialogNameInput, tagRowByName,
} = require('../helpers/tags');

caseTest('CASE-000449', '标签管理 - 编辑标签名称输入特殊字符被拒绝 [CASE-000449]', async ({ page }, testInfo) => {
  const original = 'AI449原标签';
  const invalid = '标签@#';
  await openTagsPage(page);
  try {
    await openCreateTagDialog(page);
    await tagDialogNameInput(page).fill(original);
    await selectTagDialogCategory(page, '质量');
    await saveTagDialog(page);
    const dialog = await openEditTagDialog(page, original);
    await tagDialogNameInput(page).fill(invalid);
    await expect(tagDialogNameInput(page)).toHaveValue(invalid);
    await saveTagDialog(page);
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.el-form-item__error')).toHaveText('标签名称仅支持中英文字母、数字');
    await expect(tagRowByName(page, original)).toHaveCount(1);
    await expect(tagRowByName(page, invalid)).toHaveCount(0);
  } finally {
    await cleanupTagNames(page, testInfo, [original, invalid]);
  }
});
