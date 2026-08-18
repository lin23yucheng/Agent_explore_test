const { expect } = require('@playwright/test');
const { caseTest, reportCleanupStatus } = require('../helpers/case-test');
const {
  deleteTagByName, openCreateTagDialog, openTagsPage, saveTagDialog,
  selectTagDialogCategory, tagDialogNameInput, tagRowByName,
} = require('../helpers/tags');

caseTest('CASE-000429', '标签管理 - 新增标签时名称重复被拒绝 [CASE-000429]', async ({ page }, testInfo) => {
  const name = '测试标签';
  let baselineCreated = false;
  await openTagsPage(page);
  try {
    if (!(await tagRowByName(page, name).count())) {
      await openCreateTagDialog(page);
      await tagDialogNameInput(page).fill(name);
      await selectTagDialogCategory(page, '质量');
      await saveTagDialog(page);
      await expect(tagRowByName(page, name)).toHaveCount(1);
      baselineCreated = true;
    }
    const dialog = await openCreateTagDialog(page);
    await tagDialogNameInput(page).fill(name);
    await expect(tagDialogNameInput(page)).toHaveValue(name);
    await selectTagDialogCategory(page, '质量');
    await saveTagDialog(page);
    await expect(dialog).toBeVisible();
    await expect(page.locator('.el-message').getByText('标签名已存在', { exact: true })).toBeVisible();
    await expect(tagRowByName(page, name)).toHaveCount(1);
  } finally {
    if (baselineCreated) {
      try {
        await deleteTagByName(page, name);
        await expect(tagRowByName(page, name)).toHaveCount(0);
        await reportCleanupStatus(testInfo, 'passed');
      } catch (error) {
        await reportCleanupStatus(testInfo, 'failed', error.stack || String(error));
        throw error;
      }
    } else {
      await reportCleanupStatus(testInfo, 'not-applicable');
    }
  }
});
