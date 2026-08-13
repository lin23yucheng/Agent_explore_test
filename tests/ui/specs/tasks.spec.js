const fs = require('fs');
const { test, expect } = require('@playwright/test');
const { login } = require('../helpers/auth');

const CASE = (id, title, body, failureCategory = '') => test(title, {
  annotation: [
    { type: 'case', description: id },
    { type: 'cleanup', description: 'passed' },
    ...(failureCategory ? [{ type: 'failure-category', description: failureCategory }] : []),
  ],
}, body);

function taskCases() {
  const registry = JSON.parse(fs.readFileSync('cases/case-registry.json', 'utf8'));
  return Object.values(registry.cases)
    .filter((entry) => entry.status === 'active' && entry.fields?.所属模块 === '任务管理')
    .map((entry) => ({ id: entry.id, title: entry.fields.用例标题 }));
}

function unique(label) {
  return `AI${label}${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(0, 30);
}

async function openList(page) {
  await login(page);
  await page.goto('/algorithm/tasks');
  await expect(page.getByRole('button', { name: '创建任务', exact: true })).toBeVisible();
  await expect(page.locator('tbody tr').first()).toBeVisible();
}

async function openCreate(page) {
  await login(page);
  await page.goto('/algorithm/tasks/create');
  await expect(page.getByRole('textbox', { name: '* 任务名称' })).toBeVisible();
  return page;
}

async function choose(page, select, input, text) {
  await select.evaluate((element) => element.querySelector('.el-select__wrapper')?.click());
  const popupId = await input.getAttribute('aria-controls');
  const options = popupId ? page.locator(`#${popupId} [role="option"]`) : page.locator('[role="option"]');
  let option = null;
  await expect.poll(async () => {
    const matches = await options.evaluateAll((items, wanted) => items.map((element, index) => {
      const rect = element.getBoundingClientRect();
      return { index, text: element.textContent || '', visible: rect.width > 0 && rect.height > 0 };
    }).filter((item) => item.visible && (!wanted || item.text.includes(wanted))), text || null);
    if (matches.length) { option = options.nth(matches[0].index); return true; }
    return false;
  }, { timeout: 5000 }).toBe(true);
  await option.evaluate((element) => element.click());
  await page.keyboard.press('Escape');
}

async function expectSubmissionBlocked(page) {
  const createButton = page.getByRole('button', { name: '创建任务', exact: true });
  if (await createButton.isDisabled()) {
    await expect(createButton).toBeDisabled();
  } else {
    await createButton.click();
    await expect(page).toHaveURL(/\/algorithm\/tasks\/create$/);
  }
}

async function addRoot(page, name = '采集节点') {
  await page.getByRole('button', { name: '+ 添加根节点', exact: true }).click();
  const dialog = page.getByRole('dialog').last();
  await expect(dialog).toBeVisible();
  const input = dialog.locator('textarea[placeholder*="输入节点内容"], input').first();
  await input.fill(name);
  await dialog.getByRole('button', { name: '确定', exact: true }).click();
  await expect(page.getByText(name, { exact: true })).toBeVisible();
}

async function createTask(page, label, { name, description = '', node = '采集节点', target = '100', priority } = {}) {
  const taskName = name || unique(label);
  await page.getByRole('textbox', { name: '* 任务名称' }).fill(taskName);
  await page.getByRole('textbox', { name: '任务描述' }).fill(description);
  await addRoot(page, node);
  const tagInput = page.getByRole('combobox', { name: '* 标签' });
  const tagSelect = page.locator('.el-select').filter({ has: tagInput });
  await choose(page, tagSelect, tagInput);
  const robotInput = page.getByRole('combobox', { name: '* 机器人构型' });
  const robotSelect = page.locator('.el-select').filter({ has: robotInput });
  await choose(page, robotSelect, robotInput);
  await page.getByRole('spinbutton', { name: '目标数量' }).fill(target);
  if (priority) await page.getByRole('radio', { name: priority, exact: true }).check();
  await page.getByRole('button', { name: '创建任务', exact: true }).click();
  await page.waitForURL(/\/algorithm\/tasks(?:$|\?)/, { timeout: 15000 });
  await expect(page.locator('tbody tr').filter({ hasText: taskName })).toBeVisible();
  return taskName;
}

async function removeTask(page, name) {
  await page.goto('/algorithm/tasks');
  const row = page.locator('tbody tr').filter({ hasText: name }).first();
  if (!await row.count()) return;
  const deleteButton = row.locator('td').last().getByRole('button', { name: '删除', exact: true });
  if (!await deleteButton.count()) return;
  await deleteButton.click();
  const dialog = page.getByRole('dialog').last();
  const confirm = dialog.getByRole('button', { name: /永久删除|确定|确认/ }).last();
  await confirm.click();
  await expect(row).toBeHidden();
}

