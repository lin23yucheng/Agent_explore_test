const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const { openTagsPage, tagColumnTexts, tagRows } = require('../helpers/tags');

caseTest('CASE-000436', '标签管理 - 列表页创建时间显示年月日时分 [CASE-000436]', async ({ page }) => {
  await openTagsPage(page);
  await expect(tagRows(page).first()).toBeVisible();
  const values = await tagColumnTexts(page, 3);
  expect(values.length).toBeGreaterThan(0);
  expect(values.every((value) => /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(value))).toBeTruthy();
}, 'not-applicable');
