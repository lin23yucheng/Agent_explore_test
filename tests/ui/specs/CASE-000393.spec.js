const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const {
  clickTagQuery, expectTagCategoryOptions, openTagsPage,
  selectTagCategoryFilter, tagColumnTexts,
} = require('../helpers/tags');

caseTest('CASE-000393', '标签管理 - 按质量分类查询标签列表 [CASE-000393]', async ({ page }) => {
  await openTagsPage(page);
  await expectTagCategoryOptions(page);
  await selectTagCategoryFilter(page, '质量');
  await clickTagQuery(page);
  const categories = await tagColumnTexts(page, 1);
  expect(categories.length).toBeGreaterThan(0);
  expect(categories.every((category) => category === '质量')).toBeTruthy();
}, 'not-applicable');
