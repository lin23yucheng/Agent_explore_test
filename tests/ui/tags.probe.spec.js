const { test, expect } = require('@playwright/test');
const { login } = require('./helpers/auth');

test('probe tag management controls', async ({ page }) => {
  await login(page);
  await page.getByText('标签管理', { exact: true }).click();
  await expect(page.getByRole('button', { name: /新增标签|新建标签/ })).toBeVisible();
  console.log(await page.locator('main').ariaSnapshot());
  await page.getByRole('button', { name: /新增标签|新建标签/ }).click();
  console.log(await page.getByRole('dialog').last().ariaSnapshot());
});

test('probe tag create and list behavior', async ({ page }) => {
  const name = `AIProbe${Date.now()}`;
  await login(page);
  await page.getByText('标签管理', { exact: true }).click();
  await page.getByRole('button', { name: '新建标签', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '新建标签' });
  await dialog.getByRole('textbox', { name: '* 标签名称' }).fill(name);
  await dialog.getByRole('button', { name: '保存', exact: true }).click();
  await expect(dialog).toBeHidden();
  const row = page.locator('tbody tr').filter({ hasText: name });
  await expect(row).toBeVisible();
  console.log(await row.ariaSnapshot());
  await row.getByRole('button', { name: '删除', exact: true }).click();
  const confirm = page.getByRole('dialog').last();
  console.log(await confirm.ariaSnapshot());
  await confirm.getByRole('button', { name: /确定|确认/ }).click();
  await expect(row).toHaveCount(0);
});

test('probe tag filters, validation, and edit dialog', async ({ page }) => {
  const base = `AIProbe${Date.now()}`;
  await login(page);
  await page.getByText('标签管理', { exact: true }).click();
  const create = async (name, category) => {
    await page.getByRole('button', { name: '新建标签', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: '新建标签' });
    await dialog.getByRole('textbox', { name: '* 标签名称' }).fill(name);
    if (category) {
      await dialog.locator('.el-select').last().click();
      console.log(`category options: ${await page.locator('body').ariaSnapshot()}`);
      await page.getByText(category, { exact: true }).last().click();
    }
    await dialog.getByRole('button', { name: '保存', exact: true }).click();
    await expect(dialog).toBeHidden();
  };
  const quality = `${base}Q`; const other = `${base}O`;
  await create(quality, '质量'); await create(other, '其他');
  try {
    const search = page.getByRole('textbox', { name: '搜索标签名称' });
    await search.fill(quality); await page.getByRole('button', { name: '查询', exact: true }).click();
    await expect(page.locator('tbody tr').filter({ hasText: quality })).toBeVisible();
    await page.getByRole('button', { name: '重置', exact: true }).click();
    const target = page.locator('tbody tr').filter({ hasText: quality });
    await target.getByRole('button', { name: '编辑', exact: true }).click();
    const edit = page.getByRole('dialog', { name: '编辑标签' });
    console.log(await edit.ariaSnapshot());
    await edit.getByRole('button', { name: '取消', exact: true }).click();
  } finally {
    for (const name of [quality, other]) {
      const row = page.locator('tbody tr').filter({ hasText: name });
      if (await row.count()) {
        await row.getByRole('button', { name: '删除', exact: true }).click();
        await page.getByRole('dialog').last().getByRole('button', { name: '确定', exact: true }).click();
        await expect(row).toHaveCount(0);
      }
    }
  }
});

test('probe tag edit save behavior', async ({ page }) => {
  const original = `AIProbeEdit${Date.now()}`;
  const updated = `${original}X`;
  await login(page);
  await page.getByText('标签管理', { exact: true }).click();
  await page.getByRole('button', { name: '新建标签', exact: true }).click();
  let dialog = page.getByRole('dialog', { name: '新建标签' });
  await dialog.getByRole('textbox', { name: '* 标签名称' }).fill(original);
  await dialog.getByRole('button', { name: '保存', exact: true }).click();
  await expect(dialog).toBeHidden();
  const row = page.locator('tbody tr').filter({ hasText: original });
  await row.getByRole('button', { name: '编辑', exact: true }).click();
  dialog = page.getByRole('dialog', { name: '编辑标签' });
  await dialog.getByPlaceholder('如：桌面操作').fill(updated);
  await dialog.getByRole('button', { name: '保存', exact: true }).click();
  await page.waitForTimeout(1000);
  console.log(`edit visible=${await dialog.isVisible().catch(() => false)} alert=${await page.locator('.el-message,.el-message-box__message').allTextContents()}`);
  console.log(await page.locator('tbody').ariaSnapshot());
  if (await dialog.isVisible().catch(() => false)) await dialog.getByRole('button', { name: '取消', exact: true }).click();
  const updatedRow = page.locator('tbody tr').filter({ hasText: updated });
  if (await updatedRow.count()) {
    await updatedRow.getByRole('button', { name: '删除', exact: true }).click();
    await page.getByRole('dialog').last().getByRole('button', { name: '确定', exact: true }).click();
  } else if (await row.count()) {
    await row.getByRole('button', { name: '删除', exact: true }).click();
    await page.getByRole('dialog').last().getByRole('button', { name: '确定', exact: true }).click();
  }
});

test('cleanup timed out tag probes', async ({ page }) => {
  const names = ['AI3901786420279806', 'AI4421786420576767575', 'AI447178642067348162', 'AI4481786420766378709', 'AI4501786420859152632'];
  await login(page);
  await page.getByText('标签管理', { exact: true }).click();
  for (const name of names) {
    const row = page.locator('tbody tr').filter({ hasText: name });
    if (await row.count()) {
      await row.getByRole('button', { name: '删除', exact: true }).click();
      await page.getByRole('dialog').last().getByRole('button', { name: '确定', exact: true }).click();
      await expect(row).toHaveCount(0);
    }
  }
});

test('probe tag edit invalid value behavior', async ({ page }) => {
  const original = `AIProbeInvalid${Date.now()}`;
  await login(page);
  await page.getByText('标签管理', { exact: true }).click();
  await page.getByRole('button', { name: '新建标签', exact: true }).click();
  let dialog = page.getByRole('dialog', { name: '新建标签' });
  await dialog.getByRole('textbox', { name: '* 标签名称' }).fill(original);
  await dialog.getByRole('button', { name: '保存', exact: true }).click();
  await expect(dialog).toBeHidden();
  const row = page.locator('tbody tr').filter({ hasText: original });
  await row.getByRole('button', { name: '编辑', exact: true }).click();
  dialog = page.getByRole('dialog', { name: '编辑标签' });
  const input = dialog.getByPlaceholder('如：桌面操作');
  await input.fill('标签@#');
  console.log(`actual=${await input.inputValue()}`);
  await dialog.getByRole('button', { name: '保存', exact: true }).click();
  await page.waitForTimeout(800);
  console.log(`visible=${await dialog.isVisible()} messages=${await page.locator('.el-message').allTextContents()} errors=${await dialog.locator('.el-form-item__error').allTextContents()}`);
  if (await dialog.isVisible()) await dialog.getByRole('button', { name: '取消', exact: true }).click();
  await row.getByRole('button', { name: '删除', exact: true }).click();
  await page.getByRole('dialog').last().getByRole('button', { name: '确定', exact: true }).click();
});
