const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { test, expect } = require('@playwright/test');
const {
  deleteTagByName,
  openCreateTagDialog,
  openEditTagDialog,
  openTagsPage,
  saveTagDialog,
  selectTagDialogCategory,
  tagDialogNameInput,
  tagRowByName,
} = require('../helpers/tags');

const RUN_ID = 'EXPLORATION-20260818-TAGS-STRICT-01';
const EVIDENCE_ROOT = path.resolve(`reports/evidence/${RUN_ID}/references`);
const TAG_NAME = 'AI20260818TAGREF';
const EDITED_TAG_NAME = 'AI20260818TAGREFEDIT';
const TASK_NAME = 'AI20260818TAGREFTASK';
const CASE_IDS = [
  'CASE-000435', 'CASE-000452', 'CASE-000453', 'CASE-000456', 'CASE-000457',
];

function requiredItems(caseId) {
  const contract = JSON.parse(fs.readFileSync(`cases/contracts/${caseId}.json`, 'utf8'));
  return contract.completionGate.requiredCoverageIds;
}

function checkpoint(caseId, args) {
  execFileSync('python', [
    'scripts/testflow.py', 'checkpoint-exploration', '--case-id', caseId,
    '--phase', 'steps-in-progress', '--run-id', RUN_ID, ...args,
  ], { cwd: process.cwd(), stdio: 'pipe' });
}

async function selectElementOption(page, control, option) {
  const wrapper = control.locator(
    'xpath=ancestor::div[contains(@class,"el-select__wrapper")][1]',
  );
  await wrapper.click();
  const dropdown = page.locator('.el-select-dropdown:visible');
  await expect(dropdown).toBeVisible();
  await dropdown.getByText(option, { exact: true }).click();
  await page.keyboard.press('Escape');
  if (await dropdown.isVisible().catch(() => false)) await page.keyboard.press('Escape');
  await expect(dropdown).toBeHidden();
  return wrapper;
}

function taskRowByName(page, name) {
  return page.getByRole('row').filter({
    has: page.getByRole('cell', { name, exact: true }),
  });
}

async function createReferenceTag(page) {
  await openTagsPage(page);
  await expect(tagRowByName(page, TAG_NAME)).toHaveCount(0);
  await openCreateTagDialog(page);
  await tagDialogNameInput(page).fill(TAG_NAME);
  await selectTagDialogCategory(page, '其他');
  await saveTagDialog(page);
  await expect(tagRowByName(page, TAG_NAME)).toHaveCount(1);
}

async function createReferencingTask(page) {
  await page.goto('/algorithm/tasks/create');
  await expect(page.getByRole('button', { name: '创建任务', exact: true })).toBeVisible();
  await page.getByPlaceholder('仅支持中英文字母、数字、_、-').fill(TASK_NAME);
  const comboboxes = page.getByRole('combobox');
  await expect(comboboxes).toHaveCount(3);

  const categoryWrapper = comboboxes.nth(0).locator(
    'xpath=ancestor::div[contains(@class,"el-select__wrapper")][1]',
  );
  if (!(await categoryWrapper.innerText()).includes('f-test-001')) {
    await selectElementOption(page, comboboxes.nth(0), 'f-test-001 - 分类测试勿动');
  }
  const tagWrapper = await selectElementOption(page, comboboxes.nth(1), TAG_NAME);
  await expect(tagWrapper).toContainText(TAG_NAME);

  const robotWrapper = comboboxes.nth(2).locator(
    'xpath=ancestor::div[contains(@class,"el-select__wrapper")][1]',
  );
  await robotWrapper.click();
  const robotDropdown = page.locator('.el-select-dropdown:visible').filter({ hasText: '天机' });
  await expect(robotDropdown).toBeVisible();
  await robotDropdown.locator('.el-select-dropdown__item').filter({ hasText: '天机' }).first().click();
  await expect(robotWrapper).toContainText('天机');

  const targetCount = page.locator('input[type="number"]');
  if (await targetCount.count()) await targetCount.first().fill('1');
  await page.screenshot({ path: path.join(EVIDENCE_ROOT, 'task-create-form.png'), fullPage: true });
  await page.getByRole('button', { name: '创建任务', exact: true }).click();
  await expect(page).toHaveURL(/\/algorithm\/tasks(?:\?.*)?$/);
  await expect(taskRowByName(page, TASK_NAME)).toHaveCount(1);
}

