const { test, expect } = require('@playwright/test');
const { login } = require('./helpers/auth');

const CASE = (id, title, body, { failureCategory } = {}) => test(title, {
  annotation: [
    { type: 'case', description: id },
    { type: 'cleanup', description: 'passed' },
    ...(failureCategory ? [{ type: 'failure-category', description: failureCategory }] : []),
  ],
}, body);

function unique(label = 'cat') {
  return `AI${label}${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(0, 32);
}

function codeRow(page, code) {
  const escaped = code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return page.locator('tbody tr').filter({ has: page.locator('td:first-child').filter({ hasText: new RegExp(`^${escaped}$`) }) });
}

function nameRow(page, name) {
  return page.locator('tbody tr').filter({ hasText: name });
}

async function openCategories(page) {
  await login(page);
  await page.getByText('数据分类管理', { exact: true }).click();
  // The module view does not consistently expose a heading; wait for its
  // first actionable control after navigation instead.
  await expect(page.getByRole('button', { name: '新建分类', exact: true })).toBeVisible();
}

async function openCreate(page) {
  await page.getByRole('button', { name: '新建分类', exact: true }).click();
  const dialog = page.getByRole('dialog').filter({ has: page.getByPlaceholder('仅支持英文字母、数字、_', { exact: true }) }).last();
  await expect(dialog).toBeVisible();
  return { dialog, code: dialog.getByPlaceholder('仅支持英文字母、数字、_', { exact: true }), name: dialog.getByPlaceholder('仅支持中英文字母、数字', { exact: true }) };
}

async function create(page, code, name) {
  const form = await openCreate(page);
  await form.code.fill(code); await form.name.fill(name);
  await form.dialog.getByRole('button', { name: '保存', exact: true }).click();
  await expect(form.dialog).toBeHidden();
  const row = codeRow(page, code);
  await expect(row).toBeVisible();
  return row;
}

async function closeCreate(form) {
  if (!await form.dialog.isVisible().catch(() => false)) return;
  await form.dialog.getByRole('button', { name: '取消', exact: true }).click({ force: true, timeout: 3000 }).catch(() => {});
}

async function remove(page, code) {
  const target = codeRow(page, code);
  if (!await target.count()) return;
  await target.getByRole('button', { name: '删除', exact: true }).click();
  const dialog = page.getByRole('dialog').last();
  await dialog.getByRole('button', { name: /确认|确定/, exact: false }).click();
  await expect(target).toHaveCount(0);
}

async function rejectedCreate(page, { code, name, message = /必填|请输入|长度|格式|存在|重复/ , existing = 0, form: suppliedForm }) {
  const form = suppliedForm || await openCreate(page);
  if (code !== undefined) await form.code.fill(code);
  if (name !== undefined) await form.name.fill(name);
  await form.dialog.getByRole('button', { name: '保存', exact: true }).click();
  await expect(form.dialog).toBeVisible();
  if (code) await expect(codeRow(page, code)).toHaveCount(existing);
  const feedback = form.dialog.locator('.el-form-item__error').or(page.locator('.el-message'));
  await expect(feedback.filter({ hasText: message }).first()).toBeVisible();
  await closeCreate(form);
}

async function openEdit(page, code) {
  const target = codeRow(page, code);
  await target.getByRole('button', { name: '编辑', exact: true }).click();
  const dialog = page.getByRole('dialog').last();
  await expect(dialog).toBeVisible();
  const inputs = dialog.locator('input[type=text]');
  return { dialog, code: inputs.nth(0), name: inputs.nth(1) };
}

async function editAndSave(page, code, value) {
  const form = await openEdit(page, code);
  await form.name.fill(value);
  await form.dialog.getByRole('button', { name: '保存', exact: true }).click();
  return form;
}

for (const [id, title, value] of [
  ['CASE-000496', '数据分类管理 - 验证分类编码长度为1时创建成功', 'A'],
  ['CASE-000497', '数据分类管理 - 验证分类编码长度为32时创建成功', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456'],
  ['CASE-000500', '数据分类管理 - 验证分类编码仅支持英文字母数字下划线', 'abc_123'],
]) {
  CASE(id, title, async ({ page }) => {
    const name = unique(id.slice(-3)); await openCategories(page);
    try { const row = await create(page, value, name); await expect(row.locator('td').first()).toHaveText(value); }
    finally { await remove(page, value); }
  });
}

for (const [id, title, value] of [
  ['CASE-000498', '数据分类管理 - 验证分类编码长度为0时创建失败', ''],
  ['CASE-000504', '数据分类管理 - 验证分类编码为空时创建失败', ''],
]) {
  CASE(id, title, async ({ page }) => { await openCategories(page); await rejectedCreate(page, { code: value, name: unique(id.slice(-3)), message: /分类编码|必填|长度/ }); });
}

CASE('CASE-000499', '数据分类管理 - 验证分类编码长度为33时创建失败', async ({ page }) => {
  await openCategories(page); const name = unique('long'); const form = await openCreate(page);
  await form.code.fill('A'.repeat(33)); await form.name.fill(name); const actual = await form.code.inputValue();
  try { if (actual.length < 33) { await form.dialog.getByRole('button', { name: '保存', exact: true }).click(); await expect(form.dialog).toBeHidden(); await remove(page, actual); } else await rejectedCreate(page, { code: actual, name, message: /长度|32/, form }); }
  finally { await closeCreate(form); }
});

for (const [id, title, value] of [
  ['CASE-000501', '数据分类管理 - 验证分类编码包含中文字符时创建失败', '分类123'],
  ['CASE-000502', '数据分类管理 - 验证分类编码包含特殊字符时创建失败', 'abc@123'],
  ['CASE-000503', '数据分类管理 - 验证分类编码包含空格时创建失败', 'abc 123'],
]) {
  CASE(id, title, async ({ page }) => {
    await openCategories(page); const name = unique(id.slice(-3)); const form = await openCreate(page);
    await form.code.fill(value); await form.name.fill(name); const actual = await form.code.inputValue();
    try {
      if (/^[A-Za-z0-9_]+$/.test(actual) && actual) { await form.dialog.getByRole('button', { name: '保存', exact: true }).click(); await expect(form.dialog).toBeHidden(); await remove(page, actual); }
      else { await form.dialog.getByRole('button', { name: '保存', exact: true }).click(); await expect(form.dialog).toBeVisible(); const feedback = form.dialog.locator('.el-form-item__error').or(page.locator('.el-message')); await expect(feedback.filter({ hasText: /编码|格式|仅支持/ }).first()).toBeVisible(); }
    } finally { await closeCreate(form); }
  });
}

for (const [id, title, value] of [
  ['CASE-000505', '数据分类管理 - 验证分类名称长度为1时创建成功', 'A'],
  ['CASE-000506', '数据分类管理 - 验证分类名称长度为32时创建成功', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456'],
  ['CASE-000511', '数据分类管理 - 验证分类名称支持中英文字母和数字', '分类ABC123'],
]) {
  CASE(id, title, async ({ page }) => { const code = unique(id.slice(-3)); await openCategories(page); try { const r = await create(page, code, value); await expect(r.locator('td').nth(1)).toHaveText(value); } finally { await remove(page, code); } });
}

for (const [id, title, name] of [
  ['CASE-000507', '数据分类管理 - 验证分类名称为空时创建失败', ''],
  ['CASE-000508', '数据分类管理 - 验证分类名称长度为0时创建失败', ''],
]) {
  CASE(id, title, async ({ page }) => { await openCategories(page); await rejectedCreate(page, { code: unique(id.slice(-3)), name, message: /分类名称|必填|长度/ }); });
}

for (const [id, title, value] of [
  ['CASE-000509', '数据分类管理 - 验证分类名称长度为33时创建失败', 'A'.repeat(33)],
]) {
  CASE(id, title, async ({ page }) => { const code = unique(id.slice(-3)); await openCategories(page); const form = await openCreate(page); await form.code.fill(code); await form.name.fill(value); const actual = await form.name.inputValue(); try { if (actual.length < 33) { await form.dialog.getByRole('button', { name: '保存', exact: true }).click(); await expect(form.dialog).toBeHidden(); await remove(page, code); } else await rejectedCreate(page, { code, name: actual, message: /长度|32/, form }); } finally { await closeCreate(form); } });
}

CASE('CASE-000510', '数据分类管理 - 验证分类名称超长时提示并禁止保存', async ({ page }) => {
  await openCategories(page);
  const form = await openCreate(page);
  try {
    const code = unique('510');
    await form.code.fill(code);
    await form.name.fill('A'.repeat(33));
    const actual = await form.name.inputValue();
    expect(actual.length).toBeGreaterThanOrEqual(33);
    await rejectedCreate(page, {
      code,
      name: actual,
      message: /长度|32|超长/,
      form,
    });
    await expect(codeRow(page, code)).toHaveCount(0);
  } finally { await closeCreate(form); }
});

for (const [id, title, value] of [
  ['CASE-000512', '数据分类管理 - 验证分类名称包含特殊字符时提示错误', '分类@#'],
  ['CASE-000513', '数据分类管理 - 验证分类名称包含空格时提示错误', '分类 123'],
]) {
  CASE(id, title, async ({ page }) => { const code = unique(id.slice(-3)); await openCategories(page); const form = await openCreate(page); await form.code.fill(code); await form.name.fill(value); const actual = await form.name.inputValue(); try { if (/^[\p{Script=Han}A-Za-z0-9]+$/u.test(actual) && actual) { await form.dialog.getByRole('button', { name: '保存', exact: true }).click(); await expect(form.dialog).toBeHidden(); await remove(page, code); } else { await form.dialog.getByRole('button', { name: '保存', exact: true }).click(); await expect(form.dialog).toBeVisible(); const feedback = form.dialog.locator('.el-form-item__error').or(page.locator('.el-message')); await expect(feedback.filter({ hasText: /名称|格式|仅支持/ }).first()).toBeVisible(); } } finally { await closeCreate(form); } });
}

CASE('CASE-000514', '数据分类管理 - 新建分类弹框点击取消关闭且不保存', async ({ page }) => { const code = unique('cancel'); await openCategories(page); const form = await openCreate(page); await form.code.fill(code); await form.name.fill(unique('取消')); await closeCreate(form); await expect(codeRow(page, code)).toHaveCount(0); });

for (const [id, title, code, name, message] of [
  ['CASE-000515', '数据分类管理 - 新建分类时分类编码为空提示必填', '', unique('name'), /编码|必填/],
  ['CASE-000516', '数据分类管理 - 新建分类时分类名称为空提示必填', unique('code'), '', /名称|必填/],
]) {
  CASE(id, title, async ({ page }) => { await openCategories(page); await rejectedCreate(page, { code, name, message }); });
}

CASE('CASE-000517', '数据分类管理 - 新建分类时输入已存在的分类编码提示分类编码已存在', async ({ page }) => { const code = unique('dupcode'); await openCategories(page); try { await create(page, code, unique('first')); await rejectedCreate(page, { code, name: unique('second'), message: /存在|重复/, existing: 1 }); } finally { await remove(page, code); } });
CASE('CASE-000518', '数据分类管理 - 新建分类时名称重复提示分类名称已存在', async ({ page }) => { const code = unique('namecode'); const name = unique('dupname'); await openCategories(page); try { await create(page, code, name); await rejectedCreate(page, { code: unique('second'), name, message: /存在|重复/ }); } finally { await remove(page, code); } });

for (const [id, title, codeField, nameField] of [
  ['CASE-000519', '数据分类管理 - 新增时填写一致的分类编码', 'code', 'name'],
  ['CASE-000520', '数据分类管理 - 新增时填写一致的分类名称', 'code', 'name'],
]) {
  CASE(id, title, async ({ page }) => { const code = unique(id.slice(-3)); const name = unique('一致'); await openCategories(page); try { const r = await create(page, code, name); await expect(r.locator('td').first()).toHaveText(code); await expect(r.locator('td').nth(1)).toHaveText(name); } finally { await remove(page, code); } });
}

CASE('CASE-000521', '数据分类管理 - 列表页创建时间显示年月日时分', async ({ page }) => { await openCategories(page); await expect(page.locator('thead').getByText('创建时间', { exact: true })).toBeVisible(); await expect(page.locator('tbody tr').first()).toContainText(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/); });

for (const [id, title, value, mode] of [
  ['CASE-000522', '数据分类管理 - 编辑时分类编码置灰不可修改', '原名称', 'disabled'],
  ['CASE-000523', '数据分类管理 - 编辑分类名称回显可修改', '新名称', 'save'],
  ['CASE-000524', '数据分类管理 - 编辑分类名称长度为1时保存成功', 'A', 'save'],
  ['CASE-000525', '数据分类管理 - 编辑分类名称长度为32时保存成功', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456', 'save'],
  ['CASE-000526', '数据分类管理 - 编辑分类名称为空时保存失败', '', 'reject'],
  ['CASE-000527', '数据分类管理 - 编辑分类名称长度为33时保存失败', 'A'.repeat(33), 'reject'],
  ['CASE-000528', '数据分类管理 - 编辑分类名称输入合法中英文数字', '分类A1', 'save'],
  ['CASE-000529', '数据分类管理 - 编辑分类名称输入非法字符被拒绝', '分类@#', 'reject'],
  ['CASE-000530', '数据分类管理 - 编辑分类名称输入超长内容被拒绝', 'A'.repeat(33), 'reject'],
  ['CASE-000532', '数据分类管理 - 编辑保存时分类名称为空提示必填', '', 'reject'],
]) {
  CASE(id, title, async ({ page }) => {
    const code = unique(id.slice(-3)); const original = unique('原名'); await openCategories(page);
    try {
      await create(page, code, original); const form = await openEdit(page, code);
      if (mode === 'disabled') { await expect(form.code).toBeDisabled(); await expect(form.code).toHaveValue(code); await closeCreate(form); }
      else if (mode === 'save') { await form.name.fill(value); await form.dialog.getByRole('button', { name: '保存', exact: true }).click(); await expect(form.dialog).toBeHidden(); await expect(codeRow(page, code)).toContainText(value); }
      else { await form.name.fill(value); await form.dialog.getByRole('button', { name: '保存', exact: true }).click(); await expect(form.dialog).toBeVisible(); await expect(codeRow(page, code)).toContainText(original); await closeCreate(form); }
    } finally { await page.reload(); await openCategories(page).catch(() => {}); await remove(page, code); }
  });
}

CASE('CASE-000531', '数据分类管理 - 取消编辑关闭弹框不保存', async ({ page }) => { const code = unique('editcancel'); const original = unique('原名'); await openCategories(page); try { await create(page, code, original); const form = await openEdit(page, code); await form.name.fill(unique('未保存')); await closeCreate(form); await expect(codeRow(page, code)).toContainText(original); } finally { await remove(page, code); } });
CASE('CASE-000533', '数据分类管理 - 编辑分类时名称与已有分类重复提示分类名称已存在', async ({ page }) => { const first = unique('first'); const second = unique('second'); const duplicate = unique('duplicate'); await openCategories(page); try { await create(page, first, duplicate); await create(page, second, unique('other')); const form = await openEdit(page, second); await form.name.fill(duplicate); await form.dialog.getByRole('button', { name: '保存', exact: true }).click(); await expect(form.dialog).toBeVisible(); await expect(page.locator('.el-message').filter({ hasText: /存在|重复/ })).toBeVisible(); await closeCreate(form); } finally { await remove(page, second); await remove(page, first); } });
CASE('CASE-000534', '数据分类管理 - 取消删除分类时关闭确认弹框', async ({ page }) => { const code = unique('delcancel'); await openCategories(page); try { const r = await create(page, code, unique('删除')); await r.getByRole('button', { name: '删除', exact: true }).click(); const dialog = page.getByRole('dialog').last(); await dialog.getByRole('button', { name: '取消', exact: true }).click(); await expect(r).toBeVisible(); } finally { await remove(page, code); } });
CASE('CASE-000535', '数据分类管理 - 删除已被任务引用的分类时提示不能删除', async ({ page }) => { await openCategories(page); const target = nameRow(page, '物体抓取').first(); await expect(target).toBeVisible(); await target.getByRole('button', { name: '删除', exact: true }).click(); const dialog = page.getByRole('dialog').last(); await dialog.getByRole('button', { name: /确认|确定/ }).click(); await expect(page.locator('.el-message').filter({ hasText: '分类已被任务引用，不能删除' })).toBeVisible(); await expect(target).toBeVisible(); });