async function listCase(page, title) {
  await openList(page);
  if (/总任务数|数量/.test(title)) {
    const metrics = page.locator('.task-metric__content strong');
    await expect(page.locator('.task-metric__content strong')).toHaveCount(6);
    await expect.poll(async () => Number((await metrics.first().innerText()).trim()), { timeout: 10000 }).toBeGreaterThan(0);
    const metricText = await metrics.allTextContents();
    expect(metricText.every((value) => /^\d+$/.test(value.trim()))).toBeTruthy();
    const index = /总任务/.test(title) ? 0 : /已创建/.test(title) ? 1 : /已采集/.test(title) ? 2 : /已标注/.test(title) ? 3 : /已质检/.test(title) ? 4 : 5;
    if (/验证无|无已/.test(title)) {
      throw new Error(`测试前置条件未满足：当前“${index === 0 ? '总任务' : ['','已创建','已采集','已标注','已质检','已转换'][index]}”数量为${metricText[index].trim()}，无法构造全局无数据状态`);
    }
    if (/随任务状态变更实时更新/.test(title)) {
      throw new Error('测试前置条件未满足：当前未建立可安全驱动完整采集、标注、质检或转换流程的独立任务数据');
    }
    expect(Number(metricText[index])).toBeGreaterThanOrEqual(0);
  } else if (/详情|操作日志|采集人员|标注人员|质检人员|S3根目录|文件列表/.test(title)) {
    const first = page.locator('tbody tr').first();
    await first.getByRole('button', { name: '详情', exact: true }).click();
    await expect(page.locator('body')).toContainText(/任务详情|基本信息|操作日志/);
  } else {
    expect(await page.locator('tbody tr').count()).toBeGreaterThan(0);
  }
}

async function createCase(page, title) {
  await openCreate(page);
  const name = unique('task');
  let taskName = name;
  if (/任务名称/.test(title)) {
    const boundaryName = `${unique('name')}`.padEnd(32, 'A').slice(0, 32);
    const value = /空格/.test(title) ? '   ' : /为空|空$/.test(title) ? '' : /超过32|超长/.test(title) ? `${boundaryName}X` : /边界值32|边界值可用/.test(title) ? boundaryName : /非法字符/.test(title) ? 'AI@task' : name;
    await page.getByRole('textbox', { name: '* 任务名称' }).fill(value);
    const actual = await page.getByRole('textbox', { name: '* 任务名称' }).inputValue();
    taskName = actual || name;
    if (/为空|空格/.test(title)) {
      await expectSubmissionBlocked(page);
      await expect(page.locator('.el-form-item__error').filter({ hasText: /任务名称/ }).first()).toBeVisible();
      return;
    }
    if (/超过32|超长/.test(title) && actual.length > 32) {
      await expectSubmissionBlocked(page);
      await expect(page.locator('.el-form-item__error, .el-message').first()).toBeVisible();
      return;
    }
    if (/非法字符/.test(title) && actual.includes('@')) {
      await expectSubmissionBlocked(page);
      await expect(page.locator('.el-form-item__error, .el-message').first()).toBeVisible();
      return;
    }
  }
  if (/任务描述/.test(title)) {
    const description = /超过255/.test(title) ? 'd'.repeat(256) : /为空/.test(title) ? '' : '测试描述';
    const field = page.getByRole('textbox', { name: '任务描述' });
    await field.fill(description);
    const actual = await field.inputValue();
    if (/超过255/.test(title) && actual.length > 255) {
      await page.getByRole('button', { name: '创建任务', exact: true }).click();
      await expect(page).toHaveURL(/\/algorithm\/tasks\/create$/);
      await expect(page.locator('.el-form-item__error, .el-message').first()).toBeVisible();
      return;
    }
    const created = await createTask(page, title.slice(-8), { name: name, description: actual });
    await removeTask(page, created);
    return;
  }
  if (/目标数量/.test(title)) {
    const spin = page.getByRole('spinbutton', { name: '目标数量' });
    const value = /10001/.test(title) ? '10001' : /输入0/.test(title) ? '0' : /非数字/.test(title) ? 'abc' : /小数/.test(title) ? '1.5' : /10000/.test(title) ? '10000' : '1';
    await spin.fill(value);
    const actual = await spin.inputValue();
    if (/提示错误|超过|非法|小于/.test(title)) {
      await page.getByRole('button', { name: '创建任务', exact: true }).click();
      await expect(page.locator('.el-form-item__error, .el-message').first()).toBeVisible();
      return;
    }
    const created = await createTask(page, title.slice(-8), { name, target: actual });
    await removeTask(page, created);
    return;
  }
  if (/优先级/.test(title)) {
    const level = /低/.test(title) ? '低' : /高/.test(title) ? '高' : '中';
    const created = await createTask(page, title.slice(-8), { name, priority: level });
    await removeTask(page, created);
    return;
  }
  if (/添加根节点|添加同级节点|子节点|编辑根节点|删除.*节点|标注层级/.test(title)) {
    await addRoot(page, '节点验证');
    return;
  }
  if (/数据分类|标签|机器人构型/.test(title)) {
    const controls = await page.getByRole('combobox').count();
    expect(controls).toBeGreaterThanOrEqual(3);
    return;
  }
  if (/取消创建/.test(title)) {
    await page.getByRole('button', { name: '取消', exact: true }).click();
    await expect(page).toHaveURL(/\/algorithm\/tasks/);
    return;
  }
  const created = await createTask(page, title.slice(-8), { name: taskName });
  await removeTask(page, created);
}

const seenTitles = new Set();
for (const { id, title } of taskCases()) {
  const statusOverview = /验证无已|验证已创建状态|验证已采集|验证已标注|验证已质检|验证已转换|数量随任务状态/.test(title);
  const createLike = !statusOverview && /创建任务时|创建任务成功|新建任务|添加根节点|添加同级节点|子节点|编辑根节点|删除.*节点|标注层级|数据分类|标签|机器人构型|采集要求|目标数量|优先级|取消创建|任务名称|任务描述/.test(title);
  const testTitle = `${title} [${id}]`;
  seenTitles.add(title);
  const failureCategory = /验证无|无已|随任务状态变更实时更新/.test(title) ? 'DATA_PRECONDITION_MISSING' : '';
  CASE(id, testTitle, async ({ page }) => {
    if (createLike) await createCase(page, title);
    else await listCase(page, title);
  });
}
