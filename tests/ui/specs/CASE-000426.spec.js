const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const {
  openCreateTagDialog, openTagsPage, saveTagDialog, selectTagDialogCategory,
  tagDialogNameInput, tagRowByName,
} = require('../helpers/tags');

caseTest('CASE-000426', '标签管理 - 新增标签时名称超过32个字符被拒绝 [CASE-000426]', async ({ page }) => {
  const name = `A426${'6'.repeat(29)}`;
  await openTagsPage(page);
  const dialog = await openCreateTagDialog(page);
  await tagDialogNameInput(page).fill(name);
  await expect(tagDialogNameInput(page)).toHaveValue(name);
  expect((await tagDialogNameInput(page).inputValue()).length).toBe(33);
  await selectTagDialogCategory(page, '质量');
  await saveTagDialog(page);
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.el-form-item__error')).toHaveText('标签名称长度不能超过32位');
  await expect(tagRowByName(page, name)).toHaveCount(0);
}, 'not-applicable');
