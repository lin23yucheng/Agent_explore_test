const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const { cleanupCreatedTag, openCreateTagDialog, openTagsPage, saveTagDialog, selectTagDialogCategory, tagDialogNameInput, tagRowByName } = require('../helpers/tags');

caseTest('CASE-000406', '标签管理 - 验证标签名称长度为1时创建成功 [CASE-000406]', async ({ page }, testInfo) => {
  const name = 'Z';
  await openTagsPage(page);
  try {
    await openCreateTagDialog(page);
    await tagDialogNameInput(page).fill(name);
    await expect(tagDialogNameInput(page)).toHaveValue(name);
    expect((await tagDialogNameInput(page).inputValue()).length).toBe(1);
    await selectTagDialogCategory(page, '质量');
    await saveTagDialog(page);
    const row = tagRowByName(page, name);
    await expect(row).toHaveCount(1);
    await expect(row.locator('td').nth(1)).toHaveText('质量');
    await expect(row.locator('td').nth(2)).toHaveText('启用');
  } finally {
    await cleanupCreatedTag(page, testInfo, name);
  }
});
