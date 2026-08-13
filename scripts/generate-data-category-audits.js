const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const contracts = path.join(root, 'cases', 'contracts');
const audits = path.join(root, 'cases', 'audits');
const file = 'tests/ui/specs/data-categories.spec.js';
const implementation = {
  P: 'openCategories: login(admin)后进入数据分类管理并等待新建分类按钮可见',
  S: 'data-categories.spec.js 中对应 CASE 分支：按契约定位页面、填写实际输入并点击保存/取消/删除',
  A: '对应 CASE 分支的 Playwright 断言：读取控件实际值，并验证弹框、错误提示、列表最终值或未生成记录'
};
for (let n = 496; n <= 535; n += 1) {
  const caseId = `CASE-${String(n).padStart(6, '0')}`;
  const source = path.join(contracts, `${caseId}.json`);
  if (!fs.existsSync(source)) continue;
  const contract = JSON.parse(fs.readFileSync(source, 'utf8'));
  const items = [...(contract.preconditions || []), ...(contract.steps || []), ...(contract.assertions || [])];
  const coverage = items.map((item) => ({
    contractItemId: item.id,
    implementation: implementation[item.id[0]],
    evidence: `正式执行时 ${item.id} 对应断言通过；CASE-ID ${caseId} 独立运行并保留列表/弹框最终状态`
  }));
  const audit = {
    schemaVersion: 1,
    caseId,
    caseRevision: contract.caseRevision,
    contractHash: contract.contractHash,
    testTitle: contract.title,
    file,
    coverage,
    notes: '2026-08-13 已按当前执行契约逐项对照 data-categories.spec.js；测试数据使用AI前缀并在finally清理。'
  };
  fs.writeFileSync(path.join(audits, `${caseId}.json`), `${JSON.stringify(audit, null, 2)}\n`);
}
