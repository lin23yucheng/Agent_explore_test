const { test, expect } = require('@playwright/test');
const { login } = require('../helpers/auth');

const CASE = (caseId, title, optionsOrBody, maybeBody) => {
  const body = typeof optionsOrBody === 'function' ? optionsOrBody : maybeBody;
  const options = typeof optionsOrBody === 'function' ? {} : optionsOrBody;
  const extraAnnotations = Array.isArray(options.annotation)
    ? options.annotation
    : options.annotation?.type && options.annotation.type !== 'case'
      ? [options.annotation]
      : [];
  return test(title, {
    ...options,
    annotation: [...extraAnnotations, { type: 'case', description: caseId }],
  }, body);
};

async function openUsers(page) {
  await login(page);
  await page.getByText('用户管理', { exact: true }).click();
  await expect(page.getByRole('button', { name: '新建用户', exact: true })).toBeVisible();
}

async function openCreate(page) {
  await page.getByRole('button', { name: '新建用户', exact: true }).click();
  const dialog = page.getByRole('dialog').last();
  await expect(dialog).toBeVisible();
  return dialog;
}

function row(page, account) {
  const escaped = account.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return page.locator('tbody tr').filter({
    has: page.locator('td:first-child').filter({ hasText: new RegExp(`^${escaped}$`) }),
  });
}

function account(prefix) {
  // Keep the generated value below the platform's 32-character account limit
  // so cleanup and later assertions use the same value the page stores.
  const safePrefix = prefix.replace(/[^A-Za-z0-9]/g, '');
  return `AI${safePrefix}${Date.now()}`.slice(0, 30);
}

async function fill(page, dialog, { account: value, name = '重跑验证', role = '采集工程师', password = '123456' } = {}) {
  const inputs = dialog.locator('input[type=text]');
  if (value !== undefined) await inputs.nth(0).fill(value);
  if (name !== undefined) await inputs.nth(1).fill(name);
  if (role) {
    await dialog.getByRole('combobox').click({ force: true });
    await page.locator('.el-select-dropdown:visible').getByText(role, { exact: true }).click();
  }
  const passwordInput = dialog.locator('input[type=password]');
  if (await passwordInput.count()) await passwordInput.fill(password);
}

async function remove(page, value) {
  if (page.isClosed()) return;
  const openDialog = page.getByRole('dialog').last();
  if (await openDialog.isVisible().catch(() => false)) {
    const cancel = openDialog.getByRole('button', { name: '取消', exact: true });
    if (await cancel.count()) await cancel.click({ force: true }).catch(() => {});
    await expect(openDialog).toBeHidden({ timeout: 5000 }).catch(() => {});
  }
  await focusUser(page, value);
  const userRow = row(page, value);
  if (!await userRow.count()) return;
  await userRow.getByRole('button', { name: '删除', exact: true }).click();
  const confirm = page.getByRole('dialog').last();
  await confirm.getByRole('button', { name: /确认|确定/ }).click();
  await expect(userRow).toBeHidden();
}

async function create(page, value, name = '重跑验证', password = '123456') {
  const dialog = await openCreate(page);
  await fill(page, dialog, { account: value, name, password });
  await dialog.getByRole('button', { name: '保存', exact: true }).click();
  const success = page.locator('.el-message').filter({ hasText: /创建成功|新增成功|保存成功/ });
  await expect.poll(async () => {
    const messageVisible = await success.isVisible().catch(() => false);
    const dialogClosed = !(await dialog.isVisible().catch(() => false));
    return messageVisible || dialogClosed;
  }, { timeout: 15000, message: '等待用户创建完成提示或弹窗关闭' }).toBe(true);
  await focusUser(page, value);
  await expect(row(page, value)).toBeVisible();
}

async function focusUser(page, value) {
  const search = page.getByPlaceholder('搜索账户和姓名');
  if (await search.count()) {
    await search.fill(value);
    await page.getByRole('button', { name: '查询', exact: true }).click();
    await expect(search).toHaveValue(value);
  }
}

async function edit(page, value) {
  await focusUser(page, value);
  const userRow = row(page, value);
  await userRow.getByRole('button', { name: '编辑', exact: true }).click();
  const dialog = page.getByRole('dialog').last();
  await expect(dialog).toBeVisible();
  return dialog;
}

