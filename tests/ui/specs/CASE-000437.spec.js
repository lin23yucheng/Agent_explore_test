const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const { openTagsPage, tagRowByName, tagRows } = require('../helpers/tags');

caseTest('CASE-000437', '标签管理 - 新增标签后创建时间保持不变 [CASE-000437]', async ({ page }) => {
  await openTagsPage(page);
  const firstRow = tagRows(page).first();
  const name = (await firstRow.locator('td').nth(0).innerText()).trim();
  const before = (await firstRow.locator('td').nth(3).innerText()).trim();
  await page.reload();
  await expect(page.getByRole('columnheader', { name: /标签名称/ })).toBeVisible();
  const after = (await tagRowByName(page, name).locator('td').nth(3).innerText()).trim();
  expect(after).toBe(before);
}, 'not-applicable');
