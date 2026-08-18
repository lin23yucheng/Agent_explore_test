const { expect } = require('@playwright/test');

function taskRows(page) {
  return page.getByRole('row').filter({ has: page.getByRole('cell') });
}

function taskRowByName(page, name) {
  return taskRows(page).filter({
    has: page.getByRole('cell', { name, exact: true }),
  });
}

async function deleteTaskByName(page, name) {
  await page.goto('/algorithm/tasks');
  await expect(page.getByRole('columnheader', { name: '任务名称' })).toBeVisible();
  await page.waitForTimeout(3_000);
  const row = taskRowByName(page, name);
  await expect(row).toHaveCount(1);
  await row.getByRole('button', { name: '删除', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText(name);
  await dialog.getByRole('button', { name: '永久删除', exact: true }).click();
  await expect(taskRowByName(page, name)).toHaveCount(0);
}

module.exports = { deleteTaskByName, taskRowByName, taskRows };
