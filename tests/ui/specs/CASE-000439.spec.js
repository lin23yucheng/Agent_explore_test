const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const {
  cleanupTagNames, openCreateTagDialog, openEditTagDialog, openTagsPage,
  saveTagDialog, selectTagDialogCategory, tagDialogNameInput, tagRowByName,
} = require('../helpers/tags');

caseTest('CASE-000439', '标签管理 - 编辑标签后更新时间更新为当前时间 [CASE-000439]', async ({ page }, testInfo) => {
  testInfo.setTimeout(130_000);
  const original = 'AI439原标签';
  const edited = 'AI439新标签';
  await openTagsPage(page);
  try {
    await expect(tagRowByName(page, original)).toHaveCount(0);
    await openCreateTagDialog(page);
    await tagDialogNameInput(page).fill(original);
    await selectTagDialogCategory(page, '质量');
    await saveTagDialog(page);
    const beforeRow = tagRowByName(page, original);
    await expect(beforeRow).toHaveCount(1);
    const creationTime = (await beforeRow.locator('td').nth(3).innerText()).trim();
    const initialUpdateTime = (await beforeRow.locator('td').nth(4).innerText()).trim();
    expect(initialUpdateTime).toBe(creationTime);
    await page.waitForTimeout(65_000);
    const dialog = await openEditTagDialog(page, original);
    await tagDialogNameInput(page).fill(edited);
    await expect(tagDialogNameInput(page)).toHaveValue(edited);
    await saveTagDialog(page);
    await expect(dialog).toBeHidden();
    await expect(page.locator('.el-message').getByText('标签修改成功', { exact: true })).toBeVisible();
    await expect(tagRowByName(page, original)).toHaveCount(0);
    const afterRow = tagRowByName(page, edited);
    await expect(afterRow).toHaveCount(1);
    const updateTime = (await afterRow.locator('td').nth(4).innerText()).trim();
    expect(updateTime > creationTime).toBeTruthy();
  } finally {
    await cleanupTagNames(page, testInfo, [original, edited]);
  }
});
