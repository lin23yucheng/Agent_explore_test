const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { test, expect } = require('@playwright/test');
const {
  cancelTagDialog,
  deleteTagByName,
  expectTagPresent,
  openCreateTagDialog,
  openTagsPage,
  saveTagDialog,
  selectTagDialogCategory,
  tagDialogNameInput,
  tagRowByName,
} = require('../helpers/tags');

const RUN_ID = process.env.EXPLORATION_RUN_ID || 'EXPLORATION-20260818-TAGS-FAILED-RERUN-01';
const EVIDENCE_ROOT = path.resolve(`reports/evidence/${RUN_ID}/validation-cancel`);

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

async function visibleFeedback(page) {
  const formErrors = await page.locator('.el-form-item__error:visible').allTextContents();
  const messages = await page.locator('.el-message:visible, .el-notification:visible').allTextContents();
  return {
    formErrors: formErrors.map((text) => text.trim()).filter(Boolean),
    messages: messages.map((text) => text.trim()).filter(Boolean),
  };
}

async function saveAndObserve(page, originalInput) {
  const input = tagDialogNameInput(page);
  const actualInput = await input.inputValue();
  await saveTagDialog(page);
  const dialogVisible = await page.getByRole('dialog').isVisible().catch(() => false);
  const feedback = await visibleFeedback(page);
  const originalCount = originalInput ? await tagRowByName(page, originalInput).count() : 0;
  const actualCount = actualInput ? await tagRowByName(page, actualInput).count() : 0;
  return { originalInput, actualInput, dialogVisible, originalCount, actualCount, ...feedback };
}

async function ensureBaselineTag(page, name) {
  await openTagsPage(page);
  if (await tagRowByName(page, name).count()) return false;
  await openCreateTagDialog(page);
  await tagDialogNameInput(page).fill(name);
  await selectTagDialogCategory(page, '质量');
  await saveTagDialog(page);
  await expectTagPresent(page, name, true);
  return true;
}

async function exploreInvalid(page, result, config) {
  const { input, category = '质量', maxLengthCase = false } = config;
  await openTagsPage(page);
  await openCreateTagDialog(page);
  if (input) await tagDialogNameInput(page).fill(input);
  await selectTagDialogCategory(page, category);
  const observed = await saveAndObserve(page, input);
  result.details = observed;

  const invalidValuePersisted = input && observed.actualInput === input && observed.originalCount > 0;
  const truncatedAndBounded = maxLengthCase
    && observed.actualInput !== input
    && observed.actualInput.length <= 32;
  const blocked = observed.dialogVisible || observed.formErrors.length > 0 || observed.messages.length > 0;
  expect(invalidValuePersisted, `非法原值不应创建成功: ${input}`).toBeFalsy();
  expect(blocked || truncatedAndBounded, '提交应被阻止，或控件应把超长输入限制为32字符').toBeTruthy();
  if (config.expectedFeedback) {
    expect([...observed.formErrors, ...observed.messages].join(' ')).toMatch(config.expectedFeedback);
  }

  if (observed.actualCount > 0 && observed.actualInput !== input) {
    result.createdData.push(`标签:${observed.actualInput}；由超长输入截断产生；清理入口:标签管理删除`);
    await deleteTagByName(page, observed.actualInput);
    await expectTagPresent(page, observed.actualInput, false);
    result.cleanupStatus = 'passed';
  }
  if (await page.getByRole('dialog').isVisible().catch(() => false)) {
    await cancelTagDialog(page);
  }
}

async function exploreDuplicate(page, result) {
  const name = '测试标签';
  const baselineCreated = await ensureBaselineTag(page, name);
  if (baselineCreated) result.createdData.push(`标签:${name}；重复校验基准；清理入口:标签管理删除`);
  try {
    await openCreateTagDialog(page);
    await tagDialogNameInput(page).fill(name);
    await selectTagDialogCategory(page, '质量');
    const observed = await saveAndObserve(page, name);
    observed.finalCount = await tagRowByName(page, name).count();
    result.details = observed;
    expect(observed.finalCount).toBe(1);
    expect(observed.dialogVisible || observed.formErrors.length > 0 || observed.messages.length > 0).toBeTruthy();
    if (await page.getByRole('dialog').isVisible().catch(() => false)) await cancelTagDialog(page);
  } finally {
    if (baselineCreated) {
      await deleteTagByName(page, name);
      await expectTagPresent(page, name, false);
      result.cleanupStatus = 'passed';
    }
  }
}

