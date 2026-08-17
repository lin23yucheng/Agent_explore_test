const { test } = require('@playwright/test');
const { withCleanupStatus } = require('../helpers/case-test');
const { expectRole, openRolesPage, roleRows } = require('../helpers/roles');

test('角色管理 › 查看admin角色编码、名称、描述和状态 [CASE-000381]', { annotation: { type: 'case', description: 'CASE-000381' } }, withCleanupStatus(async ({ page }) => {
  const rows = await openRolesPage(page);
  await expectRole(rows, roleRows[0]);
}, 'not-applicable'));
