const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { test, expect } = require('@playwright/test');
const {
  cancelTagDialog,
  deleteTagByName,
  openCreateTagDialog,
  openEditTagDialog,
  openTagsPage,
  saveTagDialog,
  selectTagDialogCategory,
  tagDialogNameInput,
  tagRowByName,
} = require('../helpers/tags');

const RUN_ID = process.env.EXPLORATION_RUN_ID || 'EXPLORATION-20260818-TAGS-FAILED-RERUN-01';
const EVIDENCE_ROOT = path.resolve(`reports/evidence/${RUN_ID}/mutations`);

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

async function createTag(page, name, category = '质量') {
  await openTagsPage(page);
  await expect(tagRowByName(page, name)).toHaveCount(0);
  await openCreateTagDialog(page);
  await tagDialogNameInput(page).fill(name);
  await selectTagDialogCategory(page, category);
  await saveTagDialog(page);
  await expect(tagRowByName(page, name)).toHaveCount(1);
}

async function createTrackedTag(page, result, name, category = '质量') {
  await createTag(page, name, category);
  result.createdData.push(`标签:${name}；清理入口:标签管理删除`);
  return name;
}

async function capture(page, evidence) {
  if (!fs.existsSync(evidence)) await page.screenshot({ path: evidence, fullPage: true });
}

async function cleanupNames(page, result, names) {
  let cleanupError = null;
  if (await page.getByRole('dialog').isVisible().catch(() => false)) {
    await cancelTagDialog(page).catch(() => {});
  }
  for (const name of [...names].reverse()) {
    if (!name) continue;
    try {
      if (await tagRowByName(page, name).count()) await deleteTagByName(page, name);
      await expect(tagRowByName(page, name)).toHaveCount(0);
    } catch (error) {
      cleanupError = cleanupError || error;
    }
  }
  result.cleanupStatus = cleanupError ? 'failed' : 'passed';
  if (cleanupError) throw cleanupError;
}

async function editName(page, originalName, newName) {
  const dialog = await openEditTagDialog(page, originalName);
  await tagDialogNameInput(page).fill(newName);
  await expect(tagDialogNameInput(page)).toHaveValue(newName);
  await saveTagDialog(page);
  await expect(dialog).toBeHidden();
  await expect(tagRowByName(page, originalName)).toHaveCount(0);
  await expect(tagRowByName(page, newName)).toHaveCount(1);
  return dialog;
}

async function exploreDisable(page, result, evidence, config) {
  const name = await createTrackedTag(page, result, config.name);
  try {
    const row = tagRowByName(page, name);
    await expect(row.locator('td').nth(2)).toHaveText('启用');
    let creationTime = '';
    let initialUpdateTime = '';
    let waitMs = 0;
    if (config.checkTime) {
      creationTime = (await row.locator('td').nth(3).innerText()).trim();
      initialUpdateTime = (await row.locator('td').nth(4).innerText()).trim();
      expect(initialUpdateTime).toBe(creationTime);
      waitMs = Math.max(1500, (62 - new Date().getSeconds()) * 1000);
      await page.waitForTimeout(waitMs);
    }
    await row.getByRole('button', { name: '禁用', exact: true }).click();
    await page.waitForTimeout(300);
    const messages = (await page.locator('.el-message:visible, .el-notification:visible').allTextContents())
      .map((text) => text.trim()).filter(Boolean);
    const dialogVisible = await page.getByRole('dialog').isVisible().catch(() => false);
    const dialogText = dialogVisible ? (await page.getByRole('dialog').innerText()).trim() : '';
    if (dialogVisible) {
      await page.getByRole('dialog').getByRole('button', { name: '确定', exact: true }).click();
    }
    await expect(row.locator('td').nth(2)).toHaveText('禁用');
    await expect(row.getByRole('button', { name: '启用', exact: true })).toBeVisible();
    result.details = { name, dialogVisible, dialogText, messages, status: '禁用' };
    if (config.checkTime) {
      result.details.creationTime = creationTime;
      result.details.initialUpdateTime = initialUpdateTime;
      result.details.updateTime = (await row.locator('td').nth(4).innerText()).trim();
      result.details.waitMs = waitMs;
      expect(result.details.updateTime > creationTime).toBeTruthy();
    }
    await capture(page, evidence);
    if (config.expectDialog === false) {
      expect(dialogVisible, '当前用例明确要求禁用直接生效且无确认弹窗').toBeFalsy();
    } else {
      expect(dialogVisible, '当前用例明确要求禁用确认弹窗').toBeTruthy();
    }
    expect(messages.join(' ')).toMatch(/禁用成功|操作成功|已禁用/);
  } finally {
    await cleanupNames(page, result, [name]);
  }
}

