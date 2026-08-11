const { expect } = require('@playwright/test');

async function login(page, username = process.env.UI_USERNAME, password = process.env.UI_PASSWORD) {
  if (!username || !password) throw new Error('UI_USERNAME and UI_PASSWORD are required');
  await page.goto('/login');
  await page.getByPlaceholder('账号').fill(username);
  await page.getByPlaceholder('密码').fill(password);
  await page.getByRole('button', { name: '登录' }).click();
  await expect(page).not.toHaveURL(/\/login$/);
}

module.exports = { login };
