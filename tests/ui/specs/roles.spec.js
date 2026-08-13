const { test, expect } = require('@playwright/test');

const ROLE_EXPECTATIONS = {
  admin: { name: '管理员', description: '所有权限' },
  algorithm_engineer: { name: '算法工程师', description: '工作台、任务管理、数据转换、数据可视化权限' },
  collection_engineer: { name: '采集工程师', description: '工作台、我的采集权限' },
  annotation_engineer: { name: '标注工程师', description: '工作台、我的标注权限' },
  qc_engineer: { name: '质检工程师', description: '工作台、我的质检权限' },
};

async function loginAndOpenRoles(page) {
  await page.goto('/');
  const username = page.locator('input').first();
  const password = page.locator('input[type="password"]').first();
  await username.fill(process.env.UI_USERNAME || 'admin');
  await password.fill(process.env.UI_PASSWORD || '123456');
  await page.getByRole('button', { name: /登录|登錄/ }).click();
  await expect(page.getByText('角色管理', { exact: true }).first()).toBeVisible({ timeout: 20_000 });
  await page.getByText('角色管理', { exact: true }).first().click();
  await expect(page).toHaveURL(/role|角色/i);
  const headers = page.getByRole('columnheader');
  await expect(headers).toContainText(['角色编码', '角色名称', '描述', '状态']);
  for (const code of Object.keys(ROLE_EXPECTATIONS)) {
    await expect(roleRow(page, code)).toBeVisible();
  }
}

function roleRow(page, code) {
  return page.locator('tr').filter({ hasText: code }).first();
}

async function assertRole(page, caseId, code) {
  await test.step(`${caseId}: 验证 ${code} 角色字段`, async () => {
    const row = roleRow(page, code);
    await expect(row).toBeVisible();
    const expected = ROLE_EXPECTATIONS[code];
    await expect(row).toContainText(expected.name);
    await expect(row).toContainText(expected.description);
    await expect(row).toContainText(/启用|正常|active/i);
  });
}

test('角色管理 - 查看admin角色编码、名称、描述和状态', { annotation: { type: 'case', description: 'CASE-000381' } }, async ({ page }) => {
  await loginAndOpenRoles(page);
  await assertRole(page, 'CASE-000381', 'admin');
});

test('角色管理 - 查看算法工程师角色信息及权限描述', { annotation: { type: 'case', description: 'CASE-000382' } }, async ({ page }) => {
  await loginAndOpenRoles(page);
  await assertRole(page, 'CASE-000382', 'algorithm_engineer');
});

test('角色管理 - 查看采集工程师角色信息及权限描述', { annotation: { type: 'case', description: 'CASE-000383' } }, async ({ page }) => {
  await loginAndOpenRoles(page);
  await assertRole(page, 'CASE-000383', 'collection_engineer');
});

test('角色管理 - 查看标注工程师角色详情', { annotation: { type: 'case', description: 'CASE-000384' } }, async ({ page }) => {
  await loginAndOpenRoles(page);
  await assertRole(page, 'CASE-000384', 'annotation_engineer');
});

test('角色管理 - 查看质检工程师角色信息及权限描述', { annotation: { type: 'case', description: 'CASE-000385' } }, async ({ page }) => {
  await loginAndOpenRoles(page);
  await assertRole(page, 'CASE-000385', 'qc_engineer');
});

test('角色管理 - 验证角色列表展示预设五种角色', { annotation: { type: 'case', description: 'CASE-000386' } }, async ({ page }) => {
  await loginAndOpenRoles(page);
  for (const code of Object.keys(ROLE_EXPECTATIONS)) {
    await assertRole(page, 'CASE-000386', code);
  }
});

test('角色管理 - 验证列表页无新增角色入口', { annotation: { type: 'case', description: 'CASE-000387' } }, async ({ page }) => {
  await loginAndOpenRoles(page);
  await expect(page.getByRole('button', { name: /新增角色|创建角色/ })).toHaveCount(0);
  await expect(page.getByText(/新增角色|创建角色/)).toHaveCount(0);
});

test('角色管理 - 验证列表页无编辑角色入口', { annotation: { type: 'case', description: 'CASE-000388' } }, async ({ page }) => {
  await loginAndOpenRoles(page);
  const rows = page.locator('tr');
  for (const code of Object.keys(ROLE_EXPECTATIONS)) {
    const row = rows.filter({ hasText: code }).first();
    await expect(row).toBeVisible();
    await expect(row.getByRole('button', { name: /编辑|修改/ })).toHaveCount(0);
    await expect(row.getByText(/编辑|修改/)).toHaveCount(0);
  }
});

test('角色管理 - 验证列表页无删除角色入口', { annotation: { type: 'case', description: 'CASE-000389' } }, async ({ page }) => {
  await loginAndOpenRoles(page);
  const rows = page.locator('tr');
  for (const code of Object.keys(ROLE_EXPECTATIONS)) {
    const row = rows.filter({ hasText: code }).first();
    await expect(row).toBeVisible();
    await expect(row.getByRole('button', { name: /删除|移除/ })).toHaveCount(0);
    await expect(row.getByText(/删除|移除/)).toHaveCount(0);
  }
});
