const { test } = require('@playwright/test');
const { withCleanupStatus } = require('../helpers/case-test');
const { expectRole, openRolesPage, roleRows } = require('../helpers/roles');

test('角色管理 › 查看算法工程师角色信息及权限描述 [CASE-000382]', { annotation: { type: 'case', description: 'CASE-000382' } }, withCleanupStatus(async ({ page }) => {
  const rows = await openRolesPage(page);
  await expectRole(rows, roleRows[1]);
}, 'not-applicable'));
