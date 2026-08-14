const { expect } = require('@playwright/test');

async function login(page, username = process.env.UI_USERNAME, password = process.env.UI_PASSWORD) {
  if (!username || !password) throw new Error('UI_USERNAME and UI_PASSWORD are required');
  if (process.env.PLAYWRIGHT_REUSE_AUTH === 'true') {
    if (page.url() === 'about:blank') await page.goto('/');
    return;
  }
  await page.goto('/');
  if (await page.getByPlaceholder('账号').count()) {
    await page.getByPlaceholder('账号').fill(username);
    await page.getByPlaceholder('密码').fill(password);
    await page.getByRole('button', { name: '登录' }).click();
  }
  await expect(page).not.toHaveURL(/\/login$/);
}

async function openModule(page, label, url, ready) {
  await page.goto(url);
  const directReady = await ready().first().waitFor({ state: 'visible', timeout: 10_000 })
    .then(() => true, () => false);
  if (directReady) return;
  const account = page.getByPlaceholder('账号');
  if (await account.count()) {
    await account.fill(process.env.UI_USERNAME);
    await page.getByPlaceholder('密码').fill(process.env.UI_PASSWORD);
    await page.getByRole('button', { name: '登录' }).click();
    await page.goto(url);
    const recovered = await ready().first().waitFor({ state: 'visible', timeout: 20_000 })
      .then(() => true, () => false);
    if (recovered) return;
  }
  await page.goto('/');
  await page.getByText(label, { exact: true }).first().click();
  await ready().first().waitFor({ state: 'visible' });
}

module.exports = { login, openModule };
