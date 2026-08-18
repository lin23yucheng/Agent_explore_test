const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { openTagsPage, tagRowByName } = require('../helpers/tags');

test('诊断任务删除后的标签引用', async ({ page }) => {
  const tagName = 'AI20260818TAGREF';
  const taskName = 'AI20260818TAGREFTASK';
  const captured = [];
  page.on('response', async (response) => {
    const url = response.url();
    if (!/\/api\/v1\/(tasks|scene-tags)/.test(url)) return;
    let body = '';
    try {
      body = await response.text();
    } catch {}
    captured.push({ url, method: response.request().method(), status: response.status(), body });
  });

  await page.goto('/algorithm/tasks');
  await expect(page.getByRole('columnheader', { name: '任务名称' })).toBeVisible();
  const visibleTaskCount = await page.getByRole('row').filter({
    has: page.getByRole('cell', { name: taskName, exact: true }),
  }).count();

  await openTagsPage(page);
  const row = tagRowByName(page, tagName);
  await expect(row).toHaveCount(1);
  await row.getByRole('button', { name: '删除', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: '确定', exact: true }).click();
  await page.waitForTimeout(1_000);
  const messages = await page.locator('.el-message:visible').allTextContents();
  const finalTagCount = await tagRowByName(page, tagName).count();
  fs.writeFileSync(
    path.resolve('reports/evidence/EXPLORATION-20260818-TAGS-STRICT-01/references/reference-diagnostic.json'),
    JSON.stringify({ taskName, tagName, visibleTaskCount, finalTagCount, messages, captured }, null, 2),
    'utf8',
  );
});

test('诊断并清理引用任务', async ({ page }) => {
  const taskName = 'AI20260818TAGREFTASK';
  const captured = [];
  page.on('response', async (response) => {
    if (!/\/api\/v1\/tasks/.test(response.url())) return;
    let body = '';
    try { body = await response.text(); } catch {}
    captured.push({
      url: response.url(),
      method: response.request().method(),
      status: response.status(),
      body,
    });
  });
  await page.goto('/algorithm/tasks');
  await expect(page.getByRole('columnheader', { name: '任务名称' })).toBeVisible();
  await page.waitForTimeout(500);
  const row = page.getByRole('row').filter({
    has: page.getByRole('cell', { name: taskName, exact: true }),
  });
  const beforeCount = await row.count();
  if (beforeCount) {
    await row.getByRole('button', { name: '删除', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText(taskName);
    await dialog.getByRole('button', { name: '永久删除', exact: true }).click();
    await page.waitForTimeout(1_000);
  }
  await page.reload();
  await expect(page.getByRole('columnheader', { name: '任务名称' })).toBeVisible();
  const afterReloadCount = await row.count();
  fs.writeFileSync(
    path.resolve('reports/evidence/EXPLORATION-20260818-TAGS-STRICT-01/references/task-delete-diagnostic.json'),
    JSON.stringify({ taskName, beforeCount, afterReloadCount, captured }, null, 2),
    'utf8',
  );
});
