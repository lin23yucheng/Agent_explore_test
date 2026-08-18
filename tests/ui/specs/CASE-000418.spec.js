const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const {
  cancelTagDialog, openCreateTagDialog, openTagsPage, selectTagDialogCategory,
  tagDialogNameInput, tagRowByName,
} = require('../helpers/tags');

caseTest('CASE-000418', '标签管理 - 新建标签弹框点击取消关闭且不保存 [CASE-000418]', async ({ page }) => {
  const name = 'AI取消418';
  await openTagsPage(page);
  await expect(tagRowByName(page, name)).toHaveCount(0);
  const dialog = await openCreateTagDialog(page);
  await tagDialogNameInput(page).fill(name);
  await expect(tagDialogNameInput(page)).toHaveValue(name);
  await selectTagDialogCategory(page, '质量');
  await cancelTagDialog(page);
  await expect(dialog).toBeHidden();
  await expect(tagRowByName(page, name)).toHaveCount(0);
}, 'not-applicable');
