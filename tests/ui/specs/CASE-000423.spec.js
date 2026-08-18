const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const { cleanupCreatedTag, openCreateTagDialog, openTagsPage, saveTagDialog, selectTagDialogCategory, tagDialogNameInput, tagRowByName } = require('../helpers/tags');

caseTest('CASE-000423', '标签管理 - 新增标签时填写合法名称成功创建 [CASE-000423]', async ({ page }, testInfo) => {
  const name = 'AI测试标签123423';
  await openTagsPage(page);
  try {
    await openCreateTagDialog(page);
    await tagDialogNameInput(page).fill(name);
    await expect(tagDialogNameInput(page)).toHaveValue(name);
    await selectTagDialogCategory(page, '质量');
    await saveTagDialog(page);
    const row = tagRowByName(page, name);
    await expect(row).toHaveCount(1);
    await expect(row.locator('td').nth(1)).toHaveText('质量');
    await expect(row.locator('td').nth(2)).toHaveText('启用');
    await expect(row.locator('td').nth(3)).toHaveText(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  } finally {
    await cleanupCreatedTag(page, testInfo, name);
  }
});
