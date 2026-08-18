const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const {
  clickTagQuery, expectTagStatusOptions, openTagsPage,
  selectTagStatusFilter, tagColumnTexts,
} = require('../helpers/tags');

caseTest('CASE-000397', '标签管理 - 按启用状态查询仅显示启用标签 [CASE-000397]', async ({ page }) => {
  await openTagsPage(page);
  await expectTagStatusOptions(page);
  await selectTagStatusFilter(page, '启用');
  await clickTagQuery(page);
  const statuses = await tagColumnTexts(page, 2);
  expect(statuses.length).toBeGreaterThan(0);
  expect(statuses.every((status) => status === '启用')).toBeTruthy();
}, 'not-applicable');
