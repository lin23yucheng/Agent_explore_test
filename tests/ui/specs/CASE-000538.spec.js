const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const {
  cancelTagDialog, cleanupTagNames, openCreateTagDialog, openEditTagDialog,
  openTagsPage, saveTagDialog, selectTagDialogCategory, tagDialogNameInput,
  tagRowByName,
} = require('../helpers/tags');

async function createTag(page, name) {
  await openCreateTagDialog(page);
  await tagDialogNameInput(page).fill(name);
  await selectTagDialogCategory(page, '质量');
  await saveTagDialog(page);
  await expect(tagRowByName(page, name)).toHaveCount(1);
}

caseTest('CASE-000538', '标签管理 - 编辑标签名称唯一性校验提示 [CASE-000538]', async ({ page }, testInfo) => {
  const first = '标签A';
  const second = '标签B';
  await openTagsPage(page);
  await expect(tagRowByName(page, first)).toHaveCount(0);
  await expect(tagRowByName(page, second)).toHaveCount(0);
  try {
    await createTag(page, first);
    await createTag(page, second);
    const dialog = await openEditTagDialog(page, first);
    await expect(tagDialogNameInput(page)).toHaveValue(first);
    await tagDialogNameInput(page).fill(second);
    await expect(tagDialogNameInput(page)).toHaveValue(second);
    await saveTagDialog(page);
    await expect(dialog).toBeVisible();
    await expect(page.locator('.el-message:visible').filter({ hasText: '标签名已存在' })).toBeVisible();
    const formItem = tagDialogNameInput(page).locator(
      'xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " el-form-item ")][1]',
    );
    await expect(formItem).not.toHaveClass(/is-error/);
    await expect(dialog.locator('.el-form-item__error:visible')).toHaveCount(0);
    await expect(tagRowByName(page, first)).toHaveCount(1);
    await expect(tagRowByName(page, second)).toHaveCount(1);
    await cancelTagDialog(page);
  } finally {
    if (await page.getByRole('dialog').isVisible().catch(() => false)) await cancelTagDialog(page);
    await cleanupTagNames(page, testInfo, [first, second]);
  }
});
