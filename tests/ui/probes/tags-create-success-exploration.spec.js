const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { test, expect } = require('@playwright/test');
const {
  deleteTagByName,
  expectTagPresent,
  openCreateTagDialog,
  openTagsPage,
  saveTagDialog,
  selectTagDialogCategory,
  tagDialogNameInput,
  tagRowByName,
} = require('../helpers/tags');

const RUN_ID = 'EXPLORATION-20260818-TAGS-STRICT-01';
const EVIDENCE_ROOT = path.resolve(`reports/evidence/${RUN_ID}/create-success`);

function checkpoint(caseId, args) {
  execFileSync('python', [
    'scripts/testflow.py', 'checkpoint-exploration', '--case-id', caseId,
    '--phase', 'steps-in-progress', '--run-id', RUN_ID, ...args,
  ], { cwd: process.cwd(), stdio: 'pipe' });
}

async function exploreCreate(page, results, config) {
  const { caseId, name, category, defaultCategory = false, expectedLength } = config;
  const result = { caseId, status: 'passed', details: {}, error: '', cleanupStatus: 'not-applicable' };
  let created = false;
  try {
    await openTagsPage(page);
    await expectTagPresent(page, name, false);
    const dialog = await openCreateTagDialog(page);
    const input = tagDialogNameInput(page);
    await input.fill(name);
    await expect(input).toHaveValue(name);
    if (expectedLength !== undefined) {
      expect((await input.inputValue()).length).toBe(expectedLength);
    }
    if (defaultCategory) {
      const wrapper = dialog.getByRole('combobox').locator(
        'xpath=ancestor::div[contains(@class,"el-select__wrapper")][1]',
      );
      await expect(wrapper).toContainText('其他');
    } else {
      await selectTagDialogCategory(page, category);
    }
    await saveTagDialog(page);
    await expect(dialog).toBeHidden();
    await expectTagPresent(page, name, true);
    created = true;
    checkpoint(caseId, [
      '--created-data', `标签:${name}；清理入口:标签管理删除`,
      '--note', `创建后列表已出现，实际分类:${category}`,
    ]);
    const row = tagRowByName(page, name);
    const actualCategory = (await row.locator('td').nth(1).innerText()).trim();
    const actualStatus = (await row.locator('td').nth(2).innerText()).trim();
    const creationTime = (await row.locator('td').nth(3).innerText()).trim();
    expect(actualCategory).toBe(category);
    expect(actualStatus).toBe('启用');
    expect(creationTime).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
    result.details = {
      input: name,
      actualLength: name.length,
      category: actualCategory,
      status: actualStatus,
      creationTime,
    };
    const evidence = path.join(EVIDENCE_ROOT, `${caseId}.png`);
    await page.screenshot({ path: evidence, fullPage: true });
    checkpoint(caseId, [
      '--evidence', path.relative(process.cwd(), evidence).replace(/\\/g, '/'),
    ]);
  } catch (error) {
    result.status = 'failed';
    result.error = error.stack || String(error);
    const evidence = path.join(EVIDENCE_ROOT, `${caseId}-failed.png`);
    await page.screenshot({ path: evidence, fullPage: true }).catch(() => {});
    checkpoint(caseId, [
      '--evidence', path.relative(process.cwd(), evidence).replace(/\\/g, '/'),
      '--note', `创建成功场景探索异常:${result.error.slice(0, 500)}`,
    ]);
  } finally {
    if (created) {
      try {
        await deleteTagByName(page, name);
        await expectTagPresent(page, name, false);
        result.cleanupStatus = 'passed';
        checkpoint(caseId, [
          '--cleanup-status', 'passed',
          '--note', `已删除标签${name}并反查不存在`,
        ]);
      } catch (cleanupError) {
        result.status = 'failed';
        result.cleanupStatus = 'failed';
        result.error += `\n清理失败:${cleanupError.stack || cleanupError}`;
        checkpoint(caseId, [
          '--cleanup-status', 'failed',
          '--note', `清理失败:${String(cleanupError).slice(0, 500)}`,
        ]);
      }
    }
    results.push(result);
  }
}

test('标签管理创建成功CASE直接探索', async ({ page }) => {
  test.setTimeout(300_000);
  fs.mkdirSync(EVIDENCE_ROOT, { recursive: true });
  const results = [];
  const configs = [
    { caseId: 'CASE-000406', name: 'Z', category: '质量', expectedLength: 1 },
    { caseId: 'CASE-000407', name: `AI${'7'.repeat(30)}`, category: '其他', expectedLength: 32 },
    { caseId: 'CASE-000410', name: 'AI标签ABC123410', category: '质量' },
    { caseId: 'CASE-000413', name: '艾测四一三', category: '其他' },
    { caseId: 'CASE-000414', name: 'AICASEFOURONEFOUR', category: '质量' },
    { caseId: 'CASE-000415', name: '41520260818', category: '其他' },
    { caseId: 'CASE-000416', name: 'AI20260818C416', category: '其他', defaultCategory: true },
    { caseId: 'CASE-000417', name: 'AI417质量标签', category: '质量' },
    { caseId: 'CASE-000423', name: 'AI测试标签123423', category: '质量' },
    { caseId: 'CASE-000424', name: '标', category: '其他', expectedLength: 1 },
    { caseId: 'CASE-000425', name: `AI${'5'.repeat(30)}`, category: '其他', expectedLength: 32 },
    { caseId: 'CASE-000430', name: 'AI测试标签A430', category: '质量' },
    { caseId: 'CASE-000431', name: 'AI测试标签B431', category: '其他' },
  ];
  for (const config of configs) {
    await exploreCreate(page, results, config);
  }
  fs.writeFileSync(
    path.join(EVIDENCE_ROOT, 'create-success-results.json'),
    JSON.stringify(results, null, 2),
    'utf8',
  );
});
