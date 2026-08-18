const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const { openTagsPage, tagColumnTexts, tagRows } = require('../helpers/tags');

caseTest('CASE-000433', '标签管理 - 启用状态标签在列表中的展示 [CASE-000433]', async ({ page }) => {
  await openTagsPage(page);
  await expect(tagRows(page).first()).toBeVisible();
  const statuses = await tagColumnTexts(page, 2);
  expect(statuses).toContain('启用');
  expect(statuses.every((status) => ['启用', '禁用'].includes(status))).toBeTruthy();
}, 'not-applicable');
