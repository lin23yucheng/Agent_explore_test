const { test, expect } = require('@playwright/test');
const { login } = require('../helpers/auth');

async function openUsers(page) {
  await login(page);
  await page.getByText('用户管理', { exact: true }).click();
  await expect(page.getByPlaceholder('搜索账户和姓名')).toBeVisible();
}

function row(page, account) {
  return page.locator('tbody tr').filter({ hasText: account });
}

async function create(page, account, name) {
  await page.getByRole('button', { name: '新建用户', exact: true }).click();
  const dialog = page.getByRole('dialog').last();
  const inputs = dialog.locator('input[type=text]');
  await inputs.nth(0).fill(account);
  await inputs.nth(1).fill(name);
  await dialog.getByRole('combobox').click({ force: true });
  await page.locator('.el-select-dropdown:visible').getByText('采集工程师', { exact: true }).click();
  await dialog.getByRole('button', { name: '保存', exact: true }).click();
  await expect(row(page, account)).toBeVisible();
}

async function remove(page, account) {
  const target = row(page, account);
  if (await target.count()) {
    await target.getByRole('button', { name: '删除', exact: true }).click();
    const confirm = page.getByRole('dialog').last();
    await confirm.getByRole('button', { name: /确认|确定/ }).click();
    await expect(target).toBeHidden();
  }
}

async function query(page, value) {
  const input = page.getByPlaceholder('搜索账户和姓名');
  await input.fill(value);
  await page.getByRole('button', { name: '查询', exact: true }).click();
  await expect(input).toHaveValue(value);
  return page.locator('tbody tr');
}

test('新建用户取消不保存', { annotation: [
  { type: 'case', description: 'CASE-000323' },
  { type: 'cleanup', description: 'not-applicable' },
] }, async ({ page }) => {
  const account = `AI_CANCEL_${Date.now()}`.slice(0, 32);
  await openUsers(page);
  await page.getByRole('button', { name: '新建用户', exact: true }).click();
  const dialog = page.getByRole('dialog').last();
  await dialog.locator('input[type=text]').nth(0).fill(account);
  await dialog.getByRole('button', { name: '取消', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(row(page, account)).toHaveCount(0);
});
