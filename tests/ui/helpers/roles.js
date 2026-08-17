const { expect } = require('@playwright/test');
const { openModule } = require('./auth');

const roleRows = [
  ['admin', '管理员', '所有权限', '启用'],
  ['algorithm_engineer', '算法工程师', '工作台、任务管理、数据转换、数据可视化权限', '启用'],
  ['collection_engineer', '采集工程师', '工作台、我的采集权限', '启用'],
  ['annotation_engineer', '标注工程师', '工作台、我的标注权限', '启用'],
  ['qc_engineer', '质检工程师', '工作台、我的质检权限', '启用'],
];

async function openRolesPage(page) {
  await openModule(
    page,
    '角色管理',
    '/admin/roles',
    () => page.getByRole('columnheader', { name: '角色编码' }),
  );
  await expect(page.getByRole('columnheader')).toHaveText([
    '角色编码',
    '角色名称',
    '描述',
    '状态',
  ]);
  const rows = page.getByRole('row').filter({ has: page.getByRole('cell') });
  await expect(rows).toHaveCount(5);
  return rows;
}

async function expectRole(rows, expected) {
  const row = rows.filter({ hasText: expected[0] });
  await expect(row, `缺少角色 ${expected[0]}`).toHaveCount(1);
  await expect(row.getByRole('cell')).toHaveText(expected);
}

module.exports = { expectRole, openRolesPage, roleRows };
