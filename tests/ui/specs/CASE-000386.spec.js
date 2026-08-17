const { test } = require('@playwright/test');
const { withCleanupStatus } = require('../helpers/case-test');
const { expectRole, openRolesPage, roleRows } = require('../helpers/roles');

test('角色管理 › 验证角色列表展示预设五种角色 [CASE-000386]', { annotation: { type: 'case', description: 'CASE-000386' } }, withCleanupStatus(async ({ page }) => {
  const rows = await openRolesPage(page);
  for (const role of roleRows) await expectRole(rows, role);
}, 'not-applicable'));
