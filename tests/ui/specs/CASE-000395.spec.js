const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const {
  clickTagQuery, expectTagCategoryOptions, openTagsPage,
  selectTagCategoryFilter, tagColumnTexts,
} = require('../helpers/tags');

caseTest('CASE-000395', '标签管理 - 按分类“其他”查询标签列表 [CASE-000395]', async ({ page }) => {
  await openTagsPage(page);
  await expectTagCategoryOptions(page);
  await selectTagCategoryFilter(page, '其他');
  await clickTagQuery(page);
  const categories = await tagColumnTexts(page, 1);
  expect(categories.length).toBeGreaterThan(0);
  expect(categories.every((category) => category === '其他')).toBeTruthy();
}, 'not-applicable');
