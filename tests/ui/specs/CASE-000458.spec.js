const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const { openTagsPage, tagColumnTexts } = require('../helpers/tags');

caseTest('CASE-000458', '标签管理 - 验证列表按创建时间倒序排列 [CASE-000458]', async ({ page }) => {
  await openTagsPage(page);
  const creationTimes = await tagColumnTexts(page, 3);
  expect(creationTimes.length).toBeGreaterThanOrEqual(3);
  expect(creationTimes).toEqual([...creationTimes].sort().reverse());
}, 'not-applicable');