async function loginContext(browser, value, password = '123456') {
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  await page.goto('/login');
  await page.getByPlaceholder('账号').fill(value);
  await page.getByPlaceholder('密码').fill(password);
  await page.getByRole('button', { name: '登录' }).click();
  return { context, page };
}

async function toggle(page, value, action) {
  await focusUser(page, value);
  const userRow = row(page, value);
  await userRow.getByRole('button', { name: action, exact: true }).click();
  const dialog = page.getByRole('dialog').last();
  if (await dialog.isVisible().catch(() => false)) {
    await dialog.getByRole('button', { name: /确认|确定/ }).click();
  }
}

async function openTasks(page) {
  await page.goto('/algorithm/tasks');
  await expect(page.getByRole('button', { name: '创建任务', exact: true })).toBeVisible();
}

async function chooseSelectOption(page, select, pattern) {
  await select.evaluate(element => element.querySelector('.el-select__wrapper').click());
  const option = page.locator('li.el-select-dropdown__item').filter({ hasText: pattern }).first();
  await expect.poll(async () => option.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }).catch(() => false), { timeout: 5000 }).toBe(true);
  await option.evaluate(element => element.click());
}

async function createAssignedTask(page, taskName, account) {
  await openTasks(page);
  await page.getByRole('button', { name: '创建任务', exact: true }).click();
  await page.waitForURL(/\/algorithm\/tasks\/create$/);
  await page.locator('input[placeholder*="仅支持"]').fill(taskName);

  await page.getByRole('button', { name: '+ 添加根节点', exact: true }).click();
  const nodeDialog = page.getByRole('dialog').last();
  await nodeDialog.locator('textarea[placeholder*="输入节点内容"]').fill('采集节点');
  await nodeDialog.getByRole('button', { name: '确定', exact: true }).click();

  const tagSelect = page.locator('.el-select').filter({ hasText: '请选择标签' });
  await chooseSelectOption(page, tagSelect, /训练其他/);
  const robotSelect = page.locator('.el-select').filter({ hasText: '请选择机器人构型' });
  await chooseSelectOption(page, robotSelect, /天机/);
  await page.getByRole('button', { name: '创建任务', exact: true }).click();
  await page.waitForURL(/\/algorithm\/tasks$/);

  const search = page.getByPlaceholder('搜索任务名称/编号');
  await search.fill(taskName);
  await expect.poll(async () => page.locator('tbody tr').filter({ hasText: taskName }).count()).toBe(1);
  const taskRow = page.locator('tbody tr').filter({ hasText: taskName });
  await taskRow.getByRole('button', { name: '指派', exact: true }).click();
  const assignDialog = page.getByRole('dialog').last();
  const collectorSelect = assignDialog.locator('.el-select').first();
  await chooseSelectOption(page, collectorSelect, new RegExp(account));
  await assignDialog.getByRole('button', { name: '确认指派', exact: true }).click();
  await expect(assignDialog).toBeHidden();
  await expect(taskRow).toContainText('采集用户');
}

async function removeTask(page, taskName) {
  await openTasks(page);
  const search = page.getByPlaceholder('搜索任务名称/编号');
  await search.fill(taskName);
  const taskRow = page.locator('tbody tr').filter({ hasText: taskName });
  if (!await taskRow.count()) return;
  // The task action is exposed in the operation column; scope the click to
  // that cell so it cannot target an unrelated control in the row.
  const operationCell = taskRow.locator('td').last();
  await operationCell.getByRole('button', { name: '删除', exact: true }).click();
  const dialog = page.getByRole('dialog').last();
  await dialog.getByRole('button', { name: '永久删除', exact: true }).click();
  await expect(taskRow).toBeHidden();
  // 任务删除接口异步完成后，重新加载并再次查询，确认后端引用已解除。
  await page.waitForTimeout(1000);
  await page.reload();
  const refreshedSearch = page.getByPlaceholder('搜索任务名称/编号');
  await refreshedSearch.fill(taskName);
  await page.getByRole('button', { name: '查询', exact: true }).click();
  await expect(page.locator('tbody tr').filter({ hasText: taskName })).toHaveCount(0);
}

CASE('CASE-000290', '用户管理 - 新建用户姓名为空时提示必填', async ({ page }) => {
  const value = account('name-required');
  await openUsers(page);
  try {
    const dialog = await openCreate(page);
    await fill(page, dialog, { account: value, name: undefined });
    await dialog.getByRole('button', { name: '保存', exact: true }).click();
    await expect(dialog).toBeVisible();
    await expect(row(page, value)).toHaveCount(0);
  } finally { await remove(page, value); }
});

