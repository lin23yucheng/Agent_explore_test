const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const {
  clickTagQuery, openTagsPage, tagColumnTexts, tagRowByName, tagSearchInput,
} = require('../helpers/tags');

caseTest('CASE-000390', '标签管理 - 按标签名称模糊搜索 [CASE-000390]', async ({ page }) => {
  await openTagsPage(page);
  await tagSearchInput(page).fill('质量');
  await clickTagQuery(page);
  await expect(tagSearchInput(page)).toHaveValue('质量');
  const names = await tagColumnTexts(page, 0);
  expect(names.length).toBeGreaterThan(0);
  expect(names.every((name) => name.includes('质量'))).toBeTruthy();
  await expect(tagRowByName(page, '训练')).toHaveCount(0);
}, 'not-applicable');
