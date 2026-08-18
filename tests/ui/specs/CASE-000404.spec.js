const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const { clickTagQuery, openTagsPage, tagColumnTexts, tagRows, tagSearchInput } = require('../helpers/tags');
caseTest('CASE-000404', '标签管理 - 查询条件为空显示全部 [CASE-000404]', async ({ page }) => {
  await openTagsPage(page); await expect(tagRows(page).first()).toBeVisible();
  const initialCount = await tagRows(page).count(); await expect(tagSearchInput(page)).toHaveValue('');
  await clickTagQuery(page); await expect(tagRows(page)).toHaveCount(initialCount);
  const creationTimes = await tagColumnTexts(page, 3); expect(creationTimes).toEqual([...creationTimes].sort().reverse());
}, 'not-applicable');