async function exploreEditTime(page, result, evidence) {
  const original = await createTrackedTag(page, result, 'AI439原标签');
  const edited = 'AI439新标签';
  try {
    const beforeRow = tagRowByName(page, original);
    const creationTime = (await beforeRow.locator('td').nth(3).innerText()).trim();
    const initialUpdateTime = (await beforeRow.locator('td').nth(4).innerText()).trim();
    expect(initialUpdateTime).toBe(creationTime);
    const waitMs = 65_000;
    await page.waitForTimeout(waitMs);
    await editName(page, original, edited);
    const afterRow = tagRowByName(page, edited);
    const updateTime = (await afterRow.locator('td').nth(4).innerText()).trim();
    result.details = { original, edited, creationTime, initialUpdateTime, updateTime, waitMs };
    await capture(page, evidence);
    expect(updateTime > creationTime).toBeTruthy();
  } finally {
    await cleanupNames(page, result, [original, edited]);
  }
}

async function exploreCreateTimes(page, result, evidence) {
  const name = await createTrackedTag(page, result, 'AI441时间标签');
  try {
    const row = tagRowByName(page, name);
    const creationTime = (await row.locator('td').nth(3).innerText()).trim();
    const updateTime = (await row.locator('td').nth(4).innerText()).trim();
    result.details = { name, creationTime, updateTime };
    expect(creationTime).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
    expect(updateTime).toBe(creationTime);
    await capture(page, evidence);
  } finally {
    await cleanupNames(page, result, [name]);
  }
}

async function exploreValidEdit(page, result, evidence, config) {
  const original = await createTrackedTag(page, result, config.original);
  try {
    const dialog = await openEditTagDialog(page, original);
    const echoed = await tagDialogNameInput(page).inputValue();
    await tagDialogNameInput(page).fill(config.edited);
    const actualInput = await tagDialogNameInput(page).inputValue();
    if (config.expectedLength !== undefined) expect(actualInput.length).toBe(config.expectedLength);
    await saveTagDialog(page);
    await expect(dialog).toBeHidden();
    await expect(tagRowByName(page, original)).toHaveCount(0);
    const row = tagRowByName(page, config.edited);
    await expect(row).toHaveCount(1);
    result.details = { original, echoed, edited: config.edited, actualInput };
    await capture(page, evidence);
  } finally {
    await cleanupNames(page, result, [config.original, config.edited]);
  }
}

async function exploreInvalidEdit(page, result, evidence, config) {
  const original = await createTrackedTag(page, result, config.original);
  try {
    const dialog = await openEditTagDialog(page, original);
    await tagDialogNameInput(page).fill(config.invalidValue);
    await expect(tagDialogNameInput(page)).toHaveValue(config.invalidValue);
    await saveTagDialog(page);
    const errors = await dialog.locator('.el-form-item__error:visible').allTextContents();
    result.details = {
      original,
      invalidValue: config.invalidValue,
      dialogVisible: await dialog.isVisible(),
      errors: errors.map((text) => text.trim()),
      originalCount: await tagRowByName(page, original).count(),
      invalidCount: config.invalidValue ? await tagRowByName(page, config.invalidValue).count() : 0,
    };
    expect(result.details.dialogVisible).toBeTruthy();
    expect(result.details.errors).toContain(config.expectedError);
    expect(result.details.originalCount).toBe(1);
    expect(result.details.invalidCount).toBe(0);
    await capture(page, evidence);
    await cancelTagDialog(page);
  } finally {
    if (await page.getByRole('dialog').isVisible().catch(() => false)) await cancelTagDialog(page).catch(() => {});
    await cleanupNames(page, result, [original, config.invalidValue]);
  }
}

