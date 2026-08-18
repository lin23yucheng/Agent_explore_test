const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const {
  cancelTagDialog, openCreateTagDialog, openTagsPage, selectTagDialogCategory,
  tagDialogNameInput, tagRowByName,
} = require('../helpers/tags');

caseTest('CASE-000419', '标签管理 - 新建标签弹框点击取消不保存已填数据 [CASE-000419]', async ({ page }) => {
  const name = '临时标签';
  await openTagsPage(page);
  await expect(tagRowByName(page, name)).toHaveCount(0);
  await openCreateTagDialog(page);
  await tagDialogNameInput(page).fill(name);
  await selectTagDialogCategory(page, '其他');
  await cancelTagDialog(page);
  await expect(tagRowByName(page, name)).toHaveCount(0);
  const reopened = await openCreateTagDialog(page);
  await expect(tagDialogNameInput(page)).toHaveValue('');
  const wrapper = reopened.getByRole('combobox').locator(
    'xpath=ancestor::div[contains(@class,"el-select__wrapper")][1]',
  );
  await expect(wrapper).toContainText('其他');
  await cancelTagDialog(page);
}, 'not-applicable');
