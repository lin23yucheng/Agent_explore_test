const { test, expect } = require('@playwright/test');
const { login } = require('../helpers/auth');

async function useLargestPage(page) {
  const pageSize = page.locator('.el-pagination .el-select');
  if (!await pageSize.count()) return;
  if (await pageSize.getByText('100条/页', { exact: true }).count()) return;
  await pageSize.click();
  await page.getByRole('option', { name: '100条/页', exact: true }).click();
  await expect(pageSize).toContainText('100条/页');
}

test('清理重跑批次创建的AI用户', async ({ page }) => {
  await login(page);

  await page.goto('/algorithm/tasks');
  await expect(page.getByRole('button', { name: '创建任务', exact: true })).toBeVisible();
  const taskSearch = page.getByPlaceholder('搜索任务名称/编号');
  await taskSearch.fill('AI');
  await page.getByRole('button', { name: '查询', exact: true }).click();
  await useLargestPage(page);
  for (;;) {
    const rows = page.locator('tbody tr:visible');
    const count = await rows.count();
    let removed = false;
    for (let index = 0; index < count; index += 1) {
      const current = rows.nth(index);
      const name = (await current.innerText()).trim();
      if (!name.includes('AI')) continue;
      const taskId = (await current.locator('td').first().innerText()).trim();
      const operationCell = current.locator('td').last();
      await operationCell.getByRole('button', { name: '删除', exact: true }).click();
      const dialog = page.getByRole('dialog').last();
      await dialog.getByRole('button', { name: '永久删除', exact: true }).click();
      await expect(page.locator('tbody tr:visible').filter({
        has: page.locator('td:first-child').filter({ hasText: new RegExp(`^${taskId}$`) }),
      })).toHaveCount(0);
      removed = true;
      break;
    }
    if (!removed) break;
  }

  await page.getByText('用户管理', { exact: true }).click();
  await expect(page.getByRole('button', { name: '新建用户', exact: true })).toBeVisible();
  await useLargestPage(page);
  const search = page.getByPlaceholder('搜索账户和姓名');
  await search.fill('AI');
  await page.getByRole('button', { name: '查询', exact: true }).click();
  await expect(page.locator('tbody tr:visible').first().or(page.getByText('暂无数据', { exact: true }))).toBeVisible();

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

  for (const [account, expectedName] of [['Q', '合法账号'], ['user', '账号格式'], ['testuser', '账号格式']]) {
    await search.fill(account);
    await page.getByRole('button', { name: '查询', exact: true }).click();
    const escaped = account.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const candidate = page.locator('tbody tr:visible').filter({
      has: page.locator('td:first-child').filter({ hasText: new RegExp(`^${escaped}$`) }),
    });
    if (!await candidate.count() || !await candidate.locator('td').nth(1).filter({ hasText: expectedName }).count()) continue;
    await candidate.getByRole('button', { name: '删除', exact: true }).click();
    await page.getByRole('dialog').last().getByRole('button', { name: /确认|确定/ }).click();
    await expect(candidate).toHaveCount(0);
  }

  await search.fill('AI');
  await page.getByRole('button', { name: '查询', exact: true }).click();
  await expect(page.locator('tbody tr:visible').first().or(page.getByText('暂无数据', { exact: true }))).toBeVisible();
  const remaining = await page.locator('tbody tr:visible td:first-child').allTextContents();
  expect(remaining.filter((account) => account.trim().startsWith('AI'))).toEqual([]);
});
