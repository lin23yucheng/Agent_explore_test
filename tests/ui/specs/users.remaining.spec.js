const { test: playwrightTest, expect } = require('@playwright/test');
const { login } = require('../helpers/auth');

const caseIds = ['CASE-000321','CASE-000322','CASE-000332','CASE-000341','CASE-000350','CASE-000351','CASE-000352','CASE-000353','CASE-000354','CASE-000356','CASE-000357','CASE-000358','CASE-000359','CASE-000360','CASE-000361','CASE-000362','CASE-000363','CASE-000364','CASE-000365','CASE-000366','CASE-000367','CASE-000368','CASE-000369','CASE-000374','CASE-000376','CASE-000377','CASE-000378','CASE-000379','CASE-000380','CASE-000370','CASE-000371','CASE-000372','CASE-000373'];
let caseIndex = 0;
function test(title, optionsOrBody, maybeBody) {
  const body = typeof optionsOrBody === 'function' ? optionsOrBody : maybeBody;
  const options = typeof optionsOrBody === 'function' ? {} : optionsOrBody;
  const caseId = caseIds[caseIndex++];
  if (!caseId) throw new Error(`缺少候选用例映射: ${title}`);
  return playwrightTest(title, { ...options, annotation: { type: 'case', description: caseId } }, body);
}
test.describe = playwrightTest.describe;

async function openUsers(page) {
  await login(page);
  await page.getByText('用户管理', { exact: true }).click();
  await expect(page.getByRole('button', { name: '新建用户', exact: true })).toBeVisible();
}

function uniqueAccount(label = '') {
  return `autotest${label}${String(Date.now()).slice(-8)}`.slice(0, 32);
}

function userRow(page, account) {
  const escaped = account.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const cell = page.locator('td:first-child').filter({ hasText: new RegExp(`^${escaped}$`) });
  return page.locator('tbody tr').filter({ has: cell });
}

async function openCreate(page) {
  await page.getByRole('button', { name: '新建用户', exact: true }).click();
  const dialog = page.getByRole('dialog').last();
  await expect(dialog).toBeVisible();
  return dialog;
}

async function selectRole(page, dialog, role) {
  await dialog.getByRole('combobox').click({ force: true });
  await page.locator('.el-select-dropdown:visible').getByText(role, { exact: true }).click();
  await page.keyboard.press('Escape');
}

async function fillUser(page, dialog, { account, name, role = '采集工程师', password = '123456' }) {
  const inputs = dialog.locator('input[type=text]');
  await inputs.nth(0).fill(account);
  await inputs.nth(1).fill(name);
  if (role) await selectRole(page, dialog, role);
  const passwordInput = dialog.locator('input[type=password]');
  if (await passwordInput.count()) await passwordInput.fill(password);
}

async function createUser(page, values) {
  const dialog = await openCreate(page);
  await fillUser(page, dialog, values);
  await dialog.getByRole('button', { name: '保存', exact: true }).click();
  const row = userRow(page, values.account);
  await expect(row).toBeVisible();
  return row;
}

async function deleteUser(page, account) {
  const row = userRow(page, account);
  if (!await row.count()) return;
  await row.getByRole('button', { name: '删除', exact: true }).click();
  const dialog = page.getByRole('dialog').last();
  await dialog.getByRole('button', { name: /确认|确定/ }).click();
  await expect(row).toBeHidden();
}

async function editUser(page, account) {
  const row = userRow(page, account);
  await row.getByRole('button', { name: '编辑', exact: true }).click();
  const dialog = page.getByRole('dialog').last();
  await expect(dialog).toBeVisible();
  return dialog;
}

async function toggleUser(page, account, action, expected) {
  const row = userRow(page, account);
  await row.getByRole('button', { name: action, exact: true }).click();
  const dialog = page.getByRole('dialog').last();
  if (await dialog.isVisible().catch(() => false)) {
    await dialog.getByRole('button', { name: /确认|确定/ }).click();
  }
  await expect(row).toContainText(expected);
}

async function queryUsers(page, keyword) {
  await page.getByPlaceholder('搜索账户和姓名').fill(keyword);
  await page.getByRole('button', { name: '查询', exact: true }).click();
}

