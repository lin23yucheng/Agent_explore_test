const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const { openCreateTagDialog, openTagsPage, saveTagDialog, selectTagDialogCategory, tagDialogNameInput, tagRows } = require('../helpers/tags');
caseTest('CASE-000408', '标签管理 - 验证标签名称为空时创建失败 [CASE-000408]', async ({ page }) => {
  await openTagsPage(page); await expect(tagRows(page).first()).toBeVisible(); const beforeCount = await tagRows(page).count();
  const dialog = await openCreateTagDialog(page); await expect(tagDialogNameInput(page)).toHaveValue(''); await selectTagDialogCategory(page, '质量'); await saveTagDialog(page);
  await expect(dialog).toBeVisible(); await expect(dialog.locator('.el-form-item__error')).toHaveText('请输入标签名称'); await expect(tagRows(page)).toHaveCount(beforeCount);
}, 'not-applicable');
