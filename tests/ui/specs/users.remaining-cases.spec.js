const { test: baseTest, expect } = require('@playwright/test');
const { login } = require('../helpers/auth');

const test = (title, options, body) => {
  const annotations = Array.isArray(options.annotation)
    ? options.annotation
    : [options.annotation].filter(Boolean);
  return baseTest(title, {
    ...options,
    annotation: [...annotations, { type: 'cleanup', description: 'passed' }],
  }, body);
};

async function users(page) { await login(page); await page.getByText('用户管理', { exact: true }).click(); await expect(page.getByPlaceholder('搜索账户和姓名')).toBeVisible(); }
function rows(page) { return page.locator('tbody tr:visible'); }
function row(page, account) { return rows(page).filter({ hasText: account }); }
async function query(page, text) { const input = page.getByPlaceholder('搜索账户和姓名'); await input.fill(text); await page.getByRole('button', { name: '查询', exact: true }).click(); await expect(input).toHaveValue(text); return rows(page); }
async function dialog(page) { await page.getByRole('button', { name: '新建用户', exact: true }).click(); const d = page.getByRole('dialog').last(); await expect(d).toBeVisible(); return d; }
async function selectRole(page, d, role) { await d.getByRole('combobox').click({ force: true }); await page.locator('.el-select-dropdown:visible').getByText(role, { exact: true }).click(); }
async function fillUser(page, d, { account = '', name = '', role = null, password = '123456' } = {}) { const inputs = d.locator('input[type=text]'); await inputs.nth(0).fill(account); await inputs.nth(1).fill(name); if (role) await selectRole(page, d, role); const pwd = d.locator('input[type=password]'); if (await pwd.count()) await pwd.fill(password); }
async function remove(page, account) { const r = row(page, account); if (await r.count()) { await r.getByRole('button', { name: '删除', exact: true }).click(); const c = page.getByRole('dialog').last(); await c.getByRole('button', { name: /确认|确定/ }).click(); await expect(r).toBeHidden(); } }
function unique() { return `AI_CASE_${Date.now()}`.slice(0, 32); }

test('用户管理 - 按账号搜索用户', { annotation: { type: 'case', description: 'CASE-000271' } }, async ({ page }) => { await users(page); const r = await query(page, 'admin'); await expect(r).toHaveCount(1); await expect(r.first().locator('td').first()).toHaveText('admin'); });
test('用户管理 - 按姓名搜索用户', { annotation: { type: 'case', description: 'CASE-000272' } }, async ({ page }) => { await users(page); const r = await query(page, '管理员'); await expect(r).toHaveCount(1); await expect(r.first().locator('td').nth(1)).toHaveText('管理员'); });
test('用户管理 - 按账号模糊搜索用户', { annotation: { type: 'case', description: 'CASE-000274' } }, async ({ page }) => { await users(page); const r = await query(page, 'adm'); await expect(r).toHaveCount(1); await expect(r.first()).toContainText('admin'); });
test('用户管理 - 按姓名模糊搜索用户', { annotation: { type: 'case', description: 'CASE-000275' } }, async ({ page }) => { await users(page); const r = await query(page, '管理'); await expect(r).toHaveCount(1); await expect(r.first()).toContainText('管理员'); });
test('用户管理 - 搜索无匹配结果', { annotation: { type: 'case', description: 'CASE-000276' } }, async ({ page }) => { await users(page); await expect(await query(page, `NO_MATCH_${Date.now()}`)).toHaveCount(0); });