async function exploreDuplicateEdit(page, result, evidence, config) {
  const first = await createTrackedTag(page, result, '标签A');
  const second = await createTrackedTag(page, result, '标签B');
  try {
    const dialog = await openEditTagDialog(page, first);
    await tagDialogNameInput(page).fill(second);
    await saveTagDialog(page);
    const messages = await page.locator('.el-message:visible').allTextContents();
    const errors = await dialog.locator('.el-form-item__error:visible').allTextContents();
    const formItem = tagDialogNameInput(page).locator(
      'xpath=ancestor::div[contains(concat(" ", normalize-space(@class), " "), " el-form-item ")][1]',
    );
    result.details = {
      first,
      second,
      dialogVisible: await dialog.isVisible(),
      messages: messages.map((text) => text.trim()),
      errors: errors.map((text) => text.trim()),
      formItemClass: await formItem.getAttribute('class'),
      firstCount: await tagRowByName(page, first).count(),
      secondCount: await tagRowByName(page, second).count(),
    };
    expect(result.details.dialogVisible).toBeTruthy();
    expect([...result.details.messages, ...result.details.errors].join(' ')).toContain('标签名已存在');
    if (config.expectRed === false) {
      expect(result.details.formItemClass).not.toContain('is-error');
      expect(result.details.errors).toHaveLength(0);
    } else {
      expect(result.details.formItemClass).toContain('is-error');
      expect(result.details.errors.length).toBeGreaterThan(0);
    }
    expect(result.details.firstCount).toBe(1);
    expect(result.details.secondCount).toBe(1);
    await capture(page, evidence);
    await cancelTagDialog(page);
  } finally {
    if (await page.getByRole('dialog').isVisible().catch(() => false)) await cancelTagDialog(page).catch(() => {});
    await cleanupNames(page, result, [first, second]);
  }
}

