const { test, expect } = require('@playwright/test');
const { withCleanupStatus } = require('../helpers/case-test');
const { openRolesPage } = require('../helpers/roles');

test('角色管理 › 验证列表页无编辑角色入口 [CASE-000388]', { annotation: { type: 'case', description: 'CASE-000388' } }, withCleanupStatus(async ({ page }) => {
  const rows = await openRolesPage(page);
  await expect(rows.getByRole('button', { name: /编辑/ })).toHaveCount(0);
  await expect(rows.getByRole('link', { name: /编辑/ })).toHaveCount(0);
  await expect(rows.getByText('编辑', { exact: true })).toHaveCount(0);
}, 'not-applicable'));
