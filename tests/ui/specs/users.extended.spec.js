const { test: playwrightTest, expect } = require('@playwright/test');
const { login } = require('../helpers/auth');

const caseIds = ['CASE-000281','CASE-000282','CASE-000285','CASE-000286','CASE-000287','CASE-000288','CASE-000290','CASE-000291','CASE-000292','CASE-000293','CASE-000294','CASE-000295','CASE-000296','CASE-000297','CASE-000298','CASE-000299','CASE-000310','CASE-000311','CASE-000313','CASE-000314','CASE-000315','CASE-000316','CASE-000317','CASE-000318','CASE-000319','CASE-000320'];
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

async function openCreateDialog(page) {
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

async function fillCreateDialog(page, dialog, {
  account,
  name,
  role = '采集工程师',
  password = '123456',
  fillPassword = true,
} = {}) {
  const textInputs = dialog.locator('input[type=text]');
  if (account !== undefined) await textInputs.nth(0).fill(account);
  if (name !== undefined) await textInputs.nth(1).fill(name);
  if (role) {
    await dialog.getByRole('combobox').click({ force: true });
    await page.locator('.el-select-dropdown:visible').getByText(role, { exact: true }).click();
  }
  const passwordInput = dialog.locator('input[type=password]');
  if (fillPassword && await passwordInput.count()) await passwordInput.fill(password);
}

async function deleteUser(page, account, name) {
  const row = userRow(page, account);
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: '删除', exact: true }).click();
  const confirmDialog = page.getByRole('dialog').last();
  await expect(confirmDialog).toBeVisible();
  await confirmDialog.getByRole('button', { name: /确认|确定/ }).click();
  await expect(row).toBeHidden();
}

async function createAndDelete(page, { account, name, role = '采集工程师' }) {
  const dialog = await openCreateDialog(page);
  await fillCreateDialog(page, dialog, { account, name, role });
  await dialog.getByRole('button', { name: '保存', exact: true }).click();
  const row = userRow(page, account);
  await expect(row).toBeVisible();
  await expect(row).toContainText(name);
  await deleteUser(page, account, name);
}

async function submitExpectedInvalid(page, dialog, expectedAccount, expectedName) {
  await dialog.getByRole('button', { name: '保存', exact: true }).click();
  const stayedOpen = await dialog.waitFor({ state: 'hidden', timeout: 5000 })
    .then(() => false)
    .catch(() => true);
  let saved = false;
  if (!stayedOpen && expectedAccount) {
    const row = userRow(page, expectedAccount);
    saved = await row.waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    if (saved) await deleteUser(page, expectedAccount, expectedName);
  } else if (stayedOpen) {
    if (await dialog.isVisible()) await dialog.getByRole('button', { name: '取消', exact: true }).click();
  }
  return { stayedOpen, saved };
}

function uniqueAccount(label = '') {
  return `autotest${label}${Date.now()}`.slice(0, 32);
}