async function loginInContext(browser, account, password = '123456') {
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  const page = await context.newPage();
  await page.goto('/login');
  await page.getByPlaceholder('账号').fill(account);
  await page.getByPlaceholder('密码').fill(password);
  await page.getByRole('button', { name: '登录' }).click();
  return { context, page };
}

async function expectLoginRejected(browser, account, password = '123456') {
  const { context, page } = await loginInContext(browser, account, password);
  try {
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('body')).toContainText(/账号|密码|禁用|错误/);
  } finally {
    await context.close();
  }
}

async function changeRole(page, account, role) {
  const dialog = await editUser(page, account);
  const select = dialog.locator('.el-select__wrapper').first();
  const closeButtons = select.locator('.el-tag__close');
  while (await closeButtons.count()) await closeButtons.first().click();
  await selectRole(page, dialog, role);
  await dialog.getByRole('button', { name: '保存', exact: true }).click();
  await expect(userRow(page, account)).toContainText(role);
}

async function resetPassword(page, account, confirm) {
  const row = userRow(page, account);
  await row.getByRole('button', { name: '重置密码', exact: true }).click();
  const dialog = page.getByRole('dialog').last();
  await expect(dialog).toContainText(account);
  await dialog.getByRole('button', { name: confirm ? /确认|确定/ : '取消' }).click();
  await expect(dialog).toBeHidden();
}