async function exploreDelete(page, result, evidence, cancelDelete) {
  const name = await createTrackedTag(page, result, '标签名称');
  try {
    const row = tagRowByName(page, name);
    await row.getByRole('button', { name: '删除', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const dialogText = (await dialog.innerText()).trim();
    expect(dialogText).toContain('确定删除标签');
    expect(dialogText).toContain(name);
    if (cancelDelete) {
      await dialog.getByRole('button', { name: '取消', exact: true }).click();
      await expect(dialog).toBeHidden();
      await expect(tagRowByName(page, name)).toHaveCount(1);
      result.details = { name, dialogText, cancelled: true, finalCount: 1 };
      await capture(page, evidence);
    } else {
      await dialog.getByRole('button', { name: '确定', exact: true }).click();
      await expect(tagRowByName(page, name)).toHaveCount(0);
      await expect(page.locator('.el-message:visible, .el-notification:visible').filter({
        hasText: /删除成功|已删除/,
      })).toBeVisible();
      const messages = (await page.locator('.el-message:visible, .el-notification:visible').allTextContents())
        .map((text) => text.trim()).filter(Boolean);
      result.details = { name, dialogText, messages, confirmed: true, finalCount: 0 };
      expect(messages.join(' ')).toMatch(/删除成功|已删除/);
      await capture(page, evidence);
    }
  } finally {
    await cleanupNames(page, result, [name]);
  }
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
    if (config.kind === 'disable') await exploreDisable(page, result, evidence, config);
    if (config.kind === 'edit-time') await exploreEditTime(page, result, evidence);
    if (config.kind === 'create-times') await exploreCreateTimes(page, result, evidence);
    if (config.kind === 'valid-edit') await exploreValidEdit(page, result, evidence, config);
    if (config.kind === 'invalid-edit') await exploreInvalidEdit(page, result, evidence, config);
    if (config.kind === 'duplicate-edit') await exploreDuplicateEdit(page, result, evidence, config);
    if (config.kind === 'delete') await exploreDelete(page, result, evidence, config.cancelDelete);
    await capture(page, evidence);
    const args = [
      ...requiredItems(config.caseId).flatMap((id) => ['--completed-item', id]),
      '--cleanup-status', result.cleanupStatus,
      '--evidence', path.relative(process.cwd(), evidence).replace(/\\/g, '/'),
      '--note', `直接探索通过，实际结果:${JSON.stringify(result.details).slice(0, 1400)}`,
    ];
    for (const data of result.createdData) args.push('--created-data', data);
    checkpoint(config.caseId, args);
  } catch (error) {
    result.status = 'failed';
    result.error = error.stack || String(error);
    await capture(page, evidence).catch(() => {});
    checkpoint(config.caseId, [
      '--cleanup-status', result.cleanupStatus,
      '--evidence', path.relative(process.cwd(), evidence).replace(/\\/g, '/'),
      '--note', `直接探索未通过:${result.error.slice(0, 1000)}；实际结果:${JSON.stringify(result.details).slice(0, 900)}`,
    ]);
  }
  results.push(result);
}

test('标签管理编辑禁用删除CASE直接探索', async ({ page }) => {
  test.setTimeout(720_000);
  fs.mkdirSync(EVIDENCE_ROOT, { recursive: true });
  const results = [];
  const configs = [
    { caseId: 'CASE-000434', kind: 'disable', name: 'AI434禁用标签' },
    { caseId: 'CASE-000439', kind: 'edit-time' },
    { caseId: 'CASE-000440', kind: 'disable', name: 'AI440时间标签', checkTime: true },
    { caseId: 'CASE-000441', kind: 'create-times' },
    { caseId: 'CASE-000442', kind: 'valid-edit', original: '测试标签', edited: '新标签名' },
    { caseId: 'CASE-000443', kind: 'valid-edit', original: '测试标签', edited: 'A', expectedLength: 1 },
    { caseId: 'CASE-000444', kind: 'valid-edit', original: '测试标签', edited: '12345678901234567890123456789012', expectedLength: 32 },
    { caseId: 'CASE-000445', kind: 'invalid-edit', original: '测试标签', invalidValue: '', expectedError: '请输入标签名称' },
    { caseId: 'CASE-000446', kind: 'invalid-edit', original: '测试标签', invalidValue: '123456789012345678901234567890123', expectedError: '标签名称长度不能超过32位' },
    { caseId: 'CASE-000447', kind: 'valid-edit', original: 'AI447原标签', edited: '新标签123' },
    { caseId: 'CASE-000448', kind: 'valid-edit', original: 'AI448原标签', edited: '标签ABC123' },
    { caseId: 'CASE-000449', kind: 'invalid-edit', original: 'AI449原标签', invalidValue: '标签@#', expectedError: '标签名称仅支持中英文字母、数字' },
    { caseId: 'CASE-000450', kind: 'valid-edit', original: '测试标签', edited: '修改后的标签' },
    { caseId: 'CASE-000451', kind: 'duplicate-edit' },
    { caseId: 'CASE-000454', kind: 'delete', cancelDelete: false },
    { caseId: 'CASE-000455', kind: 'delete', cancelDelete: true },
    { caseId: 'CASE-000537', kind: 'disable', name: 'AI537禁用标签', expectDialog: false },
    { caseId: 'CASE-000538', kind: 'duplicate-edit', expectRed: false },
  ];
  const requestedCaseIds = new Set(
    (process.env.EXPLORATION_CASES || process.env.TAG_EXPLORATION_CASE_ID || '')
      .split(',').filter(Boolean),
  );
  const selectedConfigs = requestedCaseIds.size
    ? configs.filter((config) => requestedCaseIds.has(config.caseId))
    : configs;
  for (const config of selectedConfigs) await exploreCase(page, results, config);
  const resultFile = process.env.EXPLORATION_RESULT_FILE || 'mutation-results.json';
  fs.writeFileSync(
    path.join(EVIDENCE_ROOT, resultFile),
    JSON.stringify(results, null, 2),
    'utf8',
  );
});
