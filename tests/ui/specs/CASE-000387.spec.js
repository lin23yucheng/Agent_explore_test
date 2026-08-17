const { test, expect } = require('@playwright/test');
const { withCleanupStatus } = require('../helpers/case-test');
const { openRolesPage } = require('../helpers/roles');

test('角色管理 › 验证列表页无新增角色入口 [CASE-000387]', { annotation: { type: 'case', description: 'CASE-000387' } }, withCleanupStatus(async ({ page }) => {
  await openRolesPage(page);
  await expect(page.getByRole('button', { name: /新增角色|创建角色/ })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /新增角色|创建角色/ })).toHaveCount(0);
  await expect(page.getByText(/新增角色|创建角色/, { exact: true })).toHaveCount(0);
}, 'not-applicable'));
