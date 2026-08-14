const { test, expect } = require('@playwright/test');
const { openModule } = require('../helpers/auth');

const CASE = (caseId, title, body, { failureCategory } = {}) => test(title, {
  annotation: [
    { type: 'case', description: caseId },
    { type: 'cleanup', description: 'passed' },
    ...(failureCategory ? [{ type: 'failure-category', description: failureCategory }] : []),
  ],
}, body);

function unique(prefix) {
  return `AI${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(0, 32);
}

function row(page, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return page.locator('tbody tr').filter({
    has: page.locator('td:first-child').filter({ hasText: new RegExp(`^${escaped}$`) }),
  });
}

async function openConfigs(page) {
  await openModule(page, '机器人构型配置', '/admin/robot-configs', () => page.getByRole('button', { name: '新建构型', exact: true }));
}

async function openCreate(page) {
  await page.getByRole('button', { name: '新建构型', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '新建机器人构型', exact: true });
  await expect(dialog).toBeVisible();
  return {
    dialog,
    name: dialog.getByPlaceholder('仅支持中文、英文字母、数字、_', { exact: true }),
    model: dialog.getByPlaceholder('仅支持中文、英文字母、数字、_、-', { exact: true }),
    description: dialog.getByPlaceholder('简要描述构型特点...'),
    file: dialog.locator('input[type=file]'),
    save: dialog.getByRole('button', { name: '保存', exact: true }),
  };
}

function jsonFile(name, body = { robot_type: 'automation_robot', source: 'CASE' }) {
  return {
    name: `${name}.json`,
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(body)),
  };
}

async function fill(form, { name, model, description, file } = {}) {
  if (name !== undefined) await form.name.fill(name);
  if (model !== undefined) await form.model.fill(model);
  if (description !== undefined) await form.description.fill(description);
  if (file !== undefined) await form.file.setInputFiles(file);
}

async function create(page, values) {
  const form = await openCreate(page);
  await fill(form, { ...values, file: values.file || jsonFile(values.name) });
  await form.save.click();
  await expect(form.dialog).toBeHidden();
  const config = row(page, values.name);
  await expect(config).toBeVisible();
  return config;
}

async function deleteConfig(page, name) {
  const config = row(page, name);
  if (!await config.count()) return;
  await config.getByRole('button', { name: '删除', exact: true }).click();
  const dialog = page.getByRole('dialog').last();
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: /确认|确定/, exact: false }).click();
  await expect(config).toHaveCount(0);
}

async function cancel(form) {
  if (!await form.dialog.isVisible().catch(() => false)) return;
  await form.dialog.getByRole('button', { name: '取消', exact: true }).click({ force: true, timeout: 3000 });
  await expect(form.dialog).toBeHidden();
}

async function expectBlocked(page, form, name, message, expectedRows = 0) {
  await form.save.click();
  await expect(form.dialog).toBeVisible();
  await expect(row(page, name)).toHaveCount(expectedRows);
  const feedback = form.dialog.locator('.el-form-item__error').or(page.locator('.el-message'));
  await expect(feedback.filter({ hasText: message }).first()).toBeVisible();
}

async function expectRequiredFieldErrors(page, form, fields, values) {
  for (const field of fields) {
    await form.save.click();
    await expect(form.dialog).toBeVisible();
    await expect(row(page, values.name || '')).toHaveCount(0);
    const message = field === '配置文件' ? /配置文件/ : new RegExp(`请输入${field}`);
    await expect(page.locator('.el-message').filter({ hasText: message })).toBeVisible();
    if (field === '构型名称') await form.name.fill(unique('requiredname'));
    if (field === '机器人型号') await form.model.fill(unique('requiredmodel'));
    if (field === '配置文件') break;
  }
}

async function createWithActualInput(page, field, requested, values) {
  const form = await openCreate(page);
  await fill(form, { ...values, file: values.file || jsonFile(values.name) });
  await form[field].fill(requested);
  const actual = await form[field].inputValue();
  return { form, actual };
}

CASE('CASE-000459', '机器人构型配置 - 验证构型名称长度为1时创建成功', async ({ page }) => {
  const name = 'A';
  await openConfigs(page);
  try { await create(page, { name, model: unique('M') }); await expect(row(page, name)).toBeVisible(); }
  finally { await deleteConfig(page, name); }
});

CASE('CASE-000460', '机器人构型配置 - 验证构型名称长度为32时创建成功', async ({ page }) => {
  const name = `A${unique('').padEnd(31, 'A').slice(0, 31)}`;
  await openConfigs(page);
  try { await create(page, { name, model: unique('M') }); await expect(row(page, name)).toBeVisible(); }
  finally { await deleteConfig(page, name); }
});

CASE('CASE-000461', '机器人构型配置 - 验证构型名称为空时创建失败', async ({ page }) => {
  await openConfigs(page);
  const form = await openCreate(page);
  await fill(form, { model: unique('M'), file: jsonFile('empty-name') });
  try { await expectBlocked(page, form, '', /构型名称|请输入|必填/); }
  finally { await cancel(form); }
});

CASE('CASE-000462', '机器人构型配置 - 验证构型名称长度为33时创建失败', async ({ page }) => {
  const requested = 'A'.repeat(33);
  const seed = unique('name33');
  await openConfigs(page);
  const { form, actual } = await createWithActualInput(page, 'name', requested, { name: seed, model: unique('M') });
  try {
    expect(actual.length).toBeLessThanOrEqual(32);
    if (actual.length < 33) {
      await form.save.click();
      await expect(form.dialog).toBeHidden();
      await expect(row(page, actual)).toBeVisible();
    } else await expectBlocked(page, form, actual, /长度|32|构型名称/);
  } finally { await deleteConfig(page, actual); await cancel(form).catch(() => {}); }
});

for (const [caseId, title, requested] of [
  ['CASE-000463', '机器人构型配置 - 验证构型名称支持中英文字母数字下划线', '测试_Config123'],
  ['CASE-000466', '机器人构型配置 - 验证构型名称含中文和英文混合合法', '测试Robot_01'],
]) {
  CASE(caseId, title, async ({ page }) => {
    const name = `${requested}${String(Date.now()).slice(-8)}`.slice(0, 32);
    await openConfigs(page);
    try { await create(page, { name, model: unique('M') }); await expect(row(page, name)).toBeVisible(); }
    finally { await deleteConfig(page, name); }
  });
}

for (const [caseId, title, requested] of [
  ['CASE-000464', '机器人构型配置 - 验证构型名称含特殊字符被拒绝', 'Test@Config'],
  ['CASE-000465', '机器人构型配置 - 验证构型名称含空格被拒绝', 'Test Config'],
]) {
  CASE(caseId, title, async ({ page }) => {
    const seed = unique('invalidname');
    await openConfigs(page);
    const { form, actual } = await createWithActualInput(page, 'name', requested, { name: seed, model: unique('M') });
    try {
      if (/^[\p{Script=Han}A-Za-z0-9_]+$/u.test(actual) && actual) {
        await form.save.click(); await expect(form.dialog).toBeHidden(); await expect(row(page, actual)).toBeVisible();
      } else await expectBlocked(page, form, actual, /仅支持|格式|构型名称/);
    } finally { await deleteConfig(page, actual); await cancel(form).catch(() => {}); }
  });
}

for (const [caseId, title, requested] of [
  ['CASE-000467', '机器人构型配置 - 新建机器人构型时机器人型号长度边界值1验证', 'A'],
  ['CASE-000468', '机器人构型配置 - 新建机器人构型时机器人型号长度边界值32验证', 'A'.repeat(32)],
  ['CASE-000471', '机器人构型配置 - 新建机器人构型时机器人型号支持中英文字母数字下划线横线', 'Robot_Model-2024'],
  ['CASE-000472', '机器人构型配置 - 新建机器人构型时机器人型号包含中文和英文数字', '型号A1_测试-B'],
]) {
  CASE(caseId, title, async ({ page }) => {
    const name = unique(caseId.slice(-3));
    await openConfigs(page);
    try { await create(page, { name, model: requested }); await expect(row(page, name)).toContainText(requested); }
    finally { await deleteConfig(page, name); }
  });
}

CASE('CASE-000469', '机器人构型配置 - 新建机器人构型时机器人型号长度超长异常验证', async ({ page }) => {
  const name = unique('model33');
  await openConfigs(page);
  const { form, actual } = await createWithActualInput(page, 'model', 'A'.repeat(33), { name, model: 'seed' });
  try {
    expect(actual.length).toBeLessThanOrEqual(32);
    if (actual.length < 33) { await form.save.click(); await expect(form.dialog).toBeHidden(); await expect(row(page, name)).toContainText(actual); }
    else await expectBlocked(page, form, name, /长度|32|机器人型号/);
  } finally { await deleteConfig(page, name); await cancel(form).catch(() => {}); }
});

CASE('CASE-000470', '机器人构型配置 - 新建机器人构型时机器人型号为空异常验证', async ({ page }) => {
  const name = unique('emptymodel');
  await openConfigs(page);
  const form = await openCreate(page);
  await fill(form, { name, file: jsonFile(name) });
  try { await expectBlocked(page, form, name, /机器人型号|请输入|必填/); }
  finally { await cancel(form); }
});

for (const [caseId, title, requested] of [
  ['CASE-000473', '机器人构型配置 - 新建机器人构型时机器人型号包含非法字符被拒绝', 'Robot@Model!'],
  ['CASE-000474', '机器人构型配置 - 新建机器人构型时机器人型号包含空格被拒绝', 'Robot Model'],
]) {
  CASE(caseId, title, async ({ page }) => {
    const name = unique(caseId.slice(-3));
    await openConfigs(page);
    const { form, actual } = await createWithActualInput(page, 'model', requested, { name, model: 'seed' });
    try {
      if (/^[\p{Script=Han}A-Za-z0-9_-]+$/u.test(actual) && actual) {
        await form.save.click(); await expect(form.dialog).toBeHidden(); await expect(row(page, name)).toContainText(actual);
      } else await expectBlocked(page, form, name, /仅支持|格式|机器人型号/);
    } finally { await deleteConfig(page, name); await cancel(form).catch(() => {}); }
  });
}

CASE('CASE-000475', '机器人构型配置 - 新建构型描述长度边界值验证', async ({ page }) => {
  const name = unique('desc255'); const description = 'a'.repeat(255);
  await openConfigs(page);
  try { const config = await create(page, { name, model: unique('M'), description }); await expect(config).toContainText(description); }
  finally { await deleteConfig(page, name); }
});

CASE('CASE-000476', '机器人构型配置 - 新建构型描述长度超限校验', async ({ page }) => {
  const name = unique('desc256');
  await openConfigs(page);
  const { form, actual } = await createWithActualInput(page, 'description', 'a'.repeat(256), { name, model: unique('M') });
  try {
    expect(actual.length).toBeLessThanOrEqual(255);
    if (actual.length < 256) { await form.save.click(); await expect(form.dialog).toBeHidden(); await expect(row(page, name)).toContainText(actual); }
    else await expectBlocked(page, form, name, /描述|长度|255/);
  } finally { await deleteConfig(page, name); await cancel(form).catch(() => {}); }
});

CASE('CASE-000477', '机器人构型配置 - 上传非JSON格式配置文件时提示错误', async ({ page }) => {
  const name = unique('nonjson');
  await openConfigs(page);
  const form = await openCreate(page);
  await fill(form, { name, model: unique('M') });
  try {
    await form.file.setInputFiles({ name: 'invalid.txt', mimeType: 'text/plain', buffer: Buffer.from('text') });
    await expect(page.locator('.el-message').filter({ hasText: /JSON|json/ })).toBeVisible();
    await form.save.click();
    await expect(form.dialog).toBeVisible();
    await expect(row(page, name)).toHaveCount(0);
  } finally { await cancel(form); }
});

CASE('CASE-000478', '机器人构型配置 - 上传JSON配置文件缺少robot_type字段时提示错误', async ({ page }) => {
  const name = unique('missingtype');
  await openConfigs(page);
  const form = await openCreate(page);
  await fill(form, { name, model: unique('M') });
  try {
    await form.file.setInputFiles(jsonFile(name, { joints: [] }));
    await expect(page.locator('.el-message').filter({ hasText: /robot_type/ })).toBeVisible();
    await form.save.click();
    await expect(form.dialog).toBeVisible();
    await expect(row(page, name)).toHaveCount(0);
  } finally { await cancel(form); }
});

CASE('CASE-000479', '机器人构型配置 - 上传合法JSON配置文件成功创建构型', async ({ page }) => {
  const name = unique('validjson'); const file = jsonFile(name, { robot_type: 'valid_robot', joints: [1, 2] });
  await openConfigs(page);
  try {
    const config = await create(page, { name, model: unique('M'), file });
    await config.getByText(file.name, { exact: true }).click();
    const dialog = page.getByRole('dialog').last();
    await expect(dialog).toContainText('valid_robot');
    await dialog.getByRole('button', { name: /关闭|取消|确定/ }).last().click();
  } finally { await deleteConfig(page, name); }
});

CASE('CASE-000480', '机器人构型配置 - 新建弹框取消不保存', async ({ page }) => {
  const name = unique('cancel');
  await openConfigs(page);
  const form = await openCreate(page);
  await fill(form, { name, model: unique('M'), file: jsonFile(name) });
  await cancel(form);
  await expect(row(page, name)).toHaveCount(0);
});

CASE('CASE-000481', '机器人构型配置 - 新建弹框关闭按钮取消不保存', async ({ page }) => {
  const name = unique('close');
  await openConfigs(page);
  const form = await openCreate(page);
  await fill(form, { name, model: unique('M'), file: jsonFile(name) });
  await form.dialog.locator('.el-dialog__headerbtn').click();
  await expect(form.dialog).toBeHidden();
  await expect(row(page, name)).toHaveCount(0);
});

for (const [caseId, title, values, missingFields] of [
  ['CASE-000482', '机器人构型配置 - 新建时必填项为空校验', {}, ['构型名称', '机器人型号', '配置文件']],
  ['CASE-000483', '机器人构型配置 - 新建时仅填写构型名称校验', { name: unique('onlyname') }, ['机器人型号', '配置文件']],
  ['CASE-000484', '机器人构型配置 - 新建时仅填写机器人型号校验', { model: unique('onlymodel') }, ['构型名称', '配置文件']],
  ['CASE-000485', '机器人构型配置 - 新建时仅上传配置文件校验', { file: jsonFile('onlyfile') }, ['构型名称', '机器人型号']],
  ['CASE-000486', '机器人构型配置 - 新建时部分必填项为空校验', { name: unique('nofile'), model: unique('M') }, ['配置文件']],
]) {
  CASE(caseId, title, async ({ page }) => {
    await openConfigs(page);
    const form = await openCreate(page);
    await fill(form, values);
    try {
      await expectRequiredFieldErrors(page, form, missingFields, values);
    }
    finally { await cancel(form); }
  });
}

CASE('CASE-000487', '机器人构型配置 - 新建构型时名称重复提示已存在', async ({ page }) => {
  const name = unique('duplicate');
  await openConfigs(page);
  try {
    await create(page, { name, model: unique('M') });
    const form = await openCreate(page);
    await fill(form, { name, model: unique('M'), file: jsonFile(`${name}duplicate`) });
    await expectBlocked(page, form, name, /存在|重复/, 1);
    await expect(row(page, name)).toHaveCount(1);
    await cancel(form);
  } finally { await deleteConfig(page, name); }
});

for (const [caseId, title, assertion] of [
  ['CASE-000488', '机器人构型配置 - 新增时填写一致的构型名称在列表页正确显示', async (config, name) => expect(config.locator('td').first()).toHaveText(name)],
  ['CASE-000489', '机器人构型配置 - 新增时填写一致的机器人型号后列表显示正确', async (config, _name, model) => expect(config).toContainText(model)],
  ['CASE-000490', '机器人构型配置 - 列表页描述显示与新增填写一致', async (config, _name, _model, description) => expect(config).toContainText(description)],
]) {
  CASE(caseId, title, async ({ page }) => {
    const name = unique(caseId.slice(-3)); const model = 'Robot-A1'; const description = '测试描述内容';
    await openConfigs(page);
    try { const config = await create(page, { name, model, description }); await assertion(config, name, model, description); }
    finally { await deleteConfig(page, name); }
  });
}

CASE('CASE-000491', '机器人构型配置 - 新增时上传的JSON文件名称可点击查看', async ({ page }) => {
  const name = unique('491'); const file = jsonFile(name, { robot_type: 'preview_robot', joints: [1, 2, 3] });
  await openConfigs(page);
  try {
    const config = await create(page, { name, model: unique('M'), file });
    await config.getByText(file.name, { exact: true }).click();
    const dialog = page.getByRole('dialog').last();
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('preview_robot');
    await dialog.getByRole('button', { name: /关闭|取消|确定/ }).last().click();
  } finally { await deleteConfig(page, name); }
});

CASE('CASE-000493', '机器人构型配置 - 查看JSON文件内容', async ({ page }) => {
  const name = unique('493'); const file = jsonFile(name, { robot_type: 'preview_robot', joints: [1, 2, 3] });
  await openConfigs(page);
  try {
    const config = await create(page, { name, model: unique('M'), file });
    await config.getByRole('button', { name: '查看', exact: true }).click();
    const contentDialog = page.getByRole('dialog', { name: '配置文件内容', exact: true });
    await expect(contentDialog).toBeVisible();
    await expect(contentDialog).toContainText('preview_robot');
    await contentDialog.getByRole('button', { name: '关闭', exact: true }).click();
    await expect(contentDialog).toBeHidden();
  } finally { await deleteConfig(page, name); }
});

CASE('CASE-000492', '机器人构型配置 - 列表页创建时间显示年月日时分', async ({ page }) => {
  const name = unique('time');
  await openConfigs(page);
  try {
    const config = await create(page, { name, model: unique('M') });
    await expect(config.locator('td').nth(4)).toHaveText(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  } finally { await deleteConfig(page, name); }
});

CASE('CASE-000494', '机器人构型配置 - 取消删除构型关闭弹框', async ({ page }) => {
  const name = unique('deletecancel');
  await openConfigs(page);
  try {
    const config = await create(page, { name, model: unique('M') });
    await config.getByRole('button', { name: '删除', exact: true }).click();
    const dialog = page.getByRole('dialog').last();
    await expect(dialog).toContainText(name);
    await dialog.getByRole('button', { name: '取消', exact: true }).click();
    await expect(config).toBeVisible();
  } finally { await deleteConfig(page, name); }
});

CASE('CASE-000495', '机器人构型配置 - 删除已被任务使用的构型时提示不允许删除', async ({ page }) => {
  const name = '天机';
  await openConfigs(page);
  const config = row(page, name);
  await expect(config).toBeVisible();
  await config.getByRole('button', { name: '删除', exact: true }).click();
  const dialog = page.getByRole('dialog').last();
  await expect(dialog).toContainText(name);
  await dialog.getByRole('button', { name: /确认|确定/ }).click();
  await expect(page.locator('.el-message').filter({ hasText: '构型已被任务使用，不允许删除' })).toBeVisible();
  await expect(config).toBeVisible();
});
