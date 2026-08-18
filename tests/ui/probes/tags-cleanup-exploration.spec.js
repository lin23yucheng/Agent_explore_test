const { test, expect } = require('@playwright/test');
const { deleteTagByName, expectTagPresent, openTagsPage, tagRowByName } = require('../helpers/tags');

test('清理标签探索遗留数据', async ({ page }) => {
  const name = 'AI439原标签';
  await openTagsPage(page);
  const row = tagRowByName(page, name);
  if (await row.count()) await deleteTagByName(page, name);
  await expectTagPresent(page, name, false);
});

test('清理标签引用探索遗留数据', async ({ page }) => {
  const taskName = 'AI20260818TAGREFTASK';
  const tagName = 'AI20260818TAGREF';
  await page.goto('/algorithm/tasks');
  await expect(page.getByRole('columnheader', { name: '任务名称' })).toBeVisible();
  await page.waitForTimeout(500);
  const taskRow = page.getByRole('row').filter({
    has: page.getByRole('cell', { name: taskName, exact: true }),
  });
  if (await taskRow.count()) {
    await taskRow.getByRole('button', { name: '删除', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: '永久删除', exact: true }).click();
    await expect(taskRow).toHaveCount(0);
  }
  await page.waitForTimeout(3_000);
  await openTagsPage(page);
  if (await tagRowByName(page, tagName).count()) await deleteTagByName(page, tagName);
  await expectTagPresent(page, tagName, false);
});
