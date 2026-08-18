const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const { cleanupTagNames, openCreateTagDialog, openEditTagDialog, openTagsPage, saveTagDialog, selectTagDialogCategory, tagDialogNameInput, tagRowByName } = require('../helpers/tags');
caseTest('CASE-000444', '标签管理 - 编辑标签名称为32个字符的边界值 [CASE-000444]', async ({ page }, testInfo) => {
  const original = '测试标签'; const edited = '12345678901234567890123456789012';  await openTagsPage(page); await expect(tagRowByName(page, original)).toHaveCount(0);
  try { await openCreateTagDialog(page); await tagDialogNameInput(page).fill(original); await selectTagDialogCategory(page, '质量'); await saveTagDialog(page); await expect(tagRowByName(page, original)).toHaveCount(1);
    const dialog = await openEditTagDialog(page, original);  await tagDialogNameInput(page).fill(edited); await expect(tagDialogNameInput(page)).toHaveValue(edited); await saveTagDialog(page); await expect(dialog).toBeHidden();
    await expect(tagRowByName(page, original)).toHaveCount(0); await expect(tagRowByName(page, edited)).toHaveCount(1);
  } finally { await cleanupTagNames(page, testInfo, [original, edited]); }
});
