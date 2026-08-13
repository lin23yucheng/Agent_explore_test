const { test, expect } = require('@playwright/test');
const { login } = require('../helpers/auth');

test('probe task management create controls', async ({ page }) => {
  await login(page);
  await page.getByText('任务管理', { exact: true }).click();
  await expect(page.getByText('任务管理', { exact: true }).last()).toBeVisible();
  console.log(await page.locator('body').ariaSnapshot());
  const create = page.getByRole('button', { name: /新建|创建/ }).first();
  await create.click();
  const dialog = page.getByRole('dialog').last();
  await expect(dialog).toBeVisible();
  console.log(await dialog.ariaSnapshot());
});
