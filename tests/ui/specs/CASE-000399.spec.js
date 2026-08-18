const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const {
  clickTagQuery, expectTagStatusOptions, openTagsPage,
  selectTagStatusFilter, tagColumnTexts,
} = require('../helpers/tags');

caseTest('CASE-000399', '标签管理 - 禁用状态查询排除启用标签 [CASE-000399]', async ({ page }) => {
  await openTagsPage(page);
  await expectTagStatusOptions(page);
  await selectTagStatusFilter(page, '禁用');
  await clickTagQuery(page);
  const statuses = await tagColumnTexts(page, 2);
  expect(statuses.length).toBeGreaterThan(0);
  expect(statuses).not.toContain('启用');
  expect(statuses.every((status) => status === '禁用')).toBeTruthy();
}, 'not-applicable');
