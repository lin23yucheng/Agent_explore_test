const { expect } = require('@playwright/test');
const { caseTest, reportCleanupStatus } = require('../helpers/case-test');
const {
  deleteTagByName, openCreateTagDialog, openTagsPage, saveTagDialog,
  selectTagDialogCategory, tagDialogNameInput, tagRowByName,
} = require('../helpers/tags');
const { deleteTaskByName, taskRowByName } = require('../helpers/tasks');

function currentNames() {
  const testRun = (process.env.TEST_RUN_ID || String(Date.now())).replace(/[^A-Za-z0-9]/g, '');
  const runToken = testRun.slice(-10);
  return {
    tag: `AI${runToken}C000453TAG`,
    task: `AI${runToken}C000453TASK`,
  };
}

async function createReferencedTag(page, tagName, taskName) {
  await openTagsPage(page);
  await expect(tagRowByName(page, tagName)).toHaveCount(0);
  await openCreateTagDialog(page);
  await tagDialogNameInput(page).fill(tagName);
  await selectTagDialogCategory(page, '其他');
  await saveTagDialog(page);
  await expect(tagRowByName(page, tagName)).toHaveCount(1);

  await page.goto('/algorithm/tasks/create');
  await expect(page.getByRole('button', { name: '创建任务', exact: true })).toBeVisible();
  await page.getByPlaceholder('仅支持中英文字母、数字、_、-').fill(taskName);
  const controls = page.getByRole('combobox');
  await expect(controls).toHaveCount(3);

  const category = controls.nth(0).locator('xpath=ancestor::div[contains(@class,"el-select__wrapper")][1]');
  if (!(await category.innerText()).includes('f-test-001')) {
    await category.click();
    const categoryMenu = page.locator('.el-select-dropdown:visible');
    await expect(categoryMenu).toBeVisible();
    await categoryMenu.getByText('f-test-001 - 分类测试勿动', { exact: true }).click();
  }

  const tags = controls.nth(1).locator('xpath=ancestor::div[contains(@class,"el-select__wrapper")][1]');
  await tags.click();
  const tagMenu = page.locator('.el-select-dropdown:visible').filter({ hasText: tagName });
  await expect(tagMenu).toBeVisible();
  await tagMenu.getByText(tagName, { exact: true }).click();
  await page.keyboard.press('Escape');
  if (await tagMenu.isVisible().catch(() => false)) await page.keyboard.press('Escape');
  await expect(tagMenu).toBeHidden();
  await expect(tags).toContainText(tagName);

  const robot = controls.nth(2).locator('xpath=ancestor::div[contains(@class,"el-select__wrapper")][1]');
  await robot.click();
  const robotMenu = page.locator('.el-select-dropdown:visible').filter({ hasText: '天机' });
  await expect(robotMenu).toBeVisible();
  await robotMenu.locator('.el-select-dropdown__item').filter({ hasText: '天机' }).first().click();
  await expect(robot).toContainText('天机');

  const targetCount = page.locator('input[type="number"]');
  if (await targetCount.count()) await targetCount.first().fill('1');
  await page.getByRole('button', { name: '创建任务', exact: true }).click();
  await expect(page).toHaveURL(/\/algorithm\/tasks(?:\?.*)?$/);
  await expect(taskRowByName(page, taskName)).toHaveCount(1);
}

async function cleanup(page, testInfo, tagName, taskName) {
  try {
    await deleteTaskByName(page, taskName);
    await openTagsPage(page);
    await deleteTagByName(page, tagName);
    await expect(tagRowByName(page, tagName)).toHaveCount(0);
    await reportCleanupStatus(testInfo, 'passed');
  } catch (error) {
    await reportCleanupStatus(testInfo, 'failed', error.stack || String(error));
    throw error;
  }
}

caseTest('CASE-000453', '标签管理 - 禁用已被任务使用的标签时提示不允许禁用 [CASE-000453]', async ({ page }, testInfo) => {
  const names = currentNames();
  try {
    await createReferencedTag(page, names.tag, names.task);
    await openTagsPage(page);
    const row = tagRowByName(page, names.tag);
    await expect(row).toHaveCount(1);
    await expect(row.locator('td').nth(2)).toHaveText('启用');
    await row.getByRole('button', { name: '禁用', exact: true }).click();
    await page.waitForTimeout(350);
    await expect(page.locator('.el-message:visible')).toContainText('标签已被任务使用，不允许禁用');
    await expect(row.locator('td').nth(2)).toHaveText('启用');
  } finally {
    await cleanup(page, testInfo, names.tag, names.task);
  }
});
