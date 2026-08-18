const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const {
  clickTagQuery, expectTagStatusOptions, openTagsPage,
  selectTagStatusFilter, tagColumnTexts,
} = require('../helpers/tags');

caseTest('CASE-000398', '标签管理 - 按禁用状态查询仅显示禁用标签 [CASE-000398]', async ({ page }) => {
  await openTagsPage(page);
  await expectTagStatusOptions(page);
  await selectTagStatusFilter(page, '禁用');
  await clickTagQuery(page);
  const statuses = await tagColumnTexts(page, 2);
  expect(statuses.length).toBeGreaterThan(0);
  expect(statuses.every((status) => status === '禁用')).toBeTruthy();
}, 'not-applicable');
