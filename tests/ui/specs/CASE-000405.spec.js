const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const { clickTagQuery, openTagsPage, resetTagFilters, tagRows, tagSearchInput } = require('../helpers/tags');
caseTest('CASE-000405', '标签管理 - 重置后回到默认为空并查询 [CASE-000405]', async ({ page }) => {
  await openTagsPage(page); await expect(tagRows(page).first()).toBeVisible(); const initialCount = await tagRows(page).count();
  await tagSearchInput(page).fill('质量'); await clickTagQuery(page); const filteredCount = await tagRows(page).count();
  expect(filteredCount).toBeGreaterThan(0); expect(filteredCount).toBeLessThan(initialCount); await resetTagFilters(page);
  await expect(tagRows(page)).toHaveCount(initialCount); await tagSearchInput(page).fill('训练'); await clickTagQuery(page);
  await expect(tagRows(page)).toHaveCount(1); await expect(tagRows(page).first()).toContainText('训练');
}, 'not-applicable');
