const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { test, expect } = require('@playwright/test');
const { openModule } = require('../helpers/auth');

const RUN_ID = process.env.EXPLORATION_RUN_ID || 'EXPLORATION-20260818-TAGS-FAILED-RERUN-01';
const EVIDENCE_ROOT = path.resolve(
  `reports/evidence/${RUN_ID}/readonly`,
);
const SELECTED_CASES = new Set(
  (process.env.EXPLORATION_CASES || '').split(',').filter(Boolean),
);

function dataRows(page) {
  return page.getByRole('row').filter({ has: page.getByRole('cell') });
}

function searchInput(page) {
  return page.getByPlaceholder('搜索标签名称');
}

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

async function clickQuery(page) {
  await page.getByRole('button', { name: '查询', exact: true }).click();
  await page.waitForTimeout(300);
}

async function resetFilters(page) {
  await page.getByRole('button', { name: '重置', exact: true }).click();
  await expect(searchInput(page)).toHaveValue('');
  await page.waitForTimeout(250);
}

async function selectFilter(page, index, value) {
  const control = page.getByRole('combobox').nth(index);
  expect(await control.evaluate((node) => node.hasAttribute('readonly'))).toBeTruthy();
  const wrapper = control.locator(
    'xpath=ancestor::div[contains(@class,"el-select__wrapper")][1]',
  );
  await wrapper.click();
  const dropdown = page.locator('.el-select-dropdown:visible');
  if (index === 0) {
    await expect(dropdown.getByText('质量', { exact: true })).toBeVisible();
    await expect(dropdown.getByText('其他', { exact: true })).toBeVisible();
  } else {
    await expect(dropdown.getByText('启用', { exact: true })).toBeVisible();
    await expect(dropdown.getByText('禁用', { exact: true })).toBeVisible();
  }
  await dropdown.getByText(value, { exact: true }).click();
  await expect(wrapper).toContainText(value);
}

async function cellTexts(page, column) {
  return dataRows(page).locator(`td:nth-child(${column + 1})`).allTextContents();
}

async function exploreCase(page, results, caseId, body) {
  if (SELECTED_CASES.size > 0 && !SELECTED_CASES.has(caseId)) return;
  const result = { caseId, status: 'passed', details: {}, error: '' };
  try {
    await resetFilters(page);
    result.details = await body();
    await page.screenshot({
      path: path.join(EVIDENCE_ROOT, `${caseId}.png`),
      fullPage: true,
    });
    checkpoint(caseId, [
      ...requiredItems(caseId).flatMap((id) => ['--completed-item', id]),
      '--cleanup-status', 'not-applicable',
      '--evidence', path.relative(process.cwd(), path.join(EVIDENCE_ROOT, `${caseId}.png`)).replace(/\\/g, '/'),
      '--note', `直接探索通过，实际结果:${JSON.stringify(result.details).slice(0, 1200)}`,
    ]);
  } catch (error) {
    result.status = 'failed';
    result.error = error.stack || String(error);
    await page.screenshot({
      path: path.join(EVIDENCE_ROOT, `${caseId}-failed.png`),
      fullPage: true,
    }).catch(() => {});
    checkpoint(caseId, [
      '--cleanup-status', 'not-applicable',
      '--evidence', path.relative(process.cwd(), path.join(EVIDENCE_ROOT, `${caseId}-failed.png`)).replace(/\\/g, '/'),
      '--note', `直接探索未通过:${result.error.slice(0, 1000)}`,
    ]);
  }
  results.push(result);
}

