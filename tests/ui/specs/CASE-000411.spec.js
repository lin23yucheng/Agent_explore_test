const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const { openCreateTagDialog, openTagsPage, saveTagDialog, tagDialogNameInput, tagRowByName } = require('../helpers/tags');

caseTest('CASE-000411', '标签管理 - 验证标签名称包含非法字符时提示错误 [CASE-000411]', async ({ page }) => {
  const name = '标签@#';
  await openTagsPage(page);
  const dialog = await openCreateTagDialog(page);
  await tagDialogNameInput(page).fill(name);
  await expect(tagDialogNameInput(page)).toHaveValue(name);
  await saveTagDialog(page);
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.el-form-item__error')).toHaveText('标签名称仅支持中英文字母、数字');
  await expect(tagRowByName(page, name)).toHaveCount(0);
}, 'not-applicable');
