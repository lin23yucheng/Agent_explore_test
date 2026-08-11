const { test, expect } = require('@playwright/test');

async function loginAndOpenUsers(page) {
  await page.goto('/');
  await page.locator('input').first().fill(process.env.UI_USERNAME || 'admin');
  await page.locator('input[type="password"]').first().fill(process.env.UI_PASSWORD || '123456');
  await page.getByRole('button', { name: /登录|登錄/ }).click();
  await expect(page.getByText('用户管理', { exact: true }).first()).toBeVisible({ timeout: 20_000 });
  await page.getByText('用户管理', { exact: true }).first().click();
  await expect(page.locator('body')).toContainText(/账号|姓名/);
}

async function openCreateUser(page) {
  const button = page.getByRole('button', { name: /新建用户|新增用户|创建用户/ }).first();
  await expect(button).toBeVisible();
  await button.click();
  await expect(page.getByRole('dialog').last()).toBeVisible();
}

async function userSearchInput(page) {
  const input = page.getByPlaceholder(/搜索.*姓名/).first();
  await expect(input).toBeVisible();
  return input;
}

function fieldByLabel(page, label) {
  return page.getByLabel(label, { exact: false }).first();
}

function visibleRows(page) {
  return page.locator('tbody tr:visible');
}

async function rowSnapshot(page) {
  return visibleRows(page).allTextContents();
}

function roleSelect(page) {
  return page.getByRole('dialog').last().getByText('可多选', { exact: true });
}

async function waitForRows(page) {
  await expect(visibleRows(page).first()).toBeVisible();
}

test('CASE-000300 用户管理 - 新建用户时角色下拉框显示全部预设角色', { annotation: { type: 'case', description: 'CASE-000300' } }, async ({ page }) => {
  await loginAndOpenUsers(page);
  await openCreateUser(page);
  const role = roleSelect(page);
  await expect(role).toBeVisible();
  await role.click();
  const popup = page.locator('[role="option"], .ant-select-item-option, li');
  for (const name of ['管理员', '算法工程师', '采集工程师', '标注工程师', '质检工程师']) {
    await expect(popup.filter({ hasText: name }).first()).toBeVisible();
  }
});

test('CASE-000301 用户管理 - 新建用户时角色下拉框必选校验', { annotation: { type: 'case', description: 'CASE-000301' } }, async ({ page }) => {
  await loginAndOpenUsers(page);
  await openCreateUser(page);
  await fieldByLabel(page, '账号').fill(`AI_${process.env.TEST_RUN_ID || Date.now()}`.slice(0, 32));
  await fieldByLabel(page, '姓名').fill('AI测试用户');
  const password = fieldByLabel(page, '初始密码');
  if (await password.count()) await password.fill('123456');
  await page.getByRole('button', { name: /确定|保存|提交/ }).last().click();
  await expect(page.getByRole('dialog').last()).toBeVisible();
  await expect(page.locator('.ant-form-item-explain-error, [role="alert"]').filter({ hasText: /角色|必填|选择/ }).first()).toBeVisible();
});

test('CASE-000312 用户管理 - 新建用户时初始密码默认值验证', { annotation: { type: 'case', description: 'CASE-000312' } }, async ({ page }) => {
  await loginAndOpenUsers(page);
  await openCreateUser(page);
  await expect(fieldByLabel(page, '初始密码')).toHaveValue('123456');
});

test('CASE-000325 用户管理 - 新建用户时所有必填项为空提示请填写完整信息', { annotation: { type: 'case', description: 'CASE-000325' } }, async ({ page }) => {
  await loginAndOpenUsers(page);
  await openCreateUser(page);
  await page.getByRole('button', { name: /确定|保存|提交/ }).last().click();
  await expect(page.getByRole('dialog').last()).toBeVisible();
  await expect(page.getByText(/请填写完整信息|必填项不能为空/).last()).toBeVisible();
});

test('CASE-000270 用户管理 - 模糊搜索关键字为空', { annotation: { type: 'case', description: 'CASE-000270' } }, async ({ page }) => {
  await loginAndOpenUsers(page);
  await waitForRows(page);
  const before = await rowSnapshot(page);
  const input = await userSearchInput(page);
  await input.fill('');
  await page.getByRole('button', { name: /查询|搜索/ }).first().click();
  await expect(visibleRows(page).first()).toBeVisible();
  await expect(input).toHaveValue('');
  await expect.poll(() => rowSnapshot(page)).toEqual(before);
});

test('CASE-000277 用户管理 - 搜索框为空时查询', { annotation: { type: 'case', description: 'CASE-000277' } }, async ({ page }) => {
  await loginAndOpenUsers(page);
  await waitForRows(page);
  const before = await rowSnapshot(page);
  const input = await userSearchInput(page);
  await input.fill('');
  await page.getByRole('button', { name: /查询|搜索/ }).first().click();
  await expect(visibleRows(page).first()).toBeVisible();
  await expect.poll(() => rowSnapshot(page)).toEqual(before);
});

test('CASE-000279 用户管理 - 重置后回到默认为空进行查询', { annotation: { type: 'case', description: 'CASE-000279' } }, async ({ page }) => {
  await loginAndOpenUsers(page);
  await waitForRows(page);
  const before = await rowSnapshot(page);
  const input = await userSearchInput(page);
  await input.fill('admin');
  await page.getByRole('button', { name: /查询|搜索/ }).first().click();
  await expect.poll(async () => {
    const rows = await visibleRows(page).allTextContents();
    return rows.length > 0 && rows.every(text => /admin/i.test(text));
  }).toBe(true);
  await page.getByRole('button', { name: '重置', exact: true }).click();
  await expect(input).toHaveValue('');
  await expect(visibleRows(page).first()).toBeVisible();
  await expect.poll(() => rowSnapshot(page)).toEqual(before);
});
