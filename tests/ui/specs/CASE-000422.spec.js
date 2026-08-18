const { expect } = require('@playwright/test');
const { caseTest, reportCleanupStatus } = require('../helpers/case-test');
const { cancelTagDialog, deleteTagByName, openCreateTagDialog, openTagsPage, saveTagDialog, selectTagDialogCategory, tagDialogNameInput, tagRowByName } = require('../helpers/tags');
caseTest('CASE-000422', '标签管理 - 新建标签时名称唯一性校验提示标签名已存在 [CASE-000422]', async ({ page }, testInfo) => {
  const name = '测试标签'; let baselineCreated = false; await openTagsPage(page);
  try { if (!(await tagRowByName(page, name).count())) { await openCreateTagDialog(page); await tagDialogNameInput(page).fill(name); await selectTagDialogCategory(page, '质量'); await saveTagDialog(page); await expect(tagRowByName(page, name)).toHaveCount(1); baselineCreated = true; }
    const dialog = await openCreateTagDialog(page); await tagDialogNameInput(page).fill(name); await selectTagDialogCategory(page, '质量'); await saveTagDialog(page); await expect(dialog).toBeVisible();
    await expect(page.locator('.el-message:visible').filter({hasText: '标签名已存在'})).toBeVisible(); await expect(tagRowByName(page, name)).toHaveCount(1); await cancelTagDialog(page);
  } finally { try { if (await page.getByRole('dialog').isVisible().catch(() => false)) await cancelTagDialog(page); if (baselineCreated) { await deleteTagByName(page, name); await expect(tagRowByName(page, name)).toHaveCount(0); } await reportCleanupStatus(testInfo, baselineCreated ? 'passed' : 'not-applicable'); } catch (error) { await reportCleanupStatus(testInfo, 'failed', error.stack || String(error)); throw error; } }
});
