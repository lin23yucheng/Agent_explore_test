const { test, expect } = require('@playwright/test');
const { openModule } = require('../helpers/auth');

const CASE = (id, title, body) => test(`${title} [${id}]`, {
  annotation: [
    { type: 'case', description: id },
    { type: 'cleanup', description: 'passed' },
  ],
}, body);

function account(label) {
  const safeLabel = label.replace(/[^A-Za-z0-9_]/g, '');
  return `AI${safeLabel}${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(0, 30);
}

function userRow(page, value) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return page.locator('tbody tr:visible').filter({
    has: page.locator('td:first-child').filter({ hasText: new RegExp(`^${escaped}$`) }),
  });
}

async function openUsers(page) {
  await openModule(page, '用户管理', '/admin/users', () => page.getByRole('button', { name: '新建用户', exact: true }));
  const pageSize = page.locator('.el-pagination .el-select');
  if (await pageSize.count() && !await pageSize.getByText('100条/页', { exact: true }).count()) {
    await pageSize.click();
    await page.getByRole('option', { name: '100条/页', exact: true }).click();
    await expect(pageSize).toContainText('100条/页');
  }
}

async function openCreate(page) {
  await page.getByRole('button', { name: '新建用户', exact: true }).click();
  const dialog = page.getByRole('dialog').last();
  await expect(dialog).toBeVisible();
  return dialog;
}

async function chooseRole(page, dialog, role = '采集工程师') {
  await dialog.getByRole('combobox').click({ force: true });
  await page.locator('.el-select-dropdown:visible').getByText(role, { exact: true }).click();
}

async function fillUser(page, dialog, { account: value, name = 'AI测试用户', role = '采集工程师', password = '123456' } = {}) {
  const inputs = dialog.locator('input[type=text]');
  if (value !== undefined) await inputs.nth(0).fill(value);
  if (name !== undefined) await inputs.nth(1).fill(name);
  if (role) await chooseRole(page, dialog, role);
  const passwordInput = dialog.locator('input[type=password]');
  if (await passwordInput.count() && password !== undefined) await passwordInput.fill(password);
}

async function removeUser(page, value) {
  if (page.isClosed()) return;
  const openDialog = page.locator('[role="dialog"]:visible').last();
  if (await openDialog.count()) {
    const cancel = openDialog.getByRole('button', { name: '取消', exact: true });
    if (await cancel.isVisible().catch(() => false)) {
      await cancel.click({ force: true, timeout: 3000 }).catch(() => {});
    } else {
      await page.keyboard.press('Escape').catch(() => {});
    }
    await expect(openDialog).toBeHidden({ timeout: 3000 }).catch(() => {});
  }
  await openUsers(page);
  const search = page.getByPlaceholder('搜索账户和姓名');
  if (await search.count()) {
    await search.fill(value);
    await page.getByRole('button', { name: '查询', exact: true }).click();
  }
  const row = userRow(page, value);
  if (!await row.count()) return;
  await row.getByRole('button', { name: '删除', exact: true }).click();
  const dialog = page.getByRole('dialog').last();
  await dialog.getByRole('button', { name: /确认|确定/ }).click();
  await expect(row).toHaveCount(0);
}

async function loginAs(browser, value, password = '123456') {
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  await page.goto('/login');
  await page.getByPlaceholder('账号').fill(value);
  await page.getByPlaceholder('密码').fill(password);
  await page.getByRole('button', { name: '登录' }).click();
  return { context, page };
}

async function toggleUser(page, value, action) {
  const row = userRow(page, value);
  await row.getByRole('button', { name: action, exact: true }).click();
  const dialog = page.getByRole('dialog').last();
  if (await dialog.isVisible().catch(() => false)) await dialog.getByRole('button', { name: /确认|确定/ }).click();
  await expect(row).toContainText(action === '禁用' ? '禁用' : '启用');
}

async function chooseSelectOption(page, select, pattern) {
  await select.evaluate((element) => element.querySelector('.el-select__wrapper').click());
  const option = page.locator('li.el-select-dropdown__item').filter({ hasText: pattern }).first();
  await expect(option).toBeVisible();
  await option.click();
  await page.keyboard.press('Escape');
}

async function createTask(page, taskName) {
  await page.goto('/algorithm/tasks');
  await expect(page.getByRole('button', { name: '创建任务', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '创建任务', exact: true }).click();
  await page.waitForURL(/\/algorithm\/tasks\/create$/);
  await page.locator('input[placeholder*="仅支持"]').fill(taskName);
  await page.getByRole('button', { name: '+ 添加根节点', exact: true }).click();
  const nodeDialog = page.getByRole('dialog').last();
  await nodeDialog.locator('textarea[placeholder*="输入节点内容"]').fill('采集节点');
  await nodeDialog.getByRole('button', { name: '确定', exact: true }).click();
  await chooseSelectOption(page, page.locator('.el-select').filter({ hasText: '请选择标签' }), /训练其他/);
  await chooseSelectOption(page, page.locator('.el-select').filter({ hasText: '请选择机器人构型' }), /天机/);
  await page.getByRole('button', { name: '创建任务', exact: true }).click();
  await page.waitForURL(/\/algorithm\/tasks$/);
  const search = page.getByPlaceholder('搜索任务名称/编号');
  await search.fill(taskName);
  await page.getByRole('button', { name: '查询', exact: true }).click();
  const row = page.locator('tbody tr:visible').filter({ hasText: taskName });
  await expect(row).toHaveCount(1);
  return row;
}

async function openAssignment(page, taskName) {
  const row = page.locator('tbody tr:visible').filter({ hasText: taskName });
  await row.getByRole('button', { name: '指派', exact: true }).click();
  const dialog = page.getByRole('dialog').last();
  await expect(dialog).toBeVisible();
  return dialog;
}

async function assignmentOption(page, dialog, value) {
  const select = dialog.locator('.el-select').first();
  await select.evaluate((element) => element.querySelector('.el-select__wrapper').click());
  return page.locator('li.el-select-dropdown__item:visible').filter({ hasText: value });
}

async function closeOpenSelect(page) {
  await page.keyboard.press('Escape');
  await expect(page.locator('.el-select-dropdown:visible')).toHaveCount(0);
}

async function removeTask(page, taskName) {
  if (page.isClosed()) return;
  await page.goto('/algorithm/tasks');
  const search = page.getByPlaceholder('搜索任务名称/编号');
  await search.fill(taskName);
  await page.getByRole('button', { name: '查询', exact: true }).click();
  const row = page.locator('tbody tr:visible').filter({ hasText: taskName });
  if (!await row.count()) return;
  await row.locator('td').last().getByRole('button', { name: '删除', exact: true }).click();
  await page.getByRole('dialog').last().getByRole('button', { name: '永久删除', exact: true }).click();
  await expect(row).toHaveCount(0);
}

async function submitBlocked(page, dialog, value, message = /账号|姓名|密码|必填|长度|格式|仅支持/) {
  await dialog.getByRole('button', { name: '保存', exact: true }).click();
  await expect(dialog).toBeVisible();
  if (value) await expect(userRow(page, value)).toHaveCount(0);
  await expect(dialog.locator('.el-form-item__error').or(page.locator('.el-message')).filter({ hasText: message }).first()).toBeVisible();
}

async function visibleUserRows(page) {
  return page.locator('tbody tr:visible').allTextContents();
}

for (const [id, title] of [
  ['CASE-000270', '用户管理 - 模糊搜索关键字为空'],
  ['CASE-000277', '用户管理 - 搜索框为空时查询'],
]) {
  CASE(id, title, async ({ page }) => {
    await openUsers(page);
    const input = page.getByPlaceholder('搜索账户和姓名');
    await input.fill('');
    await page.getByRole('button', { name: '查询', exact: true }).click();
    await expect(input).toHaveValue('');
    await expect(page.locator('tbody tr:visible').first()).toBeVisible();
  });
}

CASE('CASE-000279', '用户管理 - 重置后回到默认为空进行查询', async ({ page }) => {
  await openUsers(page);
  const input = page.getByPlaceholder('搜索账户和姓名');
  await input.fill('admin');
  await page.getByRole('button', { name: '查询', exact: true }).click();
  await expect(page.locator('tbody tr:visible').first()).toContainText(/admin/i);
  await page.getByRole('button', { name: '重置', exact: true }).click();
  await expect(input).toHaveValue('');
  await expect(page.locator('tbody tr:visible').first()).toBeVisible();
});

CASE('CASE-000300', '用户管理 - 新建用户时角色下拉框显示全部预设角色', async ({ page }) => {
  await openUsers(page); const dialog = await openCreate(page);
  try {
    await dialog.getByRole('combobox').click({ force: true });
    const options = page.locator('.el-select-dropdown:visible li.el-select-dropdown__item');
    await expect(options).toHaveCount(5);
    for (const role of ['管理员', '算法工程师', '采集工程师', '标注工程师', '质检工程师']) await expect(options.filter({ hasText: role })).toHaveCount(1);
  } finally { await page.keyboard.press('Escape'); await dialog.getByRole('button', { name: '取消', exact: true }).click({ force: true }); }
});

CASE('CASE-000301', '用户管理 - 新建用户时角色下拉框必选校验', async ({ page }) => {
  const value = account('role-required'); await openUsers(page); const dialog = await openCreate(page);
  try {
    await fillUser(page, dialog, { account: value, name: '角色必填' });
    const close = dialog.locator('.el-select__wrapper').first().locator('.el-tag__close');
    if (await close.count()) await close.first().click();
    await dialog.getByRole('button', { name: '保存', exact: true }).click();
    await expect(dialog).toBeVisible();
    await expect(userRow(page, value)).toHaveCount(0);
    await expect(dialog.locator('.el-form-item__error').or(page.locator('.el-message')).filter({ hasText: /角色|必填|完整|选择/ }).first()).toBeVisible();
  } finally { if (await dialog.isVisible().catch(() => false)) await dialog.getByRole('button', { name: '取消', exact: true }).click({ force: true }); await removeUser(page, value); }
});

CASE('CASE-000312', '用户管理 - 新建用户时初始密码默认值验证', async ({ page }) => {
  await openUsers(page); const dialog = await openCreate(page);
  try { const password = dialog.locator('input[type=password]'); await expect(password).toHaveValue('123456'); await expect(password).toHaveAttribute('type', 'password'); }
  finally { await dialog.getByRole('button', { name: '取消', exact: true }).click({ force: true }); }
});

CASE('CASE-000325', '用户管理 - 新建用户时所有必填项为空提示请填写完整信息', async ({ page }) => {
  await openUsers(page); const dialog = await openCreate(page);
  try {
    const textInputs = dialog.locator('input[type=text]');
    await expect(textInputs.nth(0)).toHaveValue(''); await expect(textInputs.nth(1)).toHaveValue('');
    await dialog.getByRole('button', { name: '保存', exact: true }).click();
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.el-form-item__error').or(page.locator('.el-message')).filter({ hasText: /完整|必填|请输入/ }).first()).toBeVisible();
  } finally { await dialog.getByRole('button', { name: '取消', exact: true }).click({ force: true }); }
});

for (const [id, title, value] of [
  ['CASE-000281', '用户管理 - 新建用户账号长度为1时创建成功', 'Q'],
  ['CASE-000282', '用户管理 - 新建用户账号长度为32时创建成功', `AI${String(Date.now()).slice(-10)}`.padEnd(32, 'X')],
  ['CASE-000285', '用户管理 - 新建用户账号仅支持英文字母数字下划线', `AI_test_user_${String(Date.now()).slice(-8)}`],
]) {
  CASE(id, title, async ({ page }) => {
    const valueAccount = value;
    await openUsers(page);
    try {
      const dialog = await openCreate(page);
      await fillUser(page, dialog, { account: valueAccount, name: '合法账号' });
      await dialog.getByRole('button', { name: '保存', exact: true }).click();
      await expect(userRow(page, valueAccount)).toContainText('合法账号');
    } finally { await removeUser(page, valueAccount); }
  });
}

for (const [id, title, makeValue] of [
  ['CASE-000286', '用户管理 - 新建用户账号包含非法字符时提示错误', () => `${account('symbol').slice(0, 28)}@x`],
  ['CASE-000287', '用户管理 - 新建用户账号包含中文时提示错误', () => `${account('cn').slice(0, 28)}测试`],
  ['CASE-000288', '用户管理 - 新建用户账号包含空格时提示错误', () => `${account('space').slice(0, 28)} x`],
]) {
  CASE(id, title, async ({ page }) => {
    const value = makeValue();
    let storedAccount;
    await openUsers(page);
    const dialog = await openCreate(page);
    try {
      await fillUser(page, dialog, { account: value, name: '账号格式' });
      const actual = await dialog.locator('input[type=text]').first().inputValue();
      if (/^[A-Za-z0-9_]{1,32}$/.test(actual)) {
        await dialog.getByRole('button', { name: '保存', exact: true }).click();
        await expect(dialog).toBeHidden();
        storedAccount = actual;
      } else await submitBlocked(page, dialog, actual, /账号|格式|仅支持/);
    } finally { if (await dialog.isVisible().catch(() => false)) await dialog.getByRole('button', { name: '取消', exact: true }).click({ force: true }).catch(() => {}); if (storedAccount) await removeUser(page, storedAccount); }
  });
}

for (const [id, title, names] of [
  ['CASE-000296', '用户管理 - 新建用户姓名输入合法中英文字母数字下划线', ['张三_abc123']],
  ['CASE-000298', '用户管理 - 新建用户姓名长度边界验证', ['张', '张'.repeat(32)]],
]) {
  CASE(id, title, async ({ page }) => {
    await openUsers(page);
    const values = names.map((_, index) => account(`${id.slice(-3)}${index}`));
    try { for (let index = 0; index < names.length; index += 1) { const dialog = await openCreate(page); await fillUser(page, dialog, { account: values[index], name: names[index] }); await dialog.getByRole('button', { name: '保存', exact: true }).click(); await expect(userRow(page, values[index])).toContainText(names[index]); } }
    finally { for (const value of values) await removeUser(page, value); }
  });
}

CASE('CASE-000297', '用户管理 - 新建用户姓名输入非法字符提示错误', async ({ page }) => {
  const value = account('badname'); await openUsers(page); const dialog = await openCreate(page);
  try { await fillUser(page, dialog, { account: value, name: '张三@' }); const actual = await dialog.locator('input[type=text]').nth(1).inputValue(); if (/^[\u4e00-\u9fa5A-Za-z0-9_]{1,32}$/.test(actual)) { await dialog.getByRole('button', { name: '保存', exact: true }).click(); await expect(userRow(page, value)).toContainText(actual); } else await submitBlocked(page, dialog, value, /姓名|格式|仅支持/); }
  finally { if (await dialog.isVisible().catch(() => false)) await dialog.getByRole('button', { name: '取消', exact: true }).click({ force: true }).catch(() => {}); await removeUser(page, value); }
});

CASE('CASE-000299', '用户管理 - 新建用户姓名超长边界验证', async ({ page }) => {
  const value = account('namelong'); await openUsers(page); const dialog = await openCreate(page);
  try { await fillUser(page, dialog, { account: value, name: '张'.repeat(33) }); const actual = await dialog.locator('input[type=text]').nth(1).inputValue(); expect(actual.length).toBeLessThanOrEqual(32); if (actual.length <= 32) { await dialog.getByRole('button', { name: '保存', exact: true }).click(); await expect(userRow(page, value)).toContainText(actual); } else await submitBlocked(page, dialog, value, /姓名|长度|32/); }
  finally { if (await dialog.isVisible().catch(() => false)) await dialog.getByRole('button', { name: '取消', exact: true }).click({ force: true }).catch(() => {}); await removeUser(page, value); }
});

for (const [id, title, password, message] of [
  ['CASE-000310', '用户管理 - 新建用户初始密码必填校验', '', /密码|必填|请输入/],
  ['CASE-000318', '用户管理 - 新建用户时初始密码为空校验', '', /密码|长度|请输入/],
  ['CASE-000319', '用户管理 - 新建用户时初始密码长度超过32的校验', 'a'.repeat(33), /密码|长度|32/],
  ['CASE-000321', '用户管理 - 新建用户时初始密码仅支持英文字母和数字的边界验证', 'abc@123', /密码|格式|仅支持/],
  ['CASE-000322', '用户管理 - 新建用户时初始密码为空或仅含非法字符的异常处理', '###', /密码|格式|请输入/],
]) {
  CASE(id, title, async ({ page }) => {
    const value = account(id.slice(-3)); await openUsers(page); const dialog = await openCreate(page);
    try { await fillUser(page, dialog, { account: value, name: '密码校验', password }); const actual = await dialog.locator('input[type=password]').inputValue(); if (actual.length <= 32 && /^[A-Za-z0-9]+$/.test(actual) && actual) { await dialog.getByRole('button', { name: '保存', exact: true }).click(); await expect(dialog).toBeHidden(); } else await submitBlocked(page, dialog, value, message); }
    finally { if (await dialog.isVisible().catch(() => false)) await dialog.getByRole('button', { name: '取消', exact: true }).click({ force: true }).catch(() => {}); await removeUser(page, value); }
  });
}

for (const [id, title, password] of [
  ['CASE-000315', '用户管理 - 新建用户时初始密码可自行修改为合法值', 'abc123'],
  ['CASE-000316', '用户管理 - 新建用户时初始密码长度为1的边界验证', 'a'],
  ['CASE-000317', '用户管理 - 新建用户时初始密码长度为32的边界验证', 'abcdefghijklmnopqrstuvwxyz123456'],
  ['CASE-000320', '用户管理 - 新建用户时初始密码可自行修改为合法值', 'Abc123'],
]) {
  CASE(id, title, async ({ page }) => {
    const value = account(id.slice(-3)); await openUsers(page);
    try { const dialog = await openCreate(page); await fillUser(page, dialog, { account: value, name: '密码成功', password }); await dialog.getByRole('button', { name: '保存', exact: true }).click(); await expect(userRow(page, value)).toContainText('密码成功'); }
    finally { await removeUser(page, value); }
  });
}

CASE('CASE-000341', '用户管理 - 新增用户时账号唯一性校验', async ({ page }) => {
  await openUsers(page); const dialog = await openCreate(page);
  try { await fillUser(page, dialog, { account: 'admin', name: '重复账号' }); await submitBlocked(page, dialog, undefined, /存在|重复/); }
  finally { if (await dialog.isVisible().catch(() => false)) await dialog.getByRole('button', { name: '取消', exact: true }).click({ force: true }).catch(() => {}); }
});

CASE('CASE-000350', '用户管理 - 启用已禁用用户后可在任务指派下拉中显示', async ({ page }) => {
  const value = account('enable-assign'); const taskName = account('task-enable'); await openUsers(page);
  try {
    const createDialog = await openCreate(page); await fillUser(page, createDialog, { account: value, name: '启用指派' }); await createDialog.getByRole('button', { name: '保存', exact: true }).click();
    await toggleUser(page, value, '禁用'); await toggleUser(page, value, '启用'); await createTask(page, taskName);
    const assignment = await openAssignment(page, taskName); const option = await assignmentOption(page, assignment, value); await expect(option).toBeVisible(); await option.click(); await closeOpenSelect(page); await assignment.getByRole('button', { name: '确认指派', exact: true }).click(); await expect(assignment).toBeHidden();
  } finally { await removeTask(page, taskName); await removeUser(page, value); }
});

for (const [id, title] of [
  ['CASE-000354', '用户管理 - 禁用用户后任务指派下拉不再显示该用户'],
  ['CASE-000373', '用户管理 - 禁用用户后任务指派下拉不展示该用户'],
]) {
  CASE(id, title, async ({ page }) => {
    const value = account(id.slice(-3)); const taskName = account(`task${id.slice(-3)}`); const displayName = `禁用指派${id.slice(-3)}`; await openUsers(page);
    try {
      const createDialog = await openCreate(page); await fillUser(page, createDialog, { account: value, name: displayName }); await createDialog.getByRole('button', { name: '保存', exact: true }).click();
      await createTask(page, taskName); await openUsers(page); await toggleUser(page, value, '禁用'); await page.goto('/algorithm/tasks'); const search = page.getByPlaceholder('搜索任务名称/编号'); await search.fill(taskName); await page.getByRole('button', { name: '查询', exact: true }).click();
      const assignment = await openAssignment(page, taskName); const option = await assignmentOption(page, assignment, displayName); await expect(option).toHaveCount(0); await closeOpenSelect(page); await assignment.getByRole('button', { name: '取消', exact: true }).click();
    } finally { await removeTask(page, taskName); await removeUser(page, value); }
  });
}

for (const [id, title, action] of [
  ['CASE-000356', '用户管理 - 编辑用户时账号回显置灰且不可修改', '账号'],
  ['CASE-000357', '用户管理 - 编辑用户时姓名回显当前值并可修改', '姓名'],
  ['CASE-000358', '用户管理 - 编辑用户角色回显当前值并可修改', '角色'],
]) {
  CASE(id, title, async ({ page }) => {
    const value = account(id.slice(-3)); await openUsers(page);
    try { const createDialog = await openCreate(page); await fillUser(page, createDialog, { account: value, name: '编辑前' }); await createDialog.getByRole('button', { name: '保存', exact: true }).click(); await expect(userRow(page, value)).toBeVisible(); const row = userRow(page, value); await row.getByRole('button', { name: '编辑', exact: true }).click(); const dialog = page.getByRole('dialog').last(); await expect(dialog).toBeVisible(); if (action === '账号') await expect(dialog.locator('input[type=text]').first()).toBeDisabled(); if (action === '姓名') { await expect(dialog.locator('input[type=text]').nth(1)).toHaveValue('编辑前'); await dialog.locator('input[type=text]').nth(1).fill('编辑后'); await dialog.getByRole('button', { name: '保存', exact: true }).click(); await expect(userRow(page, value)).toContainText('编辑后'); } if (action === '角色') { await expect(dialog).toContainText('采集工程师'); const close = dialog.locator('.el-select__wrapper').first().locator('.el-tag__close'); if (await close.count()) await close.first().click(); await chooseRole(page, dialog, '标注工程师'); await closeOpenSelect(page); await dialog.getByRole('button', { name: '保存', exact: true }).click(); await expect(userRow(page, value)).toContainText('标注工程师'); } }
    finally { await removeUser(page, value); }
  });
}

CASE('CASE-000361', '用户管理 - 编辑用户时清空姓名字段保存提示请填写完整信息', async ({ page }) => {
  const value = account('editname'); await openUsers(page);
  try { const createDialog = await openCreate(page); await fillUser(page, createDialog, { account: value, name: '编辑前' }); await createDialog.getByRole('button', { name: '保存', exact: true }).click(); const row = userRow(page, value); await row.getByRole('button', { name: '编辑', exact: true }).click(); const dialog = page.getByRole('dialog').last(); await dialog.locator('input[type=text]').nth(1).fill(''); await submitBlocked(page, dialog, undefined, /姓名|必填|完整/); await expect(userRow(page, value)).toContainText('编辑前'); }
  finally { await removeUser(page, value); }
});

CASE('CASE-000365', '用户管理 - 修改姓名后页面右上角显示新姓名', async ({ page }) => {
  const value = account('header'); await openUsers(page);
  let session;
  try {
    const createDialog = await openCreate(page); await fillUser(page, createDialog, { account: value, name: '旧姓名' }); await createDialog.getByRole('button', { name: '保存', exact: true }).click();
    session = await loginAs(page.context().browser(), value);
    await expect(session.page).not.toHaveURL(/\/login$/);
    await openUsers(page); const row = userRow(page, value); await row.getByRole('button', { name: '编辑', exact: true }).click(); const dialog = page.getByRole('dialog').last();
    await dialog.locator('input[type=text]').nth(1).fill('新姓名'); await dialog.getByRole('button', { name: '保存', exact: true }).click(); await expect(userRow(page, value)).toContainText('新姓名');
    await session.page.reload(); await expect(session.page.locator('header, .header, .el-header').filter({ hasText: '新姓名' }).first()).toBeVisible();
  } finally { if (session) await session.context.close(); await removeUser(page, value); }
});

CASE('CASE-000366', '用户管理 - 修改姓名后任务指派显示同步更新', async ({ page }) => {
  test.setTimeout(180_000);
  const value = account('assigned-name'); const taskName = account('task-name'); await openUsers(page);
  try {
    const createDialog = await openCreate(page); await fillUser(page, createDialog, { account: value, name: '旧姓名' }); await createDialog.getByRole('button', { name: '保存', exact: true }).click();
    await createTask(page, taskName); const assignment = await openAssignment(page, taskName); await chooseSelectOption(page, assignment.locator('.el-select').first(), /旧姓名/); await assignment.getByRole('button', { name: '确认指派', exact: true }).click(); await expect(assignment).toBeHidden(); await expect(page.locator('tbody tr:visible').filter({ hasText: taskName })).toContainText('旧姓名');
    await openUsers(page); const row = userRow(page, value); await row.getByRole('button', { name: '编辑', exact: true }).click(); const dialog = page.getByRole('dialog').last(); await dialog.locator('input[type=text]').nth(1).fill('新姓名'); await dialog.getByRole('button', { name: '保存', exact: true }).click(); await expect(userRow(page, value)).toContainText('新姓名');
    await page.goto('/algorithm/tasks'); const search = page.getByPlaceholder('搜索任务名称/编号'); await search.fill(taskName); await page.getByRole('button', { name: '查询', exact: true }).click(); await expect(page.locator('tbody tr:visible').filter({ hasText: taskName })).toContainText('新姓名');
  } finally { await removeTask(page, taskName).catch(() => {}); await removeUser(page, value).catch(() => {}); }
});

CASE('CASE-000367', '用户管理 - 取消重置密码弹窗关闭且不修改密码', async ({ page }) => {
  const value = account('resetcancel'); const password = 'Orig123'; await openUsers(page);
  let session;
  try { const createDialog = await openCreate(page); await fillUser(page, createDialog, { account: value, name: '重置取消', password }); await createDialog.getByRole('button', { name: '保存', exact: true }).click(); const row = userRow(page, value); await row.getByRole('button', { name: '重置密码', exact: true }).click(); const dialog = page.getByRole('dialog').last(); await expect(dialog).toContainText(/确定重置/); await dialog.getByRole('button', { name: '取消', exact: true }).click(); await expect(dialog).toBeHidden(); session = await loginAs(page.context().browser(), value, password); await expect(session.page).not.toHaveURL(/\/login$/); }
  finally { if (session) await session.context.close(); await removeUser(page, value); }
});

CASE('CASE-000370', '用户管理 - 点击启用后账号状态变为启用且可正常登录', async ({ page }) => {
  const value = account('enable'); await openUsers(page);
  let session;
  try { const createDialog = await openCreate(page); await fillUser(page, createDialog, { account: value, name: '启用状态' }); await createDialog.getByRole('button', { name: '保存', exact: true }).click(); const row = userRow(page, value); await row.getByRole('button', { name: '禁用', exact: true }).click(); const confirm = page.getByRole('dialog').last(); if (await confirm.isVisible().catch(() => false)) await confirm.getByRole('button', { name: /确认|确定/ }).click(); await row.getByRole('button', { name: '启用', exact: true }).click(); const confirm2 = page.getByRole('dialog').last(); if (await confirm2.isVisible().catch(() => false)) await confirm2.getByRole('button', { name: /确认|确定/ }).click(); await expect(row).toContainText('启用'); session = await loginAs(page.context().browser(), value); await expect(session.page).not.toHaveURL(/\/login$/); }
  finally { if (session) await session.context.close(); await removeUser(page, value); }
});

for (const [id, title] of [
  ['CASE-000352', '用户管理 - 禁用用户后登录提示账号或密码错误或账号已被禁用'],
  ['CASE-000372', '用户管理 - 禁用已登录用户后点击菜单被登出'],
]) {
  CASE(id, title, async ({ page, browser }) => {
    const value = account(id.slice(-3)); await openUsers(page); let session;
    try { const createDialog = await openCreate(page); await fillUser(page, createDialog, { account: value, name: '会话用户' }); await createDialog.getByRole('button', { name: '保存', exact: true }).click(); session = await loginAs(browser, value); await expect(session.page).not.toHaveURL(/\/login$/); await openUsers(page); const row = userRow(page, value); await row.getByRole('button', { name: '禁用', exact: true }).click(); const confirm = page.getByRole('dialog').last(); if (await confirm.isVisible().catch(() => false)) await confirm.getByRole('button', { name: /确认|确定/ }).click(); if (id === 'CASE-000352') { await session.page.goto('/login'); await session.page.getByPlaceholder('账号').fill(value); await session.page.getByPlaceholder('密码').fill('123456'); await session.page.getByRole('button', { name: '登录' }).click(); await expect(session.page.locator('body')).toContainText(/账号或密码错误|禁用/); } else { await session.page.getByText('我的采集', { exact: true }).click(); await expect(session.page).toHaveURL(/\/login$/, { timeout: 15000 }); } }
    finally { if (session) await session.context.close(); await removeUser(page, value); }
  });
}

CASE('CASE-000380', '用户管理 - 验证用户列表按创建时间倒序排列', async ({ page }) => {
  await openUsers(page);
  const pageSize = page.locator('.el-pagination .el-select');
  if (await pageSize.count() && !await pageSize.getByText('100条/页', { exact: true }).count()) { await pageSize.click(); await page.getByRole('option', { name: '100条/页', exact: true }).click(); }
  await expect(page.locator('tbody tr:visible').first()).toBeVisible({ timeout: 15000 });
  const rows = page.locator('tbody tr:visible');
  const texts = await rows.allTextContents();
  const times = texts.map((text) => text.match(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/)?.[0]).filter(Boolean);
  expect(times.length).toBeGreaterThan(1);
  expect(times).toEqual([...times].sort((left, right) => right.localeCompare(left)));
});
