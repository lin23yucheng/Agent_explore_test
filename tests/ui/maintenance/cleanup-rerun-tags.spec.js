const { test, expect } = require('@playwright/test');
const { openModule } = require('../helpers/auth');

// Maintenance-only cleanup. This file is outside playwright.config.js testMatch.
test('清理标签管理模块遗留的AI测试数据', async ({ page }) => {
  test.setTimeout(300_000);
  await openModule(page, '标签管理', '/admin/scene-tags', () => page.getByRole('button', { name: '新建标签', exact: true }));

  const pageSize = page.locator('.el-pagination .el-select');
  if (await pageSize.count()) {
    await pageSize.click();
    await page.getByRole('option', { name: '100条/页', exact: true }).click();
    await expect(pageSize).toContainText('100条/页');
  }

  for (;;) {
    const rows = page.locator('tbody tr:visible');
    const count = await rows.count();
    let removed = false;
    for (let index = 0; index < count; index += 1) {
      const row = rows.nth(index);
      const name = (await row.locator('td').first().innerText()).trim();
      if (!name.startsWith('AI')) continue;

      await row.getByRole('button', { name: '删除', exact: true }).click();
      const dialog = page.getByRole('dialog').last();
      await dialog.getByRole('button', { name: /确认|确定/ }).click();
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      await expect(page.locator('tbody tr td:first-child').filter({ hasText: new RegExp(`^${escaped}$`) })).toHaveCount(0);
      removed = true;
      break;
    }
    if (!removed) break;
  }

  const remaining = (await page.locator('tbody tr:visible td:first-child').allTextContents())
    .map((value) => value.trim())
    .filter((value) => value.startsWith('AI'));
  expect(remaining).toEqual([]);
});
