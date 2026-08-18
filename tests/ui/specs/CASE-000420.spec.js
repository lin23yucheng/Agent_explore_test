const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const { openCreateTagDialog, openTagsPage, saveTagDialog, tagDialogNameInput } = require('../helpers/tags');

caseTest('CASE-000420', '标签管理 - 新建标签时名称为空前端报红提示 [CASE-000420]', async ({ page }) => {
  await openTagsPage(page);
  const dialog = await openCreateTagDialog(page);
  await expect(tagDialogNameInput(page)).toHaveValue('');
  await saveTagDialog(page);
  const formItem = tagDialogNameInput(page).locator(
    'xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " el-form-item ")][1]',
  );
  await expect(dialog).toBeVisible();
  await expect(formItem).toHaveClass(/\bis-error\b/);
  await expect(formItem.locator('.el-form-item__error')).toHaveText('请输入标签名称');
}, 'not-applicable');
