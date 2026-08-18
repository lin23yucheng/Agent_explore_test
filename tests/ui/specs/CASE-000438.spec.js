const { expect } = require('@playwright/test');
const { caseTest } = require('../helpers/case-test');
const { openTagsPage, tagColumnTexts } = require('../helpers/tags');

caseTest('CASE-000438', '标签管理 - 列表页更新时间显示格式验证 [CASE-000438]', async ({ page }) => {
  await openTagsPage(page);
  const values = await tagColumnTexts(page, 4);
  expect(values.length).toBeGreaterThan(0);
  expect(values.every((value) => /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(value))).toBeTruthy();
}, 'not-applicable');