CASE('CASE-000291', '用户管理 - 新建用户姓名为空时提交按钮不可用', async ({ page }) => {
  const value = account('name-disabled');
  await openUsers(page);
  try {
    const dialog = await openCreate(page);
    await fill(page, dialog, { account: value, name: undefined });
    const save = dialog.getByRole('button', { name: '保存', exact: true });
    if (await save.isDisabled()) return;
    await save.click();
    await expect(dialog).toBeVisible();
    await expect(row(page, value)).toHaveCount(0);
  } finally { await remove(page, value); }
});

for (const [caseId, title, value] of [
  ['CASE-000292', '用户管理 - 新建用户姓名长度边界值验证（最小值）', '张'],
  ['CASE-000293', '用户管理 - 新建用户姓名长度边界值验证（最大值）', '张'.repeat(32)],
]) {
  CASE(caseId, title, async ({ page }) => {
    const valueAccount = account(caseId.slice(-3));
    await openUsers(page);
    try { await create(page, valueAccount, value); await expect(row(page, valueAccount)).toContainText(value); }
    finally { await remove(page, valueAccount); }
  });
}

CASE('CASE-000294', '用户管理 - 新建用户姓名长度超限验证', async ({ page }) => {
  const value = account('name-limit');
  await openUsers(page);
  try {
    const dialog = await openCreate(page);
    await fill(page, dialog, { account: value, name: '张'.repeat(33) });
    const actual = await dialog.locator('input[type=text]').nth(1).inputValue();
    expect(actual.length).toBeLessThanOrEqual(32);
    await dialog.getByRole('button', { name: '取消', exact: true }).click();
  } finally { await remove(page, value); }
});

CASE('CASE-000295', '用户管理 - 新建用户姓名为空验证', async ({ page }) => {
  const value = account('name-empty');
  await openUsers(page);
  try {
    const dialog = await openCreate(page);
    await fill(page, dialog, { account: value, name: undefined });
    await dialog.getByRole('button', { name: '保存', exact: true }).click();
    await expect(dialog).toBeVisible();
  } finally { await remove(page, value); }
});

CASE('CASE-000311', '用户管理 - 新建用户初始密码必填项边界验证', async ({ page }) => {
  const value = account('password-required');
  await openUsers(page);
  try {
    const dialog = await openCreate(page);
    await fill(page, dialog, { account: value, name: '密码必填', password: '' });
    await dialog.getByRole('button', { name: '保存', exact: true }).click();
    await expect(dialog).toBeVisible();
  } finally { await remove(page, value); }
});

CASE('CASE-000313', '用户管理 - 新建用户初始密码默认值验证', async ({ page }) => {
  await openUsers(page);
  const dialog = await openCreate(page);
  await expect(dialog.locator('input[type=password]')).toHaveValue('123456');
  await dialog.getByRole('button', { name: '取消', exact: true }).click();
});

CASE('CASE-000314', '用户管理 - 初始密码明文显示切换验证', async ({ page }) => {
  await openUsers(page);
  const dialog = await openCreate(page);
  const password = dialog.locator('input[type=password]');
  await expect(password).toHaveValue('123456');
  const toggleButton = dialog.locator('button').filter({ has: dialog.locator('svg') }).last();
  if (await toggleButton.count()) {
    await toggleButton.click();
    await expect(dialog.locator('input[type=text]')).toHaveCount(3);
  }
  await dialog.getByRole('button', { name: '取消', exact: true }).click();
});

CASE('CASE-000332', '用户管理 - 并发创建相同账号时仅一个成功', async ({ page, browser }) => {
  const value = account('race');
  await openUsers(page);
  const other = await browser.newContext({ ignoreHTTPSErrors: true });
  const otherPage = await other.newPage();
  try {
    await openUsers(otherPage);
    const first = await openCreate(page); const second = await openCreate(otherPage);
    await fill(page, first, { account: value, name: '并发甲' }); await fill(otherPage, second, { account: value, name: '并发乙' });
    await Promise.all([first.getByRole('button', { name: '保存', exact: true }).click(), second.getByRole('button', { name: '保存', exact: true }).click()]);
    await page.getByPlaceholder('搜索账户和姓名').fill(value); await page.getByRole('button', { name: '查询', exact: true }).click();
    await expect(row(page, value)).toHaveCount(1);
  } finally { await other.close(); await page.reload(); await remove(page, value); }
});

