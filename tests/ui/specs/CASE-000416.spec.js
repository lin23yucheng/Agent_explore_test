const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const { cleanupCreatedTag, openCreateTagDialog, openTagsPage, saveTagDialog, tagDialogNameInput, tagRowByName } = require('../helpers/tags');

caseTest('CASE-000416', '标签管理 - 新建标签时标签分类默认选中其他 [CASE-000416]', async ({ page }, testInfo) => {
  const name = 'AI20260818C416';
  await openTagsPage(page);
  try {
    const dialog = await openCreateTagDialog(page);
    const categoryWrapper = dialog.getByRole('combobox').locator('xpath=ancestor::div[contains(@class,"el-select__wrapper")][1]');
    await expect(categoryWrapper).toContainText('其他');
    await tagDialogNameInput(page).fill(name);
    await expect(tagDialogNameInput(page)).toHaveValue(name);
    await saveTagDialog(page);
    const row = tagRowByName(page, name);
    await expect(row).toHaveCount(1);
    await expect(row.locator('td').nth(1)).toHaveText('其他');
    await expect(row.locator('td').nth(2)).toHaveText('启用');
  } finally {
    await cleanupCreatedTag(page, testInfo, name);
  }
});
