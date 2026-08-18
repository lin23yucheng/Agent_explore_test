const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const {
  clickTagQuery, expectTagStatusOptions, openTagsPage,
  selectTagStatusFilter, tagColumnTexts,
} = require('../helpers/tags');

caseTest('CASE-000400', '标签管理 - 启用状态查询排除禁用标签 [CASE-000400]', async ({ page }) => {
  await openTagsPage(page);
  await expectTagStatusOptions(page);
  await selectTagStatusFilter(page, '启用');
  await clickTagQuery(page);
  const statuses = await tagColumnTexts(page, 2);
  expect(statuses.length).toBeGreaterThan(0);
  expect(statuses).not.toContain('禁用');
  expect(statuses.every((status) => status === '启用')).toBeTruthy();
}, 'not-applicable');
