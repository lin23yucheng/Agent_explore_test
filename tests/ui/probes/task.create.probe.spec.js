const { test, expect } = require('@playwright/test');
const { login } = require('../helpers/auth');

test('probe task create form', async ({ page }) => {
  await login(page);
  await page.goto('/algorithm/tasks/create');
  await page.waitForTimeout(500);
  await expect(page.locator('body')).toBeVisible();
  await page.getByRole('button', { name: '+ 添加根节点', exact: true }).click();
  const rootDialog = page.getByRole('dialog').last();
  await rootDialog.locator('textarea[placeholder*="输入节点内容"]').fill('采集节点');
  await rootDialog.getByRole('button', { name: '确定', exact: true }).click();
  await page.waitForTimeout(300);
  console.log(await page.locator('body').ariaSnapshot());
  const tag = page.locator('.el-select').filter({ hasText: '请选择标签' });
  await tag.evaluate((element) => element.querySelector('.el-select__wrapper').click());
  console.log(await page.locator('body').ariaSnapshot());
  console.log('training:', await page.getByText('训练', { exact: true }).count(), await page.getByText('训练', { exact: true }).allTextContents());
  const opts = page.locator('[role="option"]');
  const firstVisible = await opts.evaluateAll((items) => items.findIndex((element) => {
    const rect = element.getBoundingClientRect(); return rect.width > 0 && rect.height > 0;
  }));
  console.log('option-count/first-visible', await opts.count(), firstVisible);
  await opts.nth(firstVisible).evaluate((element) => element.click());
  console.log('after-tag:', await page.locator('.el-tag').allTextContents());
  await page.keyboard.press('Escape');
  const robotInput = page.getByRole('combobox', { name: '* 机器人构型' });
  console.log('controls', await page.getByRole('combobox', { name: '* 标签' }).getAttribute('aria-controls'), await robotInput.getAttribute('aria-controls'));
  await robotInput.click({ force: true });
  const robotPopup = await robotInput.getAttribute('aria-controls');
  console.log('robot popup/expanded/options', robotPopup, await robotInput.getAttribute('aria-expanded'), await page.locator(`#${robotPopup}`).count(), await page.locator(`#${robotPopup} [role="option"]`).allTextContents());
  const robotVisible = await page.locator('[role="option"]').evaluateAll((items) => items.findIndex((element) => {
    const rect = element.getBoundingClientRect(); return rect.width > 0 && rect.height > 0;
  }));
  await page.locator('[role="option"]').nth(robotVisible).evaluate((element) => element.click());
  console.log('after-robot:', await page.getByRole('combobox', { name: '* 机器人构型' }).getAttribute('aria-expanded'));
  await page.goto('/algorithm/tasks');
  const leakedName = 'A'.repeat(32);
  const leakedRows = page.locator('tbody tr').filter({ hasText: leakedName });
  while (await leakedRows.count()) {
    const row = leakedRows.first();
    await row.locator('td').last().getByRole('button', { name: '删除', exact: true }).click();
    await page.getByRole('dialog').last().getByRole('button', { name: '永久删除', exact: true }).click();
    await expect(row).toBeHidden();
  }
});
