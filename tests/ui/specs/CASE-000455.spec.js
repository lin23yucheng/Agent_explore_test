const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const {
  cleanupTagNames, openCreateTagDialog, openTagsPage, saveTagDialog,
  selectTagDialogCategory, tagDialogNameInput, tagRowByName,
} = require('../helpers/tags');

caseTest('CASE-000455', '标签管理 - 删除标签二次确认时取消删除 [CASE-000455]', async ({ page }, testInfo) => {
  const name = '标签名称';
  await openTagsPage(page);
  try {
    await openCreateTagDialog(page);
    await tagDialogNameInput(page).fill(name);
    await selectTagDialogCategory(page, '质量');
    await saveTagDialog(page);
    const row = tagRowByName(page, name);
    await expect(row).toHaveCount(1);
    await row.getByRole('button', { name: '删除', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText(`确定删除标签「${name}」吗？`);
    await dialog.getByRole('button', { name: '取消', exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(tagRowByName(page, name)).toHaveCount(1);
  } finally {
    await cleanupTagNames(page, testInfo, [name]);
  }
});