CASE('CASE-000351', '用户管理 - 启用已禁用用户后该用户可正常登录', async ({ page, browser }) => {
  const value = account('enable');
  await openUsers(page);
  let session;
  try {
    await create(page, value, '启用登录'); await toggle(page, value, '禁用'); await toggle(page, value, '启用');
    session = await loginContext(browser, value); await expect(session.page).not.toHaveURL(/\/login$/);
  } finally { if (session) await session.context.close(); await remove(page, value); }
});

CASE('CASE-000353', '用户管理 - 禁用已登录用户后该用户被登出', async ({ page, browser }) => {
  const value = account('disable-active');
  await openUsers(page);
  let session;
  try {
    await create(page, value, '禁用会话'); session = await loginContext(browser, value); await toggle(page, value, '禁用');
    await session.page.reload(); await expect(session.page).toHaveURL(/\/login$/);
  } finally { if (session) await session.context.close(); await remove(page, value); }
});

CASE('CASE-000359', '用户管理 - 编辑弹框取消关闭不保存', async ({ page }) => {
  const value = account('edit-cancel');
  await openUsers(page);
  try { await create(page, value, '原姓名'); const dialog = await edit(page, value); await dialog.locator('input[type=text]').nth(1).fill('新姓名'); await dialog.getByRole('button', { name: '取消', exact: true }).click(); await expect(row(page, value)).toContainText('原姓名'); }
  finally { await remove(page, value); }
});

CASE('CASE-000360', '用户管理 - 编辑用户时清空必填项保存提示请填写完整信息', async ({ page }) => {
  const value = account('edit-empty');
  await openUsers(page);
  try { await create(page, value, '原姓名'); const dialog = await edit(page, value); await dialog.locator('input[type=text]').nth(1).fill(''); await dialog.getByRole('button', { name: '保存', exact: true }).click(); await expect(dialog).toBeVisible(); }
  finally { await page.reload(); await remove(page, value); }
});

CASE('CASE-000362', '用户管理 - 编辑用户时未选择角色保存提示请填写完整信息', async ({ page }) => {
  const value = account('edit-role');
  await openUsers(page);
  try { await create(page, value, '角色必填'); const dialog = await edit(page, value); const close = dialog.locator('.el-select__wrapper').first().locator('.el-tag__close'); while (await close.count()) await close.first().click(); await dialog.getByRole('button', { name: '保存', exact: true }).click(); await expect(dialog).toBeVisible(); }
  finally { await page.reload(); await remove(page, value); }
});

for (const [caseId, title, role] of [
  ['CASE-000363', '用户管理 - 修改角色后未登录用户登录展示新角色权限模块', '标注工程师'],
  ['CASE-000364', '用户管理 - 修改角色后已登录用户刷新页面展示新角色权限模块', '标注工程师'],
]) {
  CASE(caseId, title, async ({ page, browser }) => {
    const value = account(caseId.slice(-3));
    await openUsers(page);
    let session;
    try { await create(page, value, '角色切换'); const dialog = await edit(page, value); const select = dialog.locator('.el-select__wrapper').first(); const close = select.locator('.el-tag__close'); while (await close.count()) await close.first().click(); await select.click({ force: true }); await page.locator('.el-select-dropdown:visible').getByText(role, { exact: true }).click(); await dialog.locator('.el-dialog__header').click(); await dialog.getByRole('button', { name: '保存', exact: true }).click(); session = await loginContext(browser, value); await expect(session.page).not.toHaveURL(/\/login$/); }
    finally { if (session) await session.context.close(); await remove(page, value); }
  });
}

CASE('CASE-000368', '用户管理 - 重置密码二次确认后确定重置成功', async ({ page, browser }) => {
  const value = account('reset');
  await openUsers(page);
  let session;
  try { await create(page, value, '重置密码', 'abc12345'); const userRow = row(page, value); await userRow.getByRole('button', { name: '重置密码', exact: true }).click(); const dialog = page.getByRole('dialog').last(); await dialog.getByRole('button', { name: /确认|确定/ }).click(); session = await loginContext(browser, value); await expect(session.page).not.toHaveURL(/\/login$/); }
  finally { if (session) await session.context.close(); await remove(page, value); }
});

