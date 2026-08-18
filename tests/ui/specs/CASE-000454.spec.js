const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const { cleanupTagNames, openCreateTagDialog, openTagsPage, saveTagDialog, selectTagDialogCategory, tagDialogNameInput, tagRowByName } = require('../helpers/tags');
caseTest('CASE-000454', '标签管理 - 删除标签二次确认后成功删除 [CASE-000454]', async ({ page }, testInfo) => {
  const name = '标签名称'; await openTagsPage(page); await expect(tagRowByName(page, name)).toHaveCount(0);
  try { await openCreateTagDialog(page); await tagDialogNameInput(page).fill(name); await selectTagDialogCategory(page, '质量'); await saveTagDialog(page); const row = tagRowByName(page, name); await expect(row).toHaveCount(1); await row.getByRole('button', {name: '删除', exact: true}).click();
    const dialog = page.getByRole('dialog'); await expect(dialog).toContainText(`确定删除标签「${name}」吗？`); await dialog.getByRole('button', {name: '确定', exact: true}).click(); await expect(tagRowByName(page, name)).toHaveCount(0); await expect(page.locator('.el-message:visible').filter({hasText: '标签已删除'})).toBeVisible();
  } finally { await cleanupTagNames(page, testInfo, [name]); }
});
