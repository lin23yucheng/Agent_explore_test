const { test, expect } = require('@playwright/test');
const { login } = require('../helpers/auth');
const { withCleanupStatus } = require('../helpers/case-test');

const CASE = (id, title, body, cleanup = 'passed') => test(title, {
  annotation: [
    { type: 'case', description: id },
    { type: 'cleanup', description: cleanup },
  ],
}, withCleanupStatus(body, cleanup));

async function openUsers(page) {
  await login(page);
  await page.getByText('用户管理', { exact: true }).click();
}

async function openCreateUser(page) {
  await page.getByRole('button', { name: '新建用户', exact: true }).click();
  const dialog = page.getByRole('dialog').last();
  await expect(dialog).toBeVisible();
  return dialog;
}

function userRow(page, account) {
  const escaped = account.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const accountCell = page.locator('td:first-child').filter({ hasText: new RegExp(`^${escaped}$`) });
  return page.locator('tbody tr').filter({ has: accountCell });
}

async function createUser(page, account, name) {
  const dialog = await openCreateUser(page);
  const inputs = dialog.locator('input[type=text]');
  await inputs.nth(0).fill(account);
  await inputs.nth(1).fill(name);
  await dialog.getByRole('combobox').click({ force: true });
  await page.locator('.el-select-dropdown:visible').getByText('采集工程师', { exact: true }).click();
  const passwordInput = dialog.locator('input[type=password]');
  if (await passwordInput.count()) await passwordInput.fill('123456');
  await dialog.getByRole('button', { name: '保存', exact: true }).click();
  await expect(userRow(page, account)).toBeVisible();
}

async function deleteUser(page, account) {
  const row = userRow(page, account);
  if (!await row.count()) return;
  await row.getByRole('button', { name: '删除', exact: true }).click();
  const dialog = page.getByRole('dialog').last();
  await dialog.getByRole('button', { name: /确认|确定/ }).click();
  await expect(row).toBeHidden();
}

async function searchUsers(page, keyword) {
  const input = page.getByPlaceholder('搜索账户和姓名');
  await input.fill(keyword);
  await page.getByRole('button', { name: '查询', exact: true }).click();
  await expect(input).toHaveValue(keyword);
  return page.locator('tbody tr');
}

async function queryUsers(page, keyword = '') {
  const input = page.getByPlaceholder('搜索账户和姓名');
  await input.fill(keyword);
  await page.getByRole('button', { name: '查询', exact: true }).click();
  // The table is populated asynchronously. A deliberate empty query gives a
  // stable "all users" baseline instead of observing an in-flight first load.
  await expect(page.locator('tbody tr').first()).toBeVisible();
  return page.locator('tbody tr').allTextContents();
}

