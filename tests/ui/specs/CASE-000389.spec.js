const { test, expect } = require('@playwright/test');
const { withCleanupStatus } = require('../helpers/case-test');
const { openRolesPage } = require('../helpers/roles');

test('角色管理 › 验证列表页无删除角色入口 [CASE-000389]', { annotation: { type: 'case', description: 'CASE-000389' } }, withCleanupStatus(async ({ page }) => {
  const rows = await openRolesPage(page);
  await expect(rows.getByRole('button', { name: /删除/ })).toHaveCount(0);
  await expect(rows.getByRole('link', { name: /删除/ })).toHaveCount(0);
  await expect(rows.getByText('删除', { exact: true })).toHaveCount(0);
}, 'not-applicable'));
