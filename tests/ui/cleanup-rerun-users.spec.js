const { test, expect } = require('@playwright/test');
const { login } = require('./helpers/auth');

test('清理重跑批次创建的AI用户', async ({ page }) => {
  await login(page);

  await page.goto('/algorithm/tasks');
  await expect(page.getByRole('button', { name: '创建任务', exact: true })).toBeVisible();
  const taskSearch = page.getByPlaceholder('搜索任务名称/编号');
  await taskSearch.fill('AI');
  await page.getByRole('button', { name: '查询', exact: true }).click();
  for (;;) {
    const rows = page.locator('tbody tr:visible');
    const count = await rows.count();
    let removed = false;
    for (let index = 0; index < count; index += 1) {
      const current = rows.nth(index);
      const name = (await current.innerText()).trim();
      if (!name.includes('AI')) continue;
      const operationCell = current.locator('td').last();
      await operationCell.getByRole('button', { name: '删除', exact: true }).click();
      const dialog = page.getByRole('dialog').last();
      await dialog.getByRole('button', { name: '永久删除', exact: true }).click();
      await expect(current).toHaveCount(0);
      removed = true;
      break;
    }
    if (!removed) break;
  }

  await page.getByText('用户管理', { exact: true }).click();
  const search = page.getByPlaceholder('搜索账户和姓名');
  await search.fill('AI');
  await page.getByRole('button', { name: '查询', exact: true }).click();
  await expect(page.locator('tbody tr:visible').first()).toBeVisible();

  for (;;) {
    const rows = page.locator('tbody tr:visible');
    const count = await rows.count();
    let removed = false;
    for (let index = 0; index < count; index += 1) {
      const current = rows.nth(index);
      const account = (await current.locator('td').first().innerText()).trim();
      if (!account.startsWith('AI')) continue;
      await current.getByRole('button', { name: '删除', exact: true }).click();
      const dialog = page.getByRole('dialog').last();
      await dialog.getByRole('button', { name: /确认|确定/ }).click();
      const escaped = account.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      await expect(page.locator('td:first-child').filter({ hasText: new RegExp(`^${escaped}$`) })).toHaveCount(0);
      removed = true;
      break;
    }
    if (!removed) break;
  }

  await search.fill('AI');
  await page.getByRole('button', { name: '查询', exact: true }).click();
  await expect(page.locator('tbody tr:visible').first()).toBeVisible();
  const remaining = await page.locator('tbody tr:visible td:first-child').allTextContents();
  expect(remaining.filter((account) => account.trim().startsWith('AI'))).toEqual([]);
});