async function deleteReferencingTask(page) {
  await page.goto('/algorithm/tasks');
  await expect(page.getByRole('columnheader', { name: '任务名称' })).toBeVisible();
  await page.waitForTimeout(500);
  const row = taskRowByName(page, TASK_NAME);
  if (!(await row.count())) return;
  await row.getByRole('button', { name: '删除', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText(TASK_NAME);
  await dialog.getByRole('button', { name: '永久删除', exact: true }).click();
  await expect(taskRowByName(page, TASK_NAME)).toHaveCount(0);
}

async function visibleMessages(page) {
  return page.locator('.el-message:visible').allTextContents()
    .then((values) => values.map((value) => value.trim()).filter(Boolean));
}

async function capture(page, caseId) {
  const evidence = path.join(EVIDENCE_ROOT, `${caseId}.png`);
  await page.screenshot({ path: evidence, fullPage: true });
  return path.relative(process.cwd(), evidence).replace(/\\/g, '/');
}

async function exploreDisableReferenced(page, result) {
  await openTagsPage(page);
  const row = tagRowByName(page, TAG_NAME);
  await expect(row.locator('td').nth(2)).toHaveText('启用');
  await row.getByRole('button', { name: '禁用', exact: true }).click();
  await page.waitForTimeout(350);
  const messages = await visibleMessages(page);
  result.details = {
    action: '禁用',
    messages,
    status: (await row.locator('td').nth(2).innerText()).trim(),
  };
  expect(messages.join(' ')).toContain('标签已被任务使用，不允许禁用');
  expect(result.details.status).toBe('启用');
}

async function exploreEditReferenced(page, result) {
  await openTagsPage(page);
  const dialog = await openEditTagDialog(page, TAG_NAME);
  await tagDialogNameInput(page).fill(EDITED_TAG_NAME);
  await expect(tagDialogNameInput(page)).toHaveValue(EDITED_TAG_NAME);
  await saveTagDialog(page);
  const messages = await visibleMessages(page);
  result.details = {
    action: '编辑',
    messages,
    dialogVisible: await dialog.isVisible().catch(() => false),
    originalCount: await tagRowByName(page, TAG_NAME).count(),
    editedCount: await tagRowByName(page, EDITED_TAG_NAME).count(),
  };
  expect(messages.join(' ')).toContain('标签已被任务使用，不允许修改');
  expect(result.details.originalCount).toBe(1);
  expect(result.details.editedCount).toBe(0);
  if (result.details.dialogVisible) {
    await dialog.getByRole('button', { name: '取消', exact: true }).click();
  }
}

async function exploreDeleteReferenced(page, result) {
  await openTagsPage(page);
  const row = tagRowByName(page, TAG_NAME);
  await row.getByRole('button', { name: '删除', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText(`确定删除标签「${TAG_NAME}」吗？`);
  const dialogText = (await dialog.innerText()).trim();
  await dialog.getByRole('button', { name: '确定', exact: true }).click();
  await page.waitForTimeout(350);
  const messages = await visibleMessages(page);
  result.details = {
    action: '删除',
    dialogText,
    messages,
    finalCount: await tagRowByName(page, TAG_NAME).count(),
  };
  expect(messages.join(' ')).toContain('标签已被任务使用，不允许删除');
  expect(result.details.finalCount).toBe(1);
}

async function exploreCase(page, caseId, kind, results) {
  const result = {
    caseId,
    status: 'passed',
    details: {},
    error: '',
    cleanupStatus: 'pending',
  };
  try {
    if (kind === 'disable') await exploreDisableReferenced(page, result);
    if (kind === 'edit') await exploreEditReferenced(page, result);
    if (kind === 'delete') await exploreDeleteReferenced(page, result);
    result.evidence = await capture(page, caseId);
    checkpoint(caseId, [
      ...requiredItems(caseId).flatMap((id) => ['--completed-item', id]),
      '--created-data', `标签:${TAG_NAME}；任务:${TASK_NAME}；清理顺序:先删任务再删标签`,
      '--evidence', result.evidence,
      '--note', `引用关系直接探索通过:${JSON.stringify(result.details).slice(0, 1100)}`,
    ]);
  } catch (error) {
    result.status = 'failed';
    result.error = error.stack || String(error);
    result.evidence = await capture(page, caseId).catch(() => '');
    const args = ['--note', `引用关系直接探索未通过:${result.error.slice(0, 1000)}`];
    if (result.evidence) args.push('--evidence', result.evidence);
    checkpoint(caseId, args);
  }
  results.push(result);
}

test('标签管理任务引用CASE直接探索', async ({ page }) => {
  test.setTimeout(300_000);
  fs.mkdirSync(EVIDENCE_ROOT, { recursive: true });
  const results = [];
  let tagCreated = false;
  let taskCreated = false;
  let cleanupError = null;
  try {
    await createReferenceTag(page);
    tagCreated = true;
    await createReferencingTask(page);
    taskCreated = true;
    await exploreCase(page, 'CASE-000435', 'disable', results);
    await exploreCase(page, 'CASE-000452', 'edit', results);
    await exploreCase(page, 'CASE-000453', 'disable', results);
    await exploreCase(page, 'CASE-000456', 'delete', results);
    await exploreCase(page, 'CASE-000457', 'delete', results);
  } finally {
    try {
      if (taskCreated) await deleteReferencingTask(page);
      if (tagCreated) {
        await openTagsPage(page);
        await deleteTagByName(page, TAG_NAME);
        await expect(tagRowByName(page, TAG_NAME)).toHaveCount(0);
      }
    } catch (error) {
      cleanupError = error;
    }
    for (const result of results) {
      result.cleanupStatus = cleanupError ? 'failed' : 'passed';
      checkpoint(result.caseId, [
        '--cleanup-status', result.cleanupStatus,
        '--note', cleanupError
          ? `引用关系清理失败:${String(cleanupError).slice(0, 700)}`
          : `已删除任务${TASK_NAME}后删除标签${TAG_NAME}，并反查不存在`,
      ]);
      if (cleanupError) result.status = 'failed';
    }
    fs.writeFileSync(
      path.join(EVIDENCE_ROOT, 'reference-results.json'),
      JSON.stringify({ setup: { TAG_NAME, TASK_NAME }, results, cleanupError: cleanupError ? String(cleanupError) : '' }, null, 2),
      'utf8',
    );
  }
});