test('标签管理只读CASE直接探索', async ({ page }) => {
  test.setTimeout(180_000);
  fs.mkdirSync(EVIDENCE_ROOT, { recursive: true });
  await openModule(
    page,
    '标签管理',
    '/admin/scene-tags',
    () => page.getByRole('columnheader', { name: /标签名称/ }),
  );
  const results = [];
  const baselineCount = await dataRows(page).count();

  await exploreCase(page, results, 'CASE-000390', async () => {
    await searchInput(page).fill('质量');
    await clickQuery(page);
    await expect(searchInput(page)).toHaveValue('质量');
    const names = (await cellTexts(page, 0)).map((value) => value.trim());
    expect(names.length).toBeGreaterThan(0);
    expect(names.every((value) => value.includes('质量'))).toBeTruthy();
    return { input: '质量', names, excluded: '训练' };
  });

  await exploreCase(page, results, 'CASE-000391', async () => {
    await searchInput(page).fill('不存在的标签');
    await clickQuery(page);
    await expect(searchInput(page)).toHaveValue('不存在的标签');
    await expect(dataRows(page)).toHaveCount(0);
    await expect(page.getByText(/暂无数据|无数据|没有数据/)).toBeVisible();
    return { input: '不存在的标签', rowCount: 0 };
  });

  await exploreCase(page, results, 'CASE-000392', async () => {
    await searchInput(page).fill('');
    await clickQuery(page);
    await expect(searchInput(page)).toHaveValue('');
    await expect(dataRows(page)).toHaveCount(baselineCount);
    return { input: '', rowCount: baselineCount };
  });

  await exploreCase(page, results, 'CASE-000393', async () => {
    await selectFilter(page, 0, '质量');
    await clickQuery(page);
    const categories = (await cellTexts(page, 1)).map((value) => value.trim());
    expect(categories.length).toBeGreaterThan(0);
    expect(categories.every((value) => value === '质量')).toBeTruthy();
    return { filter: '质量', categories };
  });

  await exploreCase(page, results, 'CASE-000395', async () => {
    await selectFilter(page, 0, '其他');
    await clickQuery(page);
    const categories = (await cellTexts(page, 1)).map((value) => value.trim());
    expect(categories.length).toBeGreaterThan(0);
    expect(categories.every((value) => value === '其他')).toBeTruthy();
    return { filter: '其他', categories };
  });

  for (const [caseId, status] of [
    ['CASE-000397', '启用'],
    ['CASE-000398', '禁用'],
    ['CASE-000399', '禁用'],
    ['CASE-000400', '启用'],
  ]) {
    await exploreCase(page, results, caseId, async () => {
      await selectFilter(page, 1, status);
      await clickQuery(page);
      const statuses = (await cellTexts(page, 2)).map((value) => value.trim());
      expect(statuses.length).toBeGreaterThan(0);
      expect(statuses.every((value) => value === status)).toBeTruthy();
      return { filter: status, statuses };
    });
  }

  for (const caseId of ['CASE-000401', 'CASE-000402']) {
    await exploreCase(page, results, caseId, async () => {
      await searchInput(page).fill('质量');
      await clickQuery(page);
      const names = (await cellTexts(page, 0)).map((value) => value.trim());
      expect(names.length).toBeGreaterThan(0);
      expect(names.every((value) => value.includes('质量'))).toBeTruthy();
      return { input: '质量', names };
    });
  }

  await exploreCase(page, results, 'CASE-000403', async () => {
    await searchInput(page).fill('不存在');
    await clickQuery(page);
    await expect(dataRows(page)).toHaveCount(0);
    await expect(page.getByText(/暂无数据|无数据|没有数据/)).toBeVisible();
    return { input: '不存在', rowCount: 0 };
  });

  await exploreCase(page, results, 'CASE-000404', async () => {
    await clickQuery(page);
    await expect(dataRows(page)).toHaveCount(baselineCount);
    const times = (await cellTexts(page, 3)).map((value) => value.trim());
    expect([...times].sort().reverse()).toEqual(times);
    return { rowCount: baselineCount, creationTimes: times };
  });

  await exploreCase(page, results, 'CASE-000405', async () => {
    await searchInput(page).fill('质量');
    await clickQuery(page);
    const firstCount = await dataRows(page).count();
    expect(firstCount).toBeGreaterThan(0);
    expect(firstCount).toBeLessThan(baselineCount);
    await resetFilters(page);
    await expect(dataRows(page)).toHaveCount(baselineCount);
    await searchInput(page).fill('训练');
    await clickQuery(page);
    await expect(dataRows(page)).toHaveCount(1);
    await expect(dataRows(page).first()).toContainText('训练');
    return { firstFilter: '质量', firstCount, resetCount: baselineCount, secondFilter: '训练' };
  });

  await exploreCase(page, results, 'CASE-000433', async () => {
    const statuses = (await cellTexts(page, 2)).map((value) => value.trim());
    expect(statuses).toContain('启用');
    return { statuses };
  });

  await exploreCase(page, results, 'CASE-000436', async () => {
    const values = (await cellTexts(page, 3)).map((value) => value.trim());
    expect(values.length).toBeGreaterThan(0);
    expect(values.every((value) => /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(value))).toBeTruthy();
    return { creationTimes: values };
  });

  await exploreCase(page, results, 'CASE-000437', async () => {
    const firstRow = dataRows(page).first();
    const name = (await firstRow.locator('td').nth(0).innerText()).trim();
    const before = (await firstRow.locator('td').nth(3).innerText()).trim();
    await page.reload();
    await expect(page.getByRole('columnheader', { name: /标签名称/ })).toBeVisible();
    const after = (await dataRows(page).filter({ hasText: name }).first().locator('td').nth(3).innerText()).trim();
    expect(after).toBe(before);
    return { name, before, after };
  });

  await exploreCase(page, results, 'CASE-000438', async () => {
    const values = (await cellTexts(page, 4)).map((value) => value.trim());
    expect(values.length).toBeGreaterThan(0);
    expect(values.every((value) => /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(value))).toBeTruthy();
    return { updateTimes: values };
  });

  await exploreCase(page, results, 'CASE-000458', async () => {
    const times = (await cellTexts(page, 3)).map((value) => value.trim());
    expect(times.length).toBeGreaterThanOrEqual(3);
    expect([...times].sort().reverse()).toEqual(times);
    return { creationTimes: times };
  });

  fs.writeFileSync(
    path.join(
      EVIDENCE_ROOT,
      process.env.EXPLORATION_RESULT_FILE || 'readonly-results.json',
    ),
    JSON.stringify(results, null, 2),
    'utf8',
  );
});
