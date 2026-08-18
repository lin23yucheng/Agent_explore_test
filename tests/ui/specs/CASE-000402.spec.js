const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const { clickTagQuery, openTagsPage, tagColumnTexts, tagSearchInput } = require('../helpers/tags');

caseTest('CASE-000402', '标签管理 - 按标签名称模糊查询 [CASE-000402]', async ({ page }) => {
  await openTagsPage(page);
  await tagSearchInput(page).fill('质量');
  await clickTagQuery(page);
  await expect(tagSearchInput(page)).toHaveValue('质量');
  const names = await tagColumnTexts(page, 0);
  expect(names).toEqual(expect.arrayContaining(['高质量', '中等质量', '低质量']));
  expect(names.every((name) => name.includes('质量'))).toBeTruthy();
}, 'not-applicable');
