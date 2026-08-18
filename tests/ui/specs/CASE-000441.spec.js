const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const {
  cleanupTagNames, openCreateTagDialog, openTagsPage, saveTagDialog,
  selectTagDialogCategory, tagDialogNameInput, tagRowByName,
} = require('../helpers/tags');

caseTest('CASE-000441', '标签管理 - 刚创建标签时创建时间与更新时间一致 [CASE-000441]', async ({ page }, testInfo) => {
  const name = 'AI441时间标签';
  await openTagsPage(page);
  try {
    await expect(tagRowByName(page, name)).toHaveCount(0);
    await openCreateTagDialog(page);
    await tagDialogNameInput(page).fill(name);
    await selectTagDialogCategory(page, '质量');
    await saveTagDialog(page);
    await expect(page.locator('.el-message').getByText('标签创建成功', { exact: true })).toBeVisible();
    const row = tagRowByName(page, name);
    await expect(row).toHaveCount(1);
    const creationTime = (await row.locator('td').nth(3).innerText()).trim();
    const updateTime = (await row.locator('td').nth(4).innerText()).trim();
    expect(creationTime).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
    expect(updateTime).toBe(creationTime);
  } finally {
    await cleanupTagNames(page, testInfo, [name]);
  }
});
