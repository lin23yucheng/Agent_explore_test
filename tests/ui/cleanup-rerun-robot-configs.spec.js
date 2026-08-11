const { test, expect } = require('@playwright/test');
const { login } = require('./helpers/auth');

test('清理重跑批次创建的AI机器人构型', async ({ page }) => {
  await login(page);
  await page.getByText('机器人构型配置', { exact: true }).click();
  await expect(page.getByRole('button', { name: '新建构型', exact: true })).toBeVisible();
  for (;;) {
    const rows = page.locator('tbody tr:visible');
    const count = await rows.count();
    let removed = false;
    for (let index = 0; index < count; index += 1) {
      const current = rows.nth(index);
      const name = (await current.locator('td').first().innerText()).trim();
      if (!name.startsWith('AI')) continue;
      await current.getByRole('button', { name: '删除', exact: true }).click();
      const dialog = page.getByRole('dialog').last();
      await dialog.getByRole('button', { name: /确认|确定/ }).click();
      await expect(page.locator('td:first-child').filter({ hasText: new RegExp(`^${name.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}$`) })).toHaveCount(0);
      removed = true;
      break;
    }
    if (!removed) break;
  }
  const remaining = await page.locator('tbody tr:visible td:first-child').allTextContents();
  expect(remaining.filter((name) => name.trim().startsWith('AI'))).toEqual([]);
});