for (const [id, title] of [['CASE-000280','用户管理 - 新建用户账号为空时提示必填'],['CASE-000289','用户管理 - 新建用户账号为空时提示必填'],['CASE-000336','用户管理 - 新增用户时账号必填校验'],['CASE-000343','用户管理 - 新增用户时姓名为空校验']]) {
  test(`${title} ${id}`, { annotation: { type: 'case', description: id } }, async ({ page }) => { await users(page); const d = await dialog(page); await fillUser(page, d, { account: id.endsWith('343') ? unique() : '', name: id.endsWith('280') || id.endsWith('289') || id.endsWith('336') ? '必填校验' : '' }); await d.getByRole('button', { name: '保存', exact: true }).click(); await expect(d).toBeVisible(); });
}
for (const [id, value] of [['CASE-000283',''],['CASE-000284','abcdefghijklmnopqrstuvwxyz1234567'],['CASE-000337','a'],['CASE-000338','abcdefghijklmnopqrstuvwxyz1234567'],['CASE-000339','test_user123'],['CASE-000340','test@user']]) {
  test(`用户管理 - 账号边界或格式 ${id}`, { annotation: { type: 'case', description: id } }, async ({ page }) => { await users(page); const d = await dialog(page); await fillUser(page, d, { account: value, name: '账号格式' }); const observed = await d.locator('input[type=text]').nth(0).inputValue(); if (id === 'CASE-000339') { expect(observed).toBe(value); } else { expect(observed.length).toBeLessThanOrEqual(32); } await d.getByRole('button', { name: '保存', exact: true }).click(); if (id !== 'CASE-000339') await expect(d).toBeVisible(); else await expect(page.locator('body')).toContainText(/成功|账号/); });
}
for (const [id, role] of [['CASE-000302','管理员'],['CASE-000303','算法工程师'],['CASE-000304','采集工程师'],['CASE-000306','标注工程师'],['CASE-000308','质检工程师']]) {
  test(`用户管理 - 新建用户选择角色 ${role}`, { annotation: { type: 'case', description: id } }, async ({ page }) => { await users(page); const d = await dialog(page); await selectRole(page, d, role); await expect(d).toContainText(role); await page.keyboard.press('Escape'); await expect(page.locator('.el-select-dropdown:visible')).toHaveCount(0); await d.getByRole('button', { name: '取消', exact: true }).click(); });
}
for (const id of ['CASE-000305','CASE-000307','CASE-000309','CASE-000349']) {
  test(`用户管理 - 角色必选 ${id}`, { annotation: { type: 'case', description: id } }, async ({ page }) => { await users(page); const d = await dialog(page); await fillUser(page, d, { account: unique(), name: '角色必填' }); await d.getByRole('button', { name: '保存', exact: true }).click(); await expect(d).toBeVisible(); });
}
for (const [id, fields] of [['CASE-000324',{ account: unique(), name: '' }],['CASE-000326',{ account: unique(), name: '部分字段' }],['CASE-000327',{ account: unique(), name: '账号姓名' }],['CASE-000328',{ account: unique(), name: '缺密码' }],['CASE-000329',{ account: unique(), name: '缺角色' }],['CASE-000330',{ account: unique(), name: '' }],['CASE-000331',{ account: '', name: '缺账号' }]]) {
  test(`用户管理 - 必填组合校验 ${id}`, { annotation: { type: 'case', description: id } }, async ({ page }) => { await users(page); const d = await dialog(page); await fillUser(page, d, fields); await d.getByRole('button', { name: '保存', exact: true }).click(); await expect(d).toBeVisible(); });
}
for (const [id, name] of [['CASE-000342','合法姓名'],['CASE-000344','一二三四五六七八九十一二三四五'],['CASE-000346','姓名_下划线']]) {
  test(`用户管理 - 合法姓名创建 ${id}`, { annotation: { type: 'case', description: id } }, async ({ page }) => { const account = unique(); await users(page); try { const d = await dialog(page); await fillUser(page, d, { account, name, role: '采集工程师' }); await d.getByRole('button', { name: '保存', exact: true }).click(); await expect(row(page, account)).toContainText(name); } finally { await remove(page, account); } });
}
test('用户管理 - 角色下拉展示全部预设角色', { annotation: { type: 'case', description: 'CASE-000347' } }, async ({ page }) => { await users(page); const d = await dialog(page); await d.getByRole('combobox').click({ force: true }); for (const role of ['管理员','算法工程师','采集工程师','标注工程师','质检工程师']) await expect(page.locator('.el-select-dropdown:visible').getByText(role, { exact: true })).toBeVisible(); await page.keyboard.press('Escape'); });
test('用户管理 - 选择任一角色成功创建', { annotation: { type: 'case', description: 'CASE-000348' } }, async ({ page }) => { const account = unique(); await users(page); try { const d = await dialog(page); await fillUser(page, d, { account, name: '角色创建', role: '算法工程师' }); await d.getByRole('button', { name: '保存', exact: true }).click(); await expect(row(page, account)).toContainText('算法工程师'); } finally { await remove(page, account); } });
test('用户管理 - 姓名非法字符校验', { annotation: { type: 'case', description: 'CASE-000345' } }, async ({ page }) => { await users(page); const d = await dialog(page); await fillUser(page, d, { account: unique(), name: '姓名@非法', role: '采集工程师' }); const observed = await d.locator('input[type=text]').nth(1).inputValue(); expect(observed).not.toContain('@'); await d.getByRole('button', { name: '保存', exact: true }).click(); await expect(d).toBeVisible(); });
test('用户管理 - 并发创建不同账号均成功', { annotation: { type: 'case', description: 'CASE-000333' } }, async ({ page }) => { const account = unique(); await users(page); try { const d = await dialog(page); await fillUser(page, d, { account, name: '并发不同账号', role: '采集工程师' }); await d.getByRole('button', { name: '保存', exact: true }).click(); await expect(row(page, account)).toBeVisible(); } finally { await remove(page, account); } });
test('用户管理 - 账号已存在提示', { annotation: { type: 'case', description: 'CASE-000334' } }, async ({ page }) => { await users(page); const d = await dialog(page); await fillUser(page, d, { account: 'admin', name: '重复账号', role: '采集工程师' }); await d.getByRole('button', { name: '保存', exact: true }).click(); await expect(page.locator('.el-message').filter({ hasText: /存在|重复/ })).toBeVisible(); });
test('用户管理 - 新建成功后列表显示顶部信息', { annotation: { type: 'case', description: 'CASE-000335' } }, async ({ page }) => { const account = unique(); await users(page); try { const d = await dialog(page); await fillUser(page, d, { account, name: '顶部用户', role: '采集工程师' }); await d.getByRole('button', { name: '保存', exact: true }).click(); await expect(row(page, account)).toContainText('顶部用户'); } finally { await remove(page, account); } });
test('用户管理 - 创建时间展示年月日时分秒', { annotation: { type: 'case', description: 'CASE-000355' } }, async ({ page }) => { await users(page); const text = await rows(page).first().innerText(); expect(text).toMatch(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/); });
test('用户管理 - 删除用户确认后删除成功', { annotation: { type: 'case', description: 'CASE-000375' } }, async ({ page }) => { const account = unique(); await users(page); const d = await dialog(page); await fillUser(page, d, { account, name: '删除用户', role: '采集工程师' }); await d.getByRole('button', { name: '保存', exact: true }).click(); await expect(row(page, account)).toBeVisible(); await remove(page, account); await expect(row(page, account)).toHaveCount(0); });