async function exploreCancel(page, result, config) {
  const { name, reopen = false } = config;
  await openTagsPage(page);
  await expectTagPresent(page, name, false);
  await openCreateTagDialog(page);
  await tagDialogNameInput(page).fill(name);
  await selectTagDialogCategory(page, reopen ? '其他' : '质量');
  await cancelTagDialog(page);
  await expectTagPresent(page, name, false);
  result.details = { name, saved: false };
  if (reopen) {
    const dialog = await openCreateTagDialog(page);
    result.details.reopenedInput = await tagDialogNameInput(page).inputValue();
    const wrapper = dialog.getByRole('combobox').locator(
      'xpath=ancestor::div[contains(@class,"el-select__wrapper")][1]',
    );
    result.details.reopenedCategory = (await wrapper.innerText()).trim();
    expect(result.details.reopenedInput).toBe('');
    expect(result.details.reopenedCategory).toContain('其他');
    await cancelTagDialog(page);
  }
}

async function exploreRequiredRedError(page, result) {
  await openTagsPage(page);
  await openCreateTagDialog(page);
  await saveTagDialog(page);
  const feedback = await visibleFeedback(page);
  const formItem = tagDialogNameInput(page).locator(
    'xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " el-form-item ")][1]',
  );
  result.details = {
    ...feedback,
    dialogVisible: await page.getByRole('dialog').isVisible(),
    formItemClass: await formItem.getAttribute('class'),
  };
  expect(result.details.dialogVisible).toBeTruthy();
  expect(result.details.formItemClass).toContain('is-error');
  expect(result.details.formErrors.length).toBeGreaterThan(0);
  await cancelTagDialog(page);
}

async function exploreCase(page, results, config) {
  const result = {
    caseId: config.caseId,
    status: 'passed',
    details: {},
    createdData: [],
    error: '',
    cleanupStatus: 'not-applicable',
  };
  const evidence = path.join(EVIDENCE_ROOT, `${config.caseId}.png`);
  try {
    if (config.kind === 'invalid') await exploreInvalid(page, result, config);
    if (config.kind === 'duplicate') await exploreDuplicate(page, result);
    if (config.kind === 'cancel') await exploreCancel(page, result, config);
    if (config.kind === 'required-red') await exploreRequiredRedError(page, result);
    await page.screenshot({ path: evidence, fullPage: true });
    const args = [
      ...requiredItems(config.caseId).flatMap((id) => ['--completed-item', id]),
      '--cleanup-status', result.cleanupStatus,
      '--evidence', path.relative(process.cwd(), evidence).replace(/\\/g, '/'),
      '--note', `直接探索通过，实际结果:${JSON.stringify(result.details).slice(0, 1200)}`,
    ];
    for (const data of result.createdData) args.push('--created-data', data);
    checkpoint(config.caseId, args);
  } catch (error) {
    result.status = 'failed';
    result.error = error.stack || String(error);
    await page.screenshot({ path: evidence, fullPage: true }).catch(() => {});
    checkpoint(config.caseId, [
      '--cleanup-status', result.cleanupStatus,
      '--evidence', path.relative(process.cwd(), evidence).replace(/\\/g, '/'),
      '--note', `直接探索未通过:${result.error.slice(0, 900)}`,
    ]);
  }
  results.push(result);
}

test('标签管理校验与取消CASE直接探索', async ({ page }) => {
  test.setTimeout(360_000);
  fs.mkdirSync(EVIDENCE_ROOT, { recursive: true });
  const results = [];
  const configs = [
    {
      caseId: 'CASE-000408',
      kind: 'invalid',
      input: '',
      expectedFeedback: /请输入标签名称|标签名称长度必须在1到32之间/,
    },
    { caseId: 'CASE-000409', kind: 'invalid', input: `A409${'9'.repeat(29)}`, maxLengthCase: true },
    { caseId: 'CASE-000411', kind: 'invalid', input: '标签@#' },
    { caseId: 'CASE-000412', kind: 'invalid', input: '标签 123' },
    { caseId: 'CASE-000418', kind: 'cancel', name: 'AI取消418' },
    { caseId: 'CASE-000419', kind: 'cancel', name: '临时标签', reopen: true },
    { caseId: 'CASE-000420', kind: 'required-red' },
    { caseId: 'CASE-000422', kind: 'duplicate' },
    { caseId: 'CASE-000426', kind: 'invalid', input: `A426${'6'.repeat(29)}`, maxLengthCase: true },
    { caseId: 'CASE-000427', kind: 'invalid', input: '' },
    { caseId: 'CASE-000428', kind: 'invalid', input: '标签@#' },
    { caseId: 'CASE-000429', kind: 'duplicate' },
  ];
  const requestedCaseIds = new Set(
    (process.env.EXPLORATION_CASES || process.env.TAG_EXPLORATION_CASE_ID || '')
      .split(',').filter(Boolean),
  );
  const selectedConfigs = requestedCaseIds.size
    ? configs.filter((config) => requestedCaseIds.has(config.caseId))
    : configs;
  for (const config of selectedConfigs) await exploreCase(page, results, config);
  const resultFile = process.env.EXPLORATION_RESULT_FILE || 'validation-cancel-results.json';
  fs.writeFileSync(
    path.join(EVIDENCE_ROOT, resultFile),
    JSON.stringify(results, null, 2),
    'utf8',
  );
});