test.describe('用户管理查询与字段校验', () => {
  CASE('CASE-000267', '查询-按账号模糊搜索', async ({ page }) => {
    const suffix = Date.now();
    const keyword = `zhang${String(suffix).slice(-6)}`;
    const accounts = [`${keyword}a`, `${keyword}b`];
    await openUsers(page);
    try {
      await createUser(page, accounts[0], '账号查询甲');
      await createUser(page, accounts[1], '账号查询乙');
      const rows = await searchUsers(page, keyword);
      await expect(rows).toHaveCount(2);
      for (const cell of await rows.locator('td:first-child').allTextContents()) {
        expect(cell).toContain(keyword);
      }
    } finally {
      await searchUsers(page, '');
      for (const account of accounts) await deleteUser(page, account);
    }
  });

  CASE('CASE-000268', '查询-按姓名模糊搜索', async ({ page }) => {
    const suffix = String(Date.now()).slice(-6);
    const keyword = `张测${suffix}`;
    const accounts = [`name${suffix}a`, `name${suffix}b`];
    await openUsers(page);
    try {
      await createUser(page, accounts[0], `${keyword}甲`);
      await createUser(page, accounts[1], `${keyword}乙`);
      const rows = await searchUsers(page, keyword);
      await expect(rows).toHaveCount(2);
      for (const cell of await rows.locator('td').nth(1).allTextContents()) {
        expect(cell).toContain(keyword);
      }
    } finally {
      await searchUsers(page, '');
      for (const account of accounts) await deleteUser(page, account);
    }
  });

  CASE('CASE-000273', '查询-账号和姓名组合模糊搜索', async ({ page }) => {
    const suffix = String(Date.now()).slice(-6);
    const accountKeyword = `zhang${suffix}`;
    const nameKeyword = `张测${suffix}`;
    const accounts = [`${accountKeyword}a`, `lisi${suffix}`];
    await openUsers(page);
    try {
      await createUser(page, accounts[0], `${nameKeyword}甲`);
      await createUser(page, accounts[1], `李测${suffix}`);
      const rows = await searchUsers(page, `${accountKeyword} ${nameKeyword}`);
      await expect(rows).toHaveCount(0);
    } finally {
      await searchUsers(page, '');
      for (const account of accounts) await deleteUser(page, account);
    }
  });

  test('查询界面不显示手机号字段', async ({ page }) => {
    await openUsers(page);
    await expect(page.getByPlaceholder('搜索账户和姓名')).toBeVisible();
    await expect(page.getByPlaceholder(/手机号/)).toHaveCount(0);
    await expect(page.getByText('手机号', { exact: true })).toHaveCount(0);
  });

  test('查询界面无手机号搜索输入框', async ({ page }) => {
    await openUsers(page);
    await expect(page.getByPlaceholder(/手机/)).toHaveCount(0);
  });

  CASE('CASE-000269', '查询-无匹配结果', async ({ page }) => {
    await openUsers(page);
    const keyword = `xyz${Date.now()}`;
    await page.getByPlaceholder('搜索账户和姓名').fill(keyword);
    await page.getByRole('button', { name: '查询', exact: true }).click();
    await expect(page.locator('tbody tr').filter({ hasText: /.+/ })).toHaveCount(0);
  }, 'not-applicable');

  test('重置后查询条件恢复为空并执行查询', async ({ page }) => {
    await openUsers(page);
    const input = page.getByPlaceholder('搜索账户和姓名');
    await input.fill(`xyz${Date.now()}`);
    await page.getByRole('button', { name: '查询', exact: true }).click();
    await page.getByRole('button', { name: '重置', exact: true }).click();
    await expect(input).toHaveValue('');
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('查询-输入特殊字符', async ({ page }) => {
    await openUsers(page);
    const input = page.getByPlaceholder('搜索账户和姓名');
    await input.fill('@#$%');
    await page.getByRole('button', { name: '查询', exact: true }).click();
    await expect(input).toHaveValue('@#$%');
    await expect(page.locator('tbody tr').filter({ hasText: /.+/ })).toHaveCount(0);
  });

  CASE('CASE-000278', '查询-输入空格', async ({ page }) => {
    await openUsers(page);
    const allUsers = await queryUsers(page);
    const spaceUsers = await queryUsers(page, ' ');
    expect(spaceUsers).toEqual(allUsers);
  }, 'not-applicable');

  test('查询-清空查询条件', async ({ page }) => {
    await openUsers(page);
    const input = page.getByPlaceholder('搜索账户和姓名');
    const allUsers = await queryUsers(page);
    await input.fill(`xyz${Date.now()}`);
    await page.getByRole('button', { name: '查询', exact: true }).click();
    await expect(page.locator('tbody tr').filter({ hasText: /.+/ })).toHaveCount(0);
    await input.fill('');
    await page.getByRole('button', { name: '查询', exact: true }).click();
    await expect(page.locator('tbody tr').first()).toBeVisible();
    await expect(page.locator('tbody tr').allTextContents()).resolves.toEqual(allUsers);
  });

  test('新建用户表单不显示手机号字段', async ({ page }) => {
    await openUsers(page);
    const dialog = await openCreateUser(page);
    await expect(dialog.getByText('手机号', { exact: true })).toHaveCount(0);
    await expect(dialog.getByPlaceholder(/手机号/)).toHaveCount(0);
    await dialog.getByRole('button', { name: '取消', exact: true }).click();
  });

  test('新建用户时角色下拉框展示全部五个角色选项', async ({ page }) => {
    await openUsers(page);
    const dialog = await openCreateUser(page);
    await dialog.getByRole('combobox').click({ force: true });
    for (const role of ['管理员', '算法工程师', '采集工程师', '标注工程师', '质检工程师']) {
      await expect(page.getByText(role, { exact: true }).last()).toBeVisible();
    }
    await page.keyboard.press('Escape');
    await dialog.getByRole('button', { name: '取消', exact: true }).click();
  });

});
