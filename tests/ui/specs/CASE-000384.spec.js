const { test } = require('@playwright/test');
const { withCleanupStatus } = require('../helpers/case-test');
const { expectRole, openRolesPage, roleRows } = require('../helpers/roles');

test('角色管理 › 查看标注工程师角色详情 [CASE-000384]', { annotation: { type: 'case', description: 'CASE-000384' } }, withCleanupStatus(async ({ page }) => {
  const rows = await openRolesPage(page);
  await expectRole(rows, roleRows[3]);
}, 'not-applicable'));
