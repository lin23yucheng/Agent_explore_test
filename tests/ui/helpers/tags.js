const { expect } = require('@playwright/test');
const { openModule } = require('./auth');
const { reportCleanupStatus } = require('./case-test');

const TAG_URL = '/admin/scene-tags';

async function openTagsPage(page) {
  await openModule(
    page,
    '标签管理',
    TAG_URL,
    () => page.getByRole('columnheader', { name: /标签名称/ }),
  );
  await expect(page.getByRole('columnheader', { name: /标签名称/ })).toBeVisible();
  return tagRows(page);
}

function tagRows(page) {
  return page.getByRole('row').filter({ has: page.getByRole('cell') });
}

function tagSearchInput(page) {
  return page.getByPlaceholder('搜索标签名称');
}

async function clickTagQuery(page) {
  await page.getByRole('button', { name: '查询', exact: true }).click();
  await page.waitForTimeout(300);
}

async function resetTagFilters(page) {
  await page.getByRole('button', { name: '重置', exact: true }).click();
  await expect(tagSearchInput(page)).toHaveValue('');
  await page.waitForTimeout(250);
}

async function selectElementOption(page, control, value) {
  expect(await control.evaluate((node) => node.hasAttribute('readonly'))).toBeTruthy();
  const wrapper = control.locator(
    'xpath=ancestor::div[contains(@class,"el-select__wrapper")][1]',
  );
  await wrapper.click();
  const dropdown = page.locator('.el-select-dropdown:visible');
  await expect(dropdown).toBeVisible();
  await dropdown.getByText(value, { exact: true }).click();
  await expect(wrapper).toContainText(value);
}

async function expectTagCategoryOptions(page) {
  const control = page.getByRole('combobox').nth(0);
  const wrapper = control.locator(
    'xpath=ancestor::div[contains(@class,"el-select__wrapper")][1]',
  );
  await wrapper.click();
  const dropdown = page.locator('.el-select-dropdown:visible');
  await expect(dropdown.getByText('质量', { exact: true })).toBeVisible();
  await expect(dropdown.getByText('其他', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
}

async function expectTagStatusOptions(page) {
  const control = page.getByRole('combobox').nth(1);
  const wrapper = control.locator(
    'xpath=ancestor::div[contains(@class,"el-select__wrapper")][1]',
  );
  await wrapper.click();
  const dropdown = page.locator('.el-select-dropdown:visible');
  await expect(dropdown.getByText('启用', { exact: true })).toBeVisible();
  await expect(dropdown.getByText('禁用', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
}

async function selectTagCategoryFilter(page, value) {
  await selectElementOption(page, page.getByRole('combobox').nth(0), value);
}

async function selectTagStatusFilter(page, value) {
  await selectElementOption(page, page.getByRole('combobox').nth(1), value);
}

async function tagColumnTexts(page, columnIndex) {
  return tagRows(page)
    .locator(`td:nth-child(${columnIndex + 1})`)
    .allTextContents()
    .then((values) => values.map((value) => value.trim()));
}

function tagRowByName(page, name) {
  return tagRows(page).filter({
    has: page.getByRole('cell', { name, exact: true }),
  });
}

async function openCreateTagDialog(page) {
  await page.getByRole('button', { name: /新建标签|新增标签/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByPlaceholder('仅支持中英文字母、数字')).toBeVisible();
  return dialog;
}

function tagDialogNameInput(page) {
  return page.getByRole('dialog').getByRole('textbox').first();
}

async function selectTagDialogCategory(page, value) {
  const dialog = page.getByRole('dialog');
  await selectElementOption(page, dialog.getByRole('combobox'), value);
}

async function saveTagDialog(page) {
  await page.getByRole('dialog').getByRole('button', { name: /保存|确定/ }).click();
  await page.waitForTimeout(350);
}

async function cancelTagDialog(page) {
  await page.getByRole('dialog').getByRole('button', { name: '取消', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
}

async function expectTagPresent(page, name, present = true) {
  await expect(tagRowByName(page, name)).toHaveCount(present ? 1 : 0);
}

async function deleteTagByName(page, name) {
  const row = tagRowByName(page, name);
  if (!(await row.count())) return;
  await row.getByRole('button', { name: '删除', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: '确定', exact: true }).click();
  await page.waitForTimeout(350);
  await expectTagPresent(page, name, false);
}

async function openEditTagDialog(page, name) {
  const row = tagRowByName(page, name);
  await expect(row).toHaveCount(1);
  await row.getByRole('button', { name: '编辑', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(tagDialogNameInput(page)).toHaveValue(name);
  return dialog;
}

async function cleanupCreatedTag(page, testInfo, name) {
  return cleanupTagNames(page, testInfo, [name]);
}

async function cleanupTagNames(page, testInfo, names) {
  try {
    if (await page.getByRole('dialog').isVisible().catch(() => false)) {
      await cancelTagDialog(page);
    }
    for (const name of [...new Set(names.filter(Boolean))].reverse()) {
      await deleteTagByName(page, name);
      await expectTagPresent(page, name, false);
    }
    await reportCleanupStatus(testInfo, 'passed');
  } catch (error) {
    await reportCleanupStatus(testInfo, 'failed', error.stack || String(error));
    throw error;
  }
}

module.exports = {
  cancelTagDialog,
  clickTagQuery,
  cleanupCreatedTag,
  cleanupTagNames,
  deleteTagByName,
  expectTagCategoryOptions,
  expectTagPresent,
  expectTagStatusOptions,
  openCreateTagDialog,
  openEditTagDialog,
  openTagsPage,
  resetTagFilters,
  saveTagDialog,
  selectTagCategoryFilter,
  selectTagDialogCategory,
  selectTagStatusFilter,
  tagColumnTexts,
  tagDialogNameInput,
  tagRowByName,
  tagRows,
  tagSearchInput,
};