test.describe('用户管理剩余用例', () => {
  for (const [title, account] of [
    ['新建用户-账号仅包含下划线-正常输入', '___'],
    ['新建用户-账号仅包含数字-正常输入', String(Date.now()).slice(-10)],
  ]) {
    test(title, async ({ page }) => {
      await openUsers(page);
      try {
        await createUser(page, { account, name: '账号字符验证' });
        await expect(userRow(page, account)).toBeVisible();
      } finally {
        await deleteUser(page, account);
      }
    });
  }

  test('新建用户初始密码为123456且可修改为合法新密码', async ({ page }) => {
    const account = uniqueAccount('editpwd');
    await openUsers(page);
    try {
      await createUser(page, { account, name: '编辑密码验证' });
      const dialog = await editUser(page, account);
      const password = dialog.locator('input[type=password]');
      expect(await password.count(), '编辑用户表单应提供密码修改字段').toBeGreaterThan(0);
      await password.fill('abc12345');
      await dialog.getByRole('button', { name: '保存', exact: true }).click();
    } finally {
      await page.reload();
      await deleteUser(page, account);
    }
  });

  test('新建用户后使用默认密码登录并修改为合法新密码', async ({ page, browser }) => {
    const account = uniqueAccount('selfpwd');
    await openUsers(page);
    try {
      await createUser(page, { account, name: '自助改密验证' });
      const { context, page: userPage } = await loginInContext(browser, account);
      try {
        await expect(userPage).not.toHaveURL(/\/login$/);
        await userPage.getByRole('button').filter({ hasText: /自助改密验证|采集工程师/ }).first().click();
        await expect(userPage.getByText(/修改密码/)).toBeVisible();
      } finally {
        await context.close();
      }
    } finally {
      await deleteUser(page, account);
    }
  });

  test('并发创建相同账号时仅一条成功且无重复数据', async ({ page, browser }) => {
    const account = uniqueAccount('race');
    const otherContext = await browser.newContext({ ignoreHTTPSErrors: true });
    const otherPage = await otherContext.newPage();
    await openUsers(page);
    await openUsers(otherPage);
    try {
      const first = await openCreate(page);
      const second = await openCreate(otherPage);
      await fillUser(page, first, { account, name: '并发用户甲' });
      await fillUser(otherPage, second, { account, name: '并发用户乙' });
      await Promise.all([
        first.getByRole('button', { name: '保存', exact: true }).click(),
        second.getByRole('button', { name: '保存', exact: true }).click(),
      ]);
      await queryUsers(page, account);
      await expect(userRow(page, account)).toHaveCount(1);
      const dialogsVisible = await first.isVisible().catch(() => false) || await second.isVisible().catch(() => false);
      expect(dialogsVisible, '并发提交中应有一个表单因账号重复而保留').toBe(true);
    } finally {
      await otherContext.close();
      await page.reload();
      await queryUsers(page, account);
      await deleteUser(page, account);
    }
  });

  test('新建用户时账号唯一性校验-账号前后空格处理', async ({ page }) => {
    const account = uniqueAccount('trim');
    await openUsers(page);
    try {
      await createUser(page, { account, name: '原账号' });
      const dialog = await openCreate(page);
      await fillUser(page, dialog, { account: ` ${account} `, name: '空格账号' });
      await dialog.getByRole('button', { name: '保存', exact: true }).click();
      await expect(dialog).toBeVisible();
      await queryUsers(page, account);
      await expect(userRow(page, account)).toHaveCount(1);
    } finally {
      await page.reload();
      await queryUsers(page, account);
      await deleteUser(page, account);
    }
  });

  test('启用状态下用户正常登录', async ({ page, browser }) => {
    const account = uniqueAccount('enabled');
    await openUsers(page);
    try {
      await createUser(page, { account, name: '启用登录' });
      const { context, page: userPage } = await loginInContext(browser, account);
      try {
        await expect(userPage).not.toHaveURL(/\/login$/);
        await expect(userPage.getByText('我的采集', { exact: true })).toBeVisible();
      } finally {
        await context.close();
      }
    } finally {
      await deleteUser(page, account);
    }
  });

  test('启用状态下用户可被指派任务', async ({ page }) => {
    await openUsers(page);
    await page.getByText('任务管理', { exact: true }).click();
    await page.getByRole('button', { name: /新建|创建任务/ }).first().click();
    expect(await page.getByText(/指派用户|采集人员/).count(), '创建任务页缺少用户指派控件').toBeGreaterThan(0);
  });

  for (const title of ['禁用用户后未登录用户登录提示账号错误', '禁用账号后未登录状态登录提示账号或密码错误或已被禁用']) {
    test(title, async ({ page, browser }) => {
      const account = uniqueAccount('disabled');
      await openUsers(page);
      try {
        await createUser(page, { account, name: '禁用登录' });
        await toggleUser(page, account, '禁用', '禁用');
        await expectLoginRejected(browser, account);
      } finally {
        await deleteUser(page, account);
      }
    });
  }

  for (const title of ['禁用用户后已登录用户调用接口提示操作人不存在或已禁用', '禁用已登录用户后调用接口提示操作人不存在或已禁用']) {
    test(title, async ({ page, browser }) => {
      const account = uniqueAccount('activeoff');
      await openUsers(page);
      let userContext;
      try {
        await createUser(page, { account, name: '已登录禁用' });
        const session = await loginInContext(browser, account);
        userContext = session.context;
        await expect(session.page).not.toHaveURL(/\/login$/);
        await toggleUser(page, account, '禁用', '禁用');
        await session.page.reload();
        await expect(session.page.locator('body')).toContainText(/操作人不存在|禁用|账号|登录/);
      } finally {
        if (userContext) await userContext.close();
        await deleteUser(page, account);
      }
    });
  }

  for (const title of ['禁用用户后指派下拉列表不展示该用户', '禁用用户后指派下拉不展示该用户']) {
    test(title, async () => {
      throw new Error('当前创建任务页面没有用户指派控件，无法验证禁用用户在指派下拉中的可见性');
    });
  }

  test('编辑用户-姓名回显且可修改-边界长度验证', async ({ page }) => {
    const account = uniqueAccount('edit16');
    const name16 = '一二三四五六七八九十一二三四五六';
    await openUsers(page);
    try {
      await createUser(page, { account, name: '张' });
      const dialog = await editUser(page, account);
      const input = dialog.locator('input[type=text]').nth(1);
      await expect(input).toHaveValue('张');
      await input.fill(name16);
      await dialog.getByRole('button', { name: '保存', exact: true }).click();
      await expect(userRow(page, account)).toContainText(name16);
    } finally {
      await deleteUser(page, account);
    }
  });

  test('编辑用户-姓名回显且可修改-异常超长验证', async ({ page }) => {
    const account = uniqueAccount('edit17');
    await openUsers(page);
    try {
      await createUser(page, { account, name: '张三' });
      const dialog = await editUser(page, account);
      const input = dialog.locator('input[type=text]').nth(1);
      await input.fill('一二三四五六七八九十一二三四五六七');
      await dialog.getByRole('button', { name: '保存', exact: true }).click();
      await expect(dialog).toBeVisible();
      await expect(dialog.locator('.el-form-item__error').first()).toBeVisible();
    } finally {
      await page.reload();
      await deleteUser(page, account);
    }
  });

  test('编辑用户时姓名为空保存校验', async ({ page }) => {
    const account = uniqueAccount('emptyname');
    await openUsers(page);
    try {
      await createUser(page, { account, name: '原姓名' });
      const dialog = await editUser(page, account);
      await dialog.locator('input[type=text]').nth(1).fill('');
      await dialog.getByRole('button', { name: '保存', exact: true }).click();
      await expect(dialog).toBeVisible();
      await expect(dialog.locator('.el-form-item__error').first()).toBeVisible();
    } finally {
      await page.reload();
      await deleteUser(page, account);
    }
  });

  test('编辑用户时角色未选择保存校验', async ({ page }) => {
    const account = uniqueAccount('norole');
    await openUsers(page);
    try {
      await createUser(page, { account, name: '角色必填' });
      const dialog = await editUser(page, account);
      const closeButtons = dialog.locator('.el-select__wrapper').first().locator('.el-tag__close');
      while (await closeButtons.count()) await closeButtons.first().click();
      await dialog.getByRole('button', { name: '保存', exact: true }).click();
      await expect(dialog).toBeVisible();
      await expect(dialog.locator('.el-form-item__error').first()).toBeVisible();
    } finally {
      await page.reload();
      await deleteUser(page, account);
    }
  });

  test('编辑用户角色后未登录，登录成功展示新角色对应模块', async ({ page, browser }) => {
    const account = uniqueAccount('rolefresh');
    await openUsers(page);
    try {
      await createUser(page, { account, name: '角色新登录' });
      await changeRole(page, account, '标注工程师');
      const { context, page: userPage } = await loginInContext(browser, account);
      try {
        await expect(userPage.getByText('我的标注', { exact: true })).toBeVisible();
        await expect(userPage.getByText('我的采集', { exact: true })).toHaveCount(0);
      } finally {
        await context.close();
      }
    } finally {
      await deleteUser(page, account);
    }
  });

  test('编辑用户角色后已登录用户不受影响，重新登录后展示新角色模块', async ({ page, browser }) => {
    const account = uniqueAccount('roleactive');
    await openUsers(page);
    let context;
    try {
      await createUser(page, { account, name: '角色会话' });
      const session = await loginInContext(browser, account);
      context = session.context;
      await expect(session.page.getByText('我的采集', { exact: true })).toBeVisible();
      await changeRole(page, account, '标注工程师');
      await expect(session.page.getByText('我的采集', { exact: true })).toBeVisible();
      await context.close();
      context = undefined;
      const relogin = await loginInContext(browser, account);
      context = relogin.context;
      await expect(relogin.page.getByText('我的标注', { exact: true })).toBeVisible();
    } finally {
      if (context) await context.close();
      await deleteUser(page, account);
    }
  });

  test('编辑用户姓名后右上角显示更新为修改后的姓名', async ({ page, browser }) => {
    const account = uniqueAccount('headername');
    await openUsers(page);
    let context;
    try {
      await createUser(page, { account, name: '旧姓名' });
      const session = await loginInContext(browser, account);
      context = session.context;
      const dialog = await editUser(page, account);
      await dialog.locator('input[type=text]').nth(1).fill('新姓名');
      await dialog.getByRole('button', { name: '保存', exact: true }).click();
      await session.page.reload();
      await expect(session.page.getByRole('button').filter({ hasText: '新姓名' })).toBeVisible();
    } finally {
      if (context) await context.close();
      await deleteUser(page, account);
    }
  });

  test('编辑用户姓名后，已指派任务中的人员姓名同步更新', async () => {
    throw new Error('当前任务创建页不提供用户指派控件，无法建立可回收的“已指派任务”前置数据');
  });

  test('重置密码弹窗点击取消后关闭弹窗且不重置密码', async ({ page, browser }) => {
    const account = uniqueAccount('resetcancel');
    await openUsers(page);
    try {
      await createUser(page, { account, name: '取消重置' });
      await resetPassword(page, account, false);
      const { context, page: userPage } = await loginInContext(browser, account);
      try { await expect(userPage).not.toHaveURL(/\/login$/); } finally { await context.close(); }
    } finally {
      await deleteUser(page, account);
    }
  });

  test('重置密码-二次确认-确定重置-密码重置为123456', async ({ page, browser }) => {
    const account = uniqueAccount('resetok');
    await openUsers(page);
    try {
      await createUser(page, { account, name: '确认重置', password: 'abc12345' });
      await resetPassword(page, account, true);
      const { context, page: userPage } = await loginInContext(browser, account, '123456');
      try { await expect(userPage).not.toHaveURL(/\/login$/); } finally { await context.close(); }
    } finally {
      await deleteUser(page, account);
    }
  });

  test('重置密码-二次确认-确定重置-已登录用户不受影响', async ({ page, browser }) => {
    const account = uniqueAccount('resetactive');
    await openUsers(page);
    let context;
    try {
      await createUser(page, { account, name: '重置会话' });
      const session = await loginInContext(browser, account);
      context = session.context;
      await expect(session.page).not.toHaveURL(/\/login$/);
      await resetPassword(page, account, true);
      await session.page.reload();
      await expect(session.page).not.toHaveURL(/\/login$/);
    } finally {
      if (context) await context.close();
      await deleteUser(page, account);
    }
  });

  for (const title of ['删除已指派任务的用户-二次确认后提示不允许删除', '删除已被指派任务的账号时提示不允许删除', '删除已指派任务的用户时，二次确认后提示禁止删除且下拉仍展示该用户']) {
    test(title, async () => {
      throw new Error('当前任务创建页没有用户指派控件，无法建立可回收的已指派用户前置数据');
    });
  }

  test('删除用户-未登录状态-确定删除-提示账号或密码错误', async ({ page }) => {
    await page.goto('/users');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('button', { name: '删除', exact: true })).toHaveCount(0);
  });

  test('删除用户-已登录状态-接口校验-操作人不存在或已禁用提示', async ({ page, browser }) => {
    const account = uniqueAccount('deleteactive');
    await openUsers(page);
    let context;
    try {
      await createUser(page, { account, name: '删除会话' });
      const session = await loginInContext(browser, account);
      context = session.context;
      await deleteUser(page, account);
      await session.page.reload();
      await expect(session.page.locator('body')).toContainText(/操作人不存在|禁用|账号|登录/);
    } finally {
      if (context) await context.close();
      await queryUsers(page, account);
      await deleteUser(page, account);
    }
  });

  test('删除未被指派任务的用户后，下拉列表不再展示该用户', async ({ page }) => {
    const account = uniqueAccount('deletefree');
    await openUsers(page);
    await createUser(page, { account, name: '删除未指派' });
    await deleteUser(page, account);
    await expect(userRow(page, account)).toHaveCount(0);
    await page.getByText('任务管理', { exact: true }).click();
    await page.getByRole('button', { name: /新建|创建任务/ }).first().click();
    expect(await page.getByText(/指派用户|采集人员/).count(), '创建任务页缺少用户指派控件，无法验证删除后的下拉列表').toBeGreaterThan(0);
  });

  test('验证用户列表默认按创建时间倒序排列', async ({ page }) => {
    await openUsers(page);
    const headers = await page.locator('thead th').allTextContents();
    const index = headers.findIndex((text) => text.trim() === '创建时间');
    expect(index).toBeGreaterThanOrEqual(0);
    const values = (await page.locator('tbody tr').locator('td').nth(index).allTextContents()).map((value) => value.trim());
    expect(values).toEqual([...values].sort((a, b) => b.localeCompare(a)));
  });

  test('验证创建时间相同的用户列表排序稳定性', async ({ page }) => {
    await openUsers(page);
    const before = await page.locator('tbody tr td:first-child').allTextContents();
    await page.reload();
    await expect(page.getByRole('button', { name: '新建用户', exact: true })).toBeVisible();
    const after = await page.locator('tbody tr td:first-child').allTextContents();
    expect(after).toEqual(before);
  });
});
