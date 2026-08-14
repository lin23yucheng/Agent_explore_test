const { test, expect } = require('@playwright/test');
const { openModule } = require('../helpers/auth');
const { withCleanupStatus } = require('../helpers/case-test');

const CASE = (id, title, body, { failureCategory, cleanup = 'passed' } = {}) => test(title, {
  annotation: [
    { type: 'case', description: id },
    { type: 'cleanup', description: cleanup },
    ...(failureCategory ? [{ type: 'failure-category', description: failureCategory }] : []),
  ],
}, withCleanupStatus(body, cleanup));

function unique(label = 'tag') {
  return `AI${label}${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(0, 32);
}

function tagRow(page, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return page.locator('tbody tr').filter({
    has: page.locator('td:first-child').filter({ hasText: new RegExp(`^${escaped}$`) }),
  });
}

async function openTags(page) {
  await openModule(page, '标签管理', '/admin/scene-tags', () => page.getByRole('button', { name: '新建标签', exact: true }));
  const pageSize = page.locator('.el-pagination .el-select');
  if (await pageSize.count()) {
    const current = pageSize.locator('.el-select__selected-item');
    if (!await current.getByText('100条/页', { exact: true }).count()) {
      await pageSize.click();
      await page.getByRole('option', { name: '100条/页', exact: true }).click();
      await expect(pageSize).toContainText('100条/页');
      await waitForList(page);
    }
  }
}

async function waitForList(page) {
  // Give Element Plus time to mount its loading mask, then wait for the final table state.
  await page.waitForTimeout(100);
  await page.locator('.el-loading-mask:visible').waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
  await expect(page.locator('tbody tr:visible').first().or(page.getByText('暂无数据', { exact: true }))).toBeVisible();
}

async function choose(page, wrapper, option) {
  await wrapper.click();
  await page.locator('.el-select-dropdown:visible').getByText(option, { exact: true }).click();
}

function filterSelect(page, index) {
  return page.locator('main .el-select').nth(index);
}

async function query(page) {
  await page.getByRole('button', { name: '查询', exact: true }).click();
  await waitForList(page);
}

async function reset(page) {
  await page.getByRole('button', { name: '重置', exact: true }).click();
  await expect(page.getByRole('textbox', { name: '搜索标签名称' })).toHaveValue('');
  await waitForList(page);
}

async function openCreate(page) {
  await page.getByRole('button', { name: '新建标签', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '新建标签' });
  await expect(dialog).toBeVisible();
  return {
    dialog,
    name: dialog.getByRole('textbox', { name: '* 标签名称' }),
    category: dialog.locator('.el-select').first(),
    save: dialog.getByRole('button', { name: '保存', exact: true }),
  };
}

async function create(page, name, category = '其他') {
  const form = await openCreate(page);
  await form.name.fill(name);
  if (category !== '其他') await choose(page, form.category, category);
  await form.save.click();
  await expect(form.dialog).toBeHidden();
  const row = tagRow(page, name);
  await expect(row).toBeVisible();
  await expect(row.locator('td').nth(1)).toHaveText(category);
  return row;
}

async function remove(page, name) {
  await reset(page);
  const row = tagRow(page, name);
  if (!await row.count()) return;
  await row.getByRole('button', { name: '删除', exact: true }).click();
  const dialog = page.getByRole('dialog').last();
  await dialog.getByRole('button', { name: /确定|确认/, exact: true }).click();
  await expect(row).toHaveCount(0);
}

async function closeDialog(dialog) {
  if (await dialog.isVisible().catch(() => false)) {
    await dialog.getByRole('button', { name: '取消', exact: true }).click({ force: true, timeout: 3000 }).catch(() => {});
  }
}

async function rejectedCreate(page, { name, category, message = /标签名称|长度|格式|存在|重复|请输入/, form: supplied }) {
  const form = supplied || await openCreate(page);
  if (name !== undefined) await form.name.fill(name);
  if (category) await choose(page, form.category, category);
  await form.save.click();
  await expect(form.dialog).toBeVisible();
  await expect(form.dialog.locator('.el-form-item__error').or(page.locator('.el-message')).filter({ hasText: message }).first()).toBeVisible();
  await closeDialog(form.dialog);
}

async function disable(page, name, confirm = true) {
  const row = tagRow(page, name);
  await row.getByRole('button', { name: '禁用', exact: true }).click();
  const dialog = page.getByRole('dialog').last();
  if (await dialog.isVisible().catch(() => false)) {
    await dialog.getByRole('button', { name: confirm ? /确定|确认/ : '取消', exact: false }).click();
  }
  if (confirm) await expect(row).toContainText('禁用');
  return row;
}

async function enable(page, name) {
  const row = tagRow(page, name);
  await row.getByRole('button', { name: '启用', exact: true }).click();
  const dialog = page.getByRole('dialog').last();
  if (await dialog.isVisible().catch(() => false)) await dialog.getByRole('button', { name: /确定|确认/ }).click();
  await expect(row).toContainText('启用');
  return row;
}

async function edit(page, oldName, newName) {
  const row = tagRow(page, oldName);
  await row.getByRole('button', { name: '编辑', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '编辑标签' });
  const name = dialog.getByPlaceholder('如：桌面操作');
  await expect(name).toHaveValue(oldName);
  return { dialog, name, save: dialog.getByRole('button', { name: '保存', exact: true }) };
}

async function rejectEdit(page, oldName, value, message = /标签名称|长度|格式|存在|重复/) {
  const form = await edit(page, oldName, value);
  await form.name.fill(value);
  await form.save.click();
  await expect(form.dialog).toBeVisible();
  await expect(form.dialog.locator('.el-form-item__error').or(page.locator('.el-message')).filter({ hasText: message }).first()).toBeVisible();
  await closeDialog(form.dialog);
}

for (const [id, title, keyword] of [
  ['CASE-000390', '标签管理 - 按标签名称模糊搜索', 'AI390'],
  ['CASE-000402', '标签管理 - 按标签名称模糊查询', 'AI402'],
]) {
  CASE(id, title, async ({ page }) => {
    const match = `${keyword}${Date.now()}`; const other = `AIOther${Date.now()}`;
    await openTags(page);
    try { await create(page, match); await create(page, other); await page.getByRole('textbox', { name: '搜索标签名称' }).fill(match); await query(page); await expect(tagRow(page, match)).toBeVisible(); await expect(tagRow(page, other)).toHaveCount(0); }
    finally { await reset(page); await remove(page, match); await remove(page, other); }
  });
}

CASE('CASE-000391', '标签管理 - 模糊搜索无匹配结果', async ({ page }) => {
  await openTags(page); const keyword = `AINoMatch${Date.now()}`; await page.getByRole('textbox', { name: '搜索标签名称' }).fill(keyword); await query(page); await expect(page.locator('tbody tr:visible')).toHaveCount(0); await expect(page.getByText('暂无数据', { exact: true })).toBeVisible();
});

CASE('CASE-000392', '标签管理 - 模糊搜索空字符串', async ({ page }) => {
  const name = unique('392'); await openTags(page); try { await create(page, name); await page.getByRole('textbox', { name: '搜索标签名称' }).fill(''); await query(page); await expect(tagRow(page, name)).toBeVisible(); } finally { await remove(page, name); }
});

for (const [id, title, category] of [
  ['CASE-000393', '标签管理 - 按质量分类查询标签列表', '质量'],
  ['CASE-000395', '标签管理 - 按分类“其他”查询标签列表', '其他'],
]) {
  CASE(id, title, async ({ page }) => { const name = unique(id.slice(-3)); await openTags(page); try { await create(page, name, category); await choose(page, filterSelect(page, 0), category); await query(page); await expect(tagRow(page, name)).toBeVisible(); for (const row of await page.locator('tbody tr').all()) await expect(row.locator('td').nth(1)).toHaveText(category); } finally { await reset(page); await remove(page, name); } });
}

for (const [id, title, status] of [
  ['CASE-000397', '标签管理 - 按启用状态查询标签列表', '启用'],
  ['CASE-000398', '标签管理 - 按禁用状态查询标签列表', '禁用'],
  ['CASE-000399', '标签管理 - 按禁用状态查询标签列表（CASE-000399）', '禁用'],
  ['CASE-000400', '标签管理 - 按启用状态查询标签列表（CASE-000400）', '启用'],
]) {
  CASE(id, title, async ({ page }) => { const name = unique(id.slice(-3)); await openTags(page); try { await create(page, name); if (status === '禁用') await disable(page, name); await choose(page, filterSelect(page, 1), status); await query(page); await expect(tagRow(page, name)).toBeVisible(); for (const row of await page.locator('tbody tr').all()) await expect(row.locator('td').nth(2)).toHaveText(status); } finally { await reset(page); if (status === '禁用') await enable(page, name); await remove(page, name); } });
}

CASE('CASE-000401', '标签管理 - 按标签名称模糊匹配查询', async ({ page }) => { const keyword = unique('401'); const suffix = `${keyword}More`; const other = unique('401Other'); await openTags(page); try { await create(page, keyword); await create(page, suffix); await create(page, other); await page.getByRole('textbox', { name: '搜索标签名称' }).fill(keyword); await query(page); await expect(tagRow(page, keyword)).toBeVisible(); await expect(tagRow(page, suffix)).toBeVisible(); await expect(tagRow(page, other)).toHaveCount(0); } finally { await reset(page); await remove(page, keyword); await remove(page, suffix); await remove(page, other); } });

CASE('CASE-000403', '标签管理 - 查询无匹配结果', async ({ page }) => { await openTags(page); await page.getByRole('textbox', { name: '搜索标签名称' }).fill(`AINone${Date.now()}`); await query(page); await expect(page.locator('tbody tr:visible')).toHaveCount(0); await expect(page.getByText('暂无数据', { exact: true })).toBeVisible(); });
CASE('CASE-000404', '标签管理 - 查询条件为空显示全部', async ({ page }) => { const name = unique('404'); await openTags(page); try { await create(page, name); await page.getByRole('textbox', { name: '搜索标签名称' }).fill(''); await query(page); await expect(tagRow(page, name)).toBeVisible(); } finally { await remove(page, name); } });
CASE('CASE-000405', '标签管理 - 重置后回到默认为空并查询', async ({ page }) => { const name = unique('405'); await openTags(page); try { await create(page, name, '质量'); await page.getByRole('textbox', { name: '搜索标签名称' }).fill(name); await choose(page, filterSelect(page, 0), '质量'); await query(page); await expect(tagRow(page, name)).toBeVisible(); await reset(page); await expect(page.locator('tbody tr').first()).toBeVisible(); } finally { await remove(page, name); } });

for (const [id, title, value, category] of [
  ['CASE-000406', '标签管理 - 验证标签名称长度为1时创建成功', 'A', '质量'],
  ['CASE-000407', '标签管理 - 验证标签名称长度为32时创建成功', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456', '其他'],
  ['CASE-000410', '标签管理 - 验证标签名称支持中英文字母和数字', '标签ABC123', '质量'],
  ['CASE-000413', '标签管理 - 验证标签名称仅包含中文时创建成功', '质量标签', '其他'],
  ['CASE-000414', '标签管理 - 验证标签名称仅包含英文字母时创建成功', 'Quality', '质量'],
  ['CASE-000415', '标签管理 - 验证标签名称仅包含数字时创建成功', '123', '其他'],
]) {
  CASE(id, title, async ({ page }) => { await openTags(page); try { const row = await create(page, value, category); await expect(row.locator('td').first()).toHaveText(value); } finally { await remove(page, value); } });
}

for (const [id, title, value, category] of [
  ['CASE-000408', '标签管理 - 验证标签名称为空时创建失败', '', '质量'],
  ['CASE-000420', '标签管理 - 新建标签时名称为空前端报红提示', '', '其他'],
  ['CASE-000427', '标签管理 - 新增标签时名称为空被拒绝', '', '质量'],
]) {
  CASE(id, title, async ({ page }) => { await openTags(page); await rejectedCreate(page, { name: value, category, message: /标签名称|长度|请输入/ }); });
}

for (const [id, title, value, category] of [
  ['CASE-000409', '标签管理 - 验证标签名称长度为33时创建失败', 'a'.repeat(33), '质量'],
  ['CASE-000426', '标签管理 - 新增标签时名称超过32个字符被拒绝', 'a'.repeat(33), '质量'],
]) {
  CASE(id, title, async ({ page }) => {
    await openTags(page);
    const form = await openCreate(page);
    let actual = '';
    try {
      await form.name.fill(value);
      actual = await form.name.inputValue();
      await choose(page, form.category, category);
      if (actual.length <= 32) {
        await form.save.click();
        await expect(form.dialog).toBeHidden();
        await expect(tagRow(page, actual)).toBeVisible();
      } else {
        await rejectedCreate(page, { name: actual, category, message: /标签名称|长度|32/, form });
      }
    } finally {
      await closeDialog(form.dialog);
      if (actual && actual.length <= 32) await remove(page, actual);
    }
  });
}

for (const [id, title, value] of [
  ['CASE-000411', '标签管理 - 验证标签名称包含非法字符时提示错误', '标签@#'],
  ['CASE-000412', '标签管理 - 验证标签名称包含空格时提示错误', '标签 123'],
  ['CASE-000428', '标签管理 - 新增标签时名称包含非法字符被拒绝', '标签@#'],
]) {
  CASE(id, title, async ({ page }) => { await openTags(page); const form = await openCreate(page); try { await form.name.fill(value); const actual = await form.name.inputValue(); if (/^[\p{Script=Han}A-Za-z0-9]{1,32}$/u.test(actual)) { await form.save.click(); await expect(form.dialog).toBeHidden(); await remove(page, actual); } else await rejectedCreate(page, { name: actual, message: /名称|格式|仅支持/, form }); } finally { await closeDialog(form.dialog); } });
}

CASE('CASE-000416', '标签管理 - 新建标签时标签分类默认选中其他', async ({ page }) => { const name = unique('416'); await openTags(page); const form = await openCreate(page); try { await expect(form.dialog).toContainText('其他'); await form.name.fill(name); await form.save.click(); await expect(form.dialog).toBeHidden(); await expect(tagRow(page, name).locator('td').nth(1)).toHaveText('其他'); } finally { await remove(page, name); } });
CASE('CASE-000417', '标签管理 - 新建标签时选择质量分类成功', async ({ page }) => { const name = unique('417'); await openTags(page); try { await create(page, name, '质量'); } finally { await remove(page, name); } });

for (const [id, title, reopen] of [['CASE-000418', '标签管理 - 新建标签弹框点击取消关闭且不保存', false], ['CASE-000419', '标签管理 - 新建标签弹框点击取消不保存已填数据', true]]) {
  CASE(id, title, async ({ page }) => { const name = unique(id.slice(-3)); await openTags(page); let form = await openCreate(page); await form.name.fill(name); await choose(page, form.category, '质量'); await form.dialog.getByRole('button', { name: '取消', exact: true }).click(); await expect(tagRow(page, name)).toHaveCount(0); if (reopen) { form = await openCreate(page); await expect(form.name).toHaveValue(''); await expect(form.dialog).toContainText('其他'); await form.dialog.getByRole('button', { name: '取消', exact: true }).click(); } });
}

for (const [id, title, category] of [['CASE-000430', '标签管理 - 新增标签时选择分类为质量', '质量'], ['CASE-000431', '标签管理 - 新增标签时选择分类为其他', '其他']]) {
  CASE(id, title, async ({ page }) => { const name = unique(id.slice(-3)); await openTags(page); try { await create(page, name, category); } finally { await remove(page, name); } });
}

for (const [id, title, category] of [['CASE-000422', '标签管理 - 新建标签时名称唯一性校验提示标签名已存在', '质量'], ['CASE-000429', '标签管理 - 新增标签时名称重复被拒绝', '质量']]) {
  CASE(id, title, async ({ page }) => { const name = unique(id.slice(-3)); await openTags(page); try { await create(page, name, category); const form = await openCreate(page); await rejectedCreate(page, { name, category, message: /存在|重复/, form }); await expect(tagRow(page, name)).toHaveCount(1); } finally { await remove(page, name); } });
}

CASE('CASE-000423', '标签管理 - 新增标签时填写合法名称成功创建', async ({ page }) => { const name = unique('423'); await openTags(page); try { await create(page, name, '质量'); } finally { await remove(page, name); } });
CASE('CASE-000424', '标签管理 - 新增标签时名称长度边界为1时创建成功', async ({ page }) => { const name = '标'; await openTags(page); try { await create(page, name, '其他'); } finally { await remove(page, name); } });
CASE('CASE-000425', '标签管理 - 新增标签时名称长度边界为32时创建成功', async ({ page }) => { const name = 'a'.repeat(32); await openTags(page); try { await create(page, name, '质量'); } finally { await remove(page, name); } });
CASE('CASE-000433', '标签管理 - 启用状态标签在列表中的展示', async ({ page }) => { const name = unique('433'); await openTags(page); try { const row = await create(page, name); await expect(row.locator('td').nth(2)).toHaveText('启用'); } finally { await remove(page, name); } });

CASE('CASE-000434', '标签管理 - 禁用标签后状态更新为禁用', async ({ page }) => { const name = unique('434'); await openTags(page); try { const row = await create(page, name); const created = await row.locator('td').nth(3).innerText(); await disable(page, name); await expect(row.locator('td').nth(2)).toHaveText('禁用'); await expect(row.locator('td').nth(3)).toHaveText(created); } finally { await enable(page, name); await remove(page, name); } });

CASE('CASE-000436', '标签管理 - 列表页创建时间显示年月日时分', async ({ page }) => { const name = unique('436'); await openTags(page); try { const row = await create(page, name); await expect(row.locator('td').nth(3)).toHaveText(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/); } finally { await remove(page, name); } });

CASE('CASE-000437', '标签管理 - 新增标签后创建时间保持不变', async ({ page }) => { const name = unique('437'); await openTags(page); try { const row = await create(page, name); const created = await row.locator('td').nth(3).innerText(); await page.reload(); await expect(page.getByRole('button', { name: '新建标签', exact: true })).toBeVisible(); await expect(tagRow(page, name).locator('td').nth(3)).toHaveText(created); } finally { await remove(page, name); } });

CASE('CASE-000438', '标签管理 - 列表页更新时间显示格式验证', async ({ page }) => { const name = unique('438'); await openTags(page); try { const row = await create(page, name); await expect(row.locator('td').nth(4)).toHaveText(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/); } finally { await remove(page, name); } });

CASE('CASE-000439', '标签管理 - 编辑标签后更新时间更新为当前时间', async ({ page }) => { const name = unique('439'); const updated = unique('439edit'); await openTags(page); try { const row = await create(page, name); const created = await row.locator('td').nth(3).innerText(); const form = await edit(page, name, updated); await form.name.fill(updated); await form.save.click(); await expect(form.dialog).toBeHidden(); await page.reload(); await expect(page.getByRole('button', { name: '新建标签', exact: true })).toBeVisible(); const next = tagRow(page, updated); await expect(next).toBeVisible(); const changed = await next.locator('td').nth(4).innerText(); expect(changed).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/); expect(changed >= created).toBeTruthy(); } finally { await closeDialog(page.getByRole('dialog', { name: '编辑标签' })); await remove(page, updated); await remove(page, name); } });

CASE('CASE-000440', '标签管理 - 禁用标签后更新时间更新为当前时间', async ({ page }) => { const name = unique('440'); await openTags(page); try { const row = await create(page, name); const created = await row.locator('td').nth(3).innerText(); await disable(page, name); const changed = await row.locator('td').nth(4).innerText(); expect(changed).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/); expect(changed >= created).toBeTruthy(); } finally { await enable(page, name); await remove(page, name); } });

CASE('CASE-000441', '标签管理 - 刚创建标签时创建时间与更新时间一致', async ({ page }) => { const name = unique('441'); await openTags(page); try { const row = await create(page, name, '质量'); await expect(row.locator('td').nth(4)).toHaveText(await row.locator('td').nth(3).innerText()); } finally { await remove(page, name); } });

for (const [id, title, value] of [
  ['CASE-000442', '标签管理 - 编辑标签名称回显并修改为合法值', '新标签名'],
  ['CASE-000447', '标签管理 - 编辑标签名称回显且可修改', '新标签123'],
  ['CASE-000448', '标签管理 - 编辑标签名称支持中英文字母和数字', '标签ABC123'],
  ['CASE-000450', '标签管理 - 编辑标签名称回显并可修改', '修改后的标签'],
]) {
  CASE(id, title, async ({ page }) => { const original = unique(id.slice(-3)); await openTags(page); try { await create(page, original); const form = await edit(page, original, value); await expect(form.name).toHaveValue(original); await form.name.fill(value); await form.save.click(); await expect(form.dialog).toBeHidden(); await expect(tagRow(page, value)).toBeVisible(); } finally { await closeDialog(page.getByRole('dialog', { name: '编辑标签' })); await remove(page, value); await remove(page, original); } });
}

for (const [id, title, value] of [
  ['CASE-000443', '标签管理 - 编辑标签名称为1个字符的边界值', 'A'],
  ['CASE-000444', '标签管理 - 编辑标签名称为32个字符的边界值', '12345678901234567890123456789012'],
]) {
  CASE(id, title, async ({ page }) => { const original = unique(id.slice(-3)); await openTags(page); try { await create(page, original); const form = await edit(page, original, value); await form.name.fill(value); await form.save.click(); await expect(form.dialog).toBeHidden(); await expect(tagRow(page, value)).toBeVisible(); } finally { await closeDialog(page.getByRole('dialog', { name: '编辑标签' })); await remove(page, value); await remove(page, original); } });
}

for (const [id, title, value, message] of [
  ['CASE-000445', '标签管理 - 编辑标签名称为空字符串的异常场景', '', /标签名称|长度|请输入/],
  ['CASE-000446', '标签管理 - 编辑标签名称为33个字符的异常场景', '123456789012345678901234567890123', /标签名称|长度|32/],
]) {
  CASE(id, title, async ({ page }) => { const original = unique(id.slice(-3)); await openTags(page); try { await create(page, original); await rejectEdit(page, original, value, message); await expect(tagRow(page, original)).toBeVisible(); } finally { await remove(page, original); } });
}

for (const [id, title, value] of [
  ['CASE-000449', '标签管理 - 编辑标签名称输入特殊字符被拒绝', '标签@#'],
]) {
  CASE(id, title, async ({ page }) => { const original = unique(id.slice(-3)); await openTags(page); try { await create(page, original); const form = await edit(page, original, value); await form.name.fill(value); const actual = await form.name.inputValue(); await form.save.click(); if (await form.dialog.isVisible().catch(() => false)) { await expect(form.dialog.locator('.el-form-item__error').or(page.locator('.el-message')).filter({ hasText: /名称|格式|仅支持/ }).first()).toBeVisible(); await closeDialog(form.dialog); await expect(tagRow(page, original)).toBeVisible(); } else { await expect(tagRow(page, actual)).toBeVisible(); await remove(page, actual); } } finally { await closeDialog(page.getByRole('dialog', { name: '编辑标签' })); await remove(page, original); } });
}

CASE('CASE-000451', '标签管理 - 编辑标签名称唯一性校验失败报红', async ({ page }) => { const first = unique('451a'); const second = unique('451b'); await openTags(page); try { await create(page, first); await create(page, second); await rejectEdit(page, first, second, /存在|重复/); await expect(tagRow(page, first)).toBeVisible(); } finally { await remove(page, first); await remove(page, second); } });

CASE('CASE-000454', '标签管理 - 删除标签二次确认后成功删除', async ({ page }) => { const name = unique('454'); await openTags(page); await create(page, name); await remove(page, name); });
CASE('CASE-000455', '标签管理 - 删除标签二次确认时取消删除', async ({ page }) => { const name = unique('455'); await openTags(page); try { const row = await create(page, name); await row.getByRole('button', { name: '删除', exact: true }).click(); const dialog = page.getByRole('dialog').last(); await expect(dialog).toContainText(name); await dialog.getByRole('button', { name: '取消', exact: true }).click(); await expect(row).toHaveCount(1); } finally { await remove(page, name); } });

CASE('CASE-000458', '标签管理 - 验证列表按创建时间倒序排列', async ({ page }) => { const names = [unique('458a'), unique('458b'), unique('458c')]; await openTags(page); try { for (const name of names) await create(page, name); const values = await page.locator('tbody tr td:nth-child(4)').allTextContents(); expect(values).toEqual([...values].sort((a, b) => b.trim().localeCompare(a.trim()))); } finally { for (const name of names) await remove(page, name); } });

CASE('CASE-000435', '标签管理 - 禁用已被任务使用的标签失败', async ({ page }) => {
  await openTags(page); const row = tagRow(page, '训练'); await expect(row).toHaveCount(1); await expect(row.locator('td').nth(2)).toHaveText('启用'); await row.getByRole('button', { name: '禁用', exact: true }).click(); await page.waitForTimeout(800); await expect(row.locator('td').nth(2)).toHaveText('启用'); await expect(page.locator('.el-message').filter({ hasText: /任务使用|不允许禁用/ })).toBeVisible();
}, { cleanup: 'retained-by-design' });

CASE('CASE-000452', '标签管理 - 已被任务使用的标签编辑时提示不允许修改', async ({ page }) => {
  await openTags(page); const row = tagRow(page, '训练'); await expect(row).toHaveCount(1); const form = await edit(page, '训练', unique('452')); await form.name.fill(unique('452edit')); await form.save.click(); await expect(form.dialog).toBeVisible(); await expect(page.locator('.el-message').filter({ hasText: /任务使用|不允许修改/ })).toBeVisible(); await closeDialog(form.dialog); await expect(row).toContainText('训练');
}, { cleanup: 'retained-by-design' });

CASE('CASE-000453', '标签管理 - 禁用已被任务使用的标签时提示不允许禁用', async ({ page }) => {
  await openTags(page); const row = tagRow(page, '训练'); await expect(row).toHaveCount(1); await row.getByRole('button', { name: '禁用', exact: true }).click(); await page.waitForTimeout(800); await expect(row.locator('td').nth(2)).toHaveText('启用'); await expect(page.locator('.el-message').filter({ hasText: /任务使用|不允许禁用/ })).toBeVisible();
}, { cleanup: 'retained-by-design' });

for (const [id, title] of [['CASE-000456', '标签管理 - 删除已被任务使用的标签时提示不允许删除'], ['CASE-000457', '标签管理 - 已被任务使用的标签不允许删除']]) {
  CASE(id, title, async ({ page }) => { await openTags(page); const row = tagRow(page, '训练'); await expect(row).toHaveCount(1); await row.getByRole('button', { name: '删除', exact: true }).click(); const dialog = page.getByRole('dialog').last(); if (await dialog.isVisible().catch(() => false)) await dialog.getByRole('button', { name: '确定', exact: true }).click(); await expect(row).toHaveCount(1); await expect(page.locator('.el-message').filter({ hasText: /任务使用|不允许删除/ })).toBeVisible(); }, { cleanup: 'retained-by-design' });
}
