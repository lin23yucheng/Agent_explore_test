const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

module.exports = async () => {
  const statePath = path.resolve('.auth', 'storage.json');
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  const username = process.env.UI_USERNAME;
  const password = process.env.UI_PASSWORD;
  if (!username || !password) {
    fs.writeFileSync(statePath, JSON.stringify({ cookies: [], origins: [] }));
    return;
  }
  const browser = await chromium.launch({
    executablePath: process.env.UI_BROWSER_EXECUTABLE || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const baseURL = process.env.UI_BASE_URL || 'https://fat-vla-web.svfactory.com:8443';
    await page.goto(`${baseURL}/login`);
    const account = page.getByPlaceholder('账号');
    await account.fill(username);
    await page.getByPlaceholder('密码').fill(password);
    await page.getByRole('button', { name: /登录|登錄/ }).click();
    await page.getByText('数据分类管理', { exact: true }).waitFor({ state: 'visible', timeout: 30_000 });
    await context.storageState({ path: statePath });
    await context.close();
  } finally {
    await browser.close();
  }
};