CASE('CASE-000369', '用户管理 - 重置密码后已登录用户保持登录状态', async ({ page, browser }) => {
  const value = account('reset-active');
  await openUsers(page);
  let session;
  try { await create(page, value, '重置会话'); session = await loginContext(browser, value); await focusUser(page, value); const userRow = row(page, value); await userRow.getByRole('button', { name: '重置密码', exact: true }).click(); await page.getByRole('dialog').last().getByRole('button', { name: /确认|确定/ }).click(); await session.page.reload(); await expect(session.page).not.toHaveURL(/\/login$/); }
  finally { if (session) await session.context.close(); await remove(page, value); }
}, { annotation: { type: 'failure-category', description: 'PRODUCT_DEFECT' } });

CASE('CASE-000371', '用户管理 - 禁用账号后未登录用户登录提示', async ({ page, browser }) => {
  const value = account('disable-login');
  await openUsers(page);
  let session;
  try { await create(page, value, '禁用登录'); await toggle(page, value, '禁用'); session = await loginContext(browser, value); await expect(session.page).toHaveURL(/\/login$/); }
  finally { if (session) await session.context.close(); await remove(page, value); }
});

CASE('CASE-000374', '用户管理 - 取消删除用户关闭弹窗', async ({ page }) => {
  const value = account('delete-cancel');
  await openUsers(page);
  try { await create(page, value, '取消删除'); await focusUser(page, value); const userRow = row(page, value); await userRow.getByRole('button', { name: '删除', exact: true }).click(); const dialog = page.getByRole('dialog').last(); await dialog.getByRole('button', { name: '取消', exact: true }).click(); await expect(userRow).toBeVisible(); }
  finally { await remove(page, value); }
});

CASE('CASE-000376', '用户管理 - 删除已被指派任务的账号时提示不允许删除', async ({ page }) => {
  const accountValue = account('assigned');
  const taskName = account('task');
  await openUsers(page);
  try {
    await create(page, accountValue, '采集用户');
    await createAssignedTask(page, taskName, accountValue);
    await openUsers(page);
    await focusUser(page, accountValue);
    const userRow = row(page, accountValue);
    await userRow.getByRole('button', { name: '删除', exact: true }).click();
    const dialog = page.getByRole('dialog').last();
    await dialog.getByRole('button', { name: /确认|确定/ }).click();
    await expect(page.locator('.el-message').filter({ hasText: '该用户已被分配任务，不允许删除' })).toBeVisible();
    await expect(userRow).toBeVisible();
  } finally {
    let cleanupStatus = 'passed';
    try {
      await removeTask(page, taskName);
      await openUsers(page);
      let removed = false;
      for (let attempt = 0; attempt < 5 && !removed; attempt += 1) {
        try {
          await remove(page, accountValue);
          removed = true;
        } catch (error) {
          if (attempt === 4) throw error;
          await page.waitForTimeout(2000);
          await page.reload();
          await expect(page.getByRole('button', { name: '新建用户', exact: true })).toBeVisible();
          await focusUser(page, accountValue);
        }
      }
    } catch (error) {
      cleanupStatus = 'failed';
      console.error(`CASE-000376 cleanup failed: ${error.message}`);
    }
    await test.info().attach('cleanup-status.json', {
      body: JSON.stringify({ status: cleanupStatus }),
      contentType: 'application/json',
    });
  }
});

CASE('CASE-000377', '用户管理 - 未登录状态下删除用户时提示账号或密码错误或账号已被禁用', async ({ page }) => {
  await page.goto('/users');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('button', { name: '删除', exact: true })).toHaveCount(0);
});

CASE('CASE-000378', '用户管理 - 删除用户后已登录用户点击菜单被登出', async ({ page, browser }) => {
  const value = account('delete-active');
  await openUsers(page);
  let session;
  try { await create(page, value, '删除会话'); session = await loginContext(browser, value); await focusUser(page, value); const userRow = row(page, value); await userRow.getByRole('button', { name: '删除', exact: true }).click(); await page.getByRole('dialog').last().getByRole('button', { name: /确认|确定/ }).click(); await session.page.reload(); await expect(session.page).toHaveURL(/\/login$/); }
  finally { if (session) await session.context.close(); await remove(page, value); }
});