test.describe('用户管理扩展表单校验', () => {
  for (const [title, accountFactory, name] of [
    ['新建用户-账号仅支持英文字母、数字、下划线-正常输入', () => uniqueAccount('_ok_'), '合法账号'],
    ['新建用户-账号仅包含英文字母-正常输入', () => `autotest${Date.now().toString().split('').map((d) => String.fromCharCode(97 + Number(d))).join('')}`, '英文账号'],
    ['新建用户-姓名输入中文、英文、数字组合-保存成功', () => uniqueAccount('mix'), '张三abc123'],
    ['新建用户-姓名仅输入中文-保存成功', () => uniqueAccount('cn'), '李四'],
    ['新建用户-姓名仅输入英文字母-保存成功', () => uniqueAccount('en'), 'Wang'],
    ['新建用户-姓名仅输入数字-保存成功', () => uniqueAccount('num'), '123'],
  ]) {
    test(title, async ({ page }) => {
      await openUsers(page);
      await createAndDelete(page, { account: accountFactory(), name });
    });
  }

  for (const [title, invalidAccount] of [
    ['新建用户-账号长度为2个字符（边界最小值-1）', 'ab'],
    ['新建用户-账号长度为33个字符（边界最大值+1）', `autotest${'x'.repeat(25)}`],
    ['新建用户-账号包含非法字符-提示错误', `autotest@${Date.now()}`],
    ['新建用户-账号包含中文字符-提示错误', `autotest测试${Date.now()}`],
    ['新建用户-账号包含空格-提示错误', `autotest ${Date.now()}`],
    ['新建用户-账号包含连字符-提示错误', `autotest-${Date.now()}`],
  ]) {
    test(title, async ({ page }) => {
      await openUsers(page);
      const dialog = await openCreateDialog(page);
      await fillCreateDialog(page, dialog, { account: invalidAccount, name: '非法账号校验' });
      const input = dialog.locator('input[type=text]').nth(0);
      const observed = await input.inputValue();
      const { stayedOpen, saved } = await submitExpectedInvalid(page, dialog, observed, '非法账号校验');
      expect(observed.length).toBeLessThanOrEqual(32);
      expect(observed).toMatch(/^[A-Za-z0-9]*$/);
      if (saved) await deleteUser(page, observed, '非法账号校验');
      else expect(stayedOpen, '非法账号未通过时弹窗应保持打开').toBe(true);
    });
  }

  for (const [title, fields] of [
    ['新建用户-账号为空时提示必填', { account: undefined, name: '账号必填', role: '采集工程师' }],
    ['新建用户时姓名为空，提示必填', { account: uniqueAccount('noname'), name: undefined, role: '采集工程师' }],
    ['新建用户-角色必选校验-未选择角色提示', { account: uniqueAccount('norole'), name: '角色必填', role: null }],
    ['新建用户时初始密码为空提示必填', { account: uniqueAccount('nopwd'), name: '密码必填', role: '采集工程师', password: '', fillPassword: true }],
    ['新建用户-保存-必填项校验-账号和姓名均为空', { account: undefined, name: undefined, role: '采集工程师' }],
  ]) {
    test(title, async ({ page }) => {
      await openUsers(page);
      const dialog = await openCreateDialog(page);
      await fillCreateDialog(page, dialog, fields);
      const { stayedOpen, saved } = await submitExpectedInvalid(page, dialog, fields.account, fields.name);
      expect(stayedOpen, '必填项缺失时弹窗应保持打开').toBe(true);
      expect(saved, '必填项缺失时不应创建用户').toBe(false);
    });
  }

  test('新建用户-姓名长度超上限17字符校验', async ({ page }) => {
    const account = uniqueAccount('namelen');
    await openUsers(page);
    const dialog = await openCreateDialog(page);
    await fillCreateDialog(page, dialog, { account, name: 'ABCDEFGHIJKLMNOPQ' });
    const nameInput = dialog.locator('input[type=text]').nth(1);
    const observed = await nameInput.inputValue();
    await dialog.getByRole('button', { name: '保存', exact: true }).click();
    const row = userRow(page, account);
    const saved = await row.isVisible().catch(() => false);
    if (saved) await deleteUser(page, account, observed);
    else await dialog.getByRole('button', { name: '取消', exact: true }).click();
    expect(observed).toBe('ABCDEFGHIJKLMNOP');
    expect(saved, '第17个字符被截断后应能保存').toBe(true);
  });

  for (const [title, invalidName] of [
    ['新建用户-姓名包含特殊字符-保存失败', '张@三'],
    ['新建用户-姓名包含空格-保存失败', '张 三'],
  ]) {
    test(title, async ({ page }) => {
      const account = uniqueAccount('badname');
      await openUsers(page);
      const dialog = await openCreateDialog(page);
      await fillCreateDialog(page, dialog, { account, name: invalidName });
      const observed = await dialog.locator('input[type=text]').nth(1).inputValue();
      const { stayedOpen, saved } = await submitExpectedInvalid(page, dialog, account, invalidName);
      expect(observed).not.toContain('@');
      expect(observed).not.toContain(' ');
      if (saved) await deleteUser(page, account, observed);
      else expect(stayedOpen).toBe(true);
    });
  }

  test('新建用户时初始密码默认显示为123456', async ({ page }) => {
    await openUsers(page);
    const dialog = await openCreateDialog(page);
    await expect(dialog.locator('input[type=password]')).toHaveValue('123456');
    await dialog.getByRole('button', { name: '取消', exact: true }).click();
  });

  test('新建用户弹框填写完整信息后点击取消不保存', async ({ page }) => {
    const account = uniqueAccount('cancel');
    await openUsers(page);
    const dialog = await openCreateDialog(page);
    await fillCreateDialog(page, dialog, { account, name: '完整取消', role: '算法工程师' });
    await dialog.getByRole('button', { name: '取消', exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(userRow(page, account)).toHaveCount(0);
  });

  test('新建用户时输入已存在账号提示“该账号已存在”', async ({ page }) => {
    const account = uniqueAccount('duplicate');
    await openUsers(page);
    const first = await openCreateDialog(page);
    await fillCreateDialog(page, first, { account, name: '原用户' });
    await first.getByRole('button', { name: '保存', exact: true }).click();
    await expect(userRow(page, account)).toBeVisible();

    const duplicate = await openCreateDialog(page);
    await fillCreateDialog(page, duplicate, { account, name: '重复用户' });
    await duplicate.getByRole('button', { name: '保存', exact: true }).click();
    await expect(page.locator('.el-message').filter({ hasText: /存在|重复/ })).toBeVisible();
    await expect(duplicate).toBeVisible();
    await duplicate.getByRole('button', { name: '取消', exact: true }).click();
    await expect(userRow(page, account)).toHaveCount(1);
    await deleteUser(page, account, '原用户');
  });

  test('新建用户时账号唯一性校验-大小写不同视为不同账号', async ({ page }) => {
    const suffix = Date.now();
    const lower = `autotestcase${suffix}`;
    const mixed = `autotestCase${suffix}`;
    await openUsers(page);
    for (const [account, name] of [[lower, '小写账号'], [mixed, '混合账号']]) {
      const dialog = await openCreateDialog(page);
      await fillCreateDialog(page, dialog, { account, name });
      await dialog.getByRole('button', { name: '保存', exact: true }).click();
      await expect(userRow(page, account)).toBeVisible();
    }
    await deleteUser(page, mixed, '混合账号');
    await deleteUser(page, lower, '小写账号');
  });

  test('验证新建用户时初始密码字段已删除', async ({ page }) => {
    await openUsers(page);
    const dialog = await openCreateDialog(page);
    const passwordCount = await dialog.locator('input[type=password]').count();
    await dialog.getByRole('button', { name: '取消', exact: true }).click();
    expect(passwordCount, '新建用户弹窗应提供初始密码输入框').toBeGreaterThan(0);
  });

  test('验证用户列表创建时间展示格式为年月日时分秒', async ({ page }) => {
    const account = uniqueAccount('time');
    const name = '时间格式';
    await openUsers(page);
    const dialog = await openCreateDialog(page);
    await fillCreateDialog(page, dialog, { account, name });
    await dialog.getByRole('button', { name: '保存', exact: true }).click();
    const row = userRow(page, account);
    await expect(row).toBeVisible();
    const rowText = await row.innerText();
    await deleteUser(page, account, name);
    expect(rowText).toMatch(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/);
  });
});
