const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const { cleanupTagNames, openCreateTagDialog, openEditTagDialog, openTagsPage, saveTagDialog, selectTagDialogCategory, tagDialogNameInput, tagRowByName } = require('../helpers/tags');
caseTest('CASE-000446', '标签管理 - 编辑标签名称为33个字符的异常场景 [CASE-000446]', async ({ page }, testInfo) => {
  const original = '测试标签'; const edited = '123456789012345678901234567890123'; const invalid = '123456789012345678901234567890123'; await openTagsPage(page); await expect(tagRowByName(page, original)).toHaveCount(0);
  try { await openCreateTagDialog(page); await tagDialogNameInput(page).fill(original); await selectTagDialogCategory(page, '质量'); await saveTagDialog(page); await expect(tagRowByName(page, original)).toHaveCount(1);
    const dialog = await openEditTagDialog(page, original);  await tagDialogNameInput(page).fill(edited); await expect(tagDialogNameInput(page)).toHaveValue(edited); await saveTagDialog(page); await expect(dialog).toBeVisible(); await expect(dialog.locator('.el-form-item__error')).toHaveText('标签名称长度不能超过32位'); await expect(tagRowByName(page, invalid)).toHaveCount(0);
    await expect(tagRowByName(page, original)).toHaveCount(1);
  } finally { await cleanupTagNames(page, testInfo, [original, edited]); }
});
