const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const { clickTagQuery, openTagsPage, tagRows, tagSearchInput } = require('../helpers/tags');

caseTest('CASE-000391', '标签管理 - 模糊搜索无匹配结果 [CASE-000391]', async ({ page }) => {
  await openTagsPage(page);
  await tagSearchInput(page).fill('不存在的标签');
  await clickTagQuery(page);
  await expect(tagSearchInput(page)).toHaveValue('不存在的标签');
  await expect(tagRows(page)).toHaveCount(0);
  await expect(page.getByText(/暂无数据|无数据|没有数据/)).toBeVisible();
}, 'not-applicable');
