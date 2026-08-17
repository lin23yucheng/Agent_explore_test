# 当前快照测试流程

本项目不维护历史用例版本。`cases/current.csv`是当前全部有效用例，`reports/execution_report.csv`是它的一对一执行视图，`tests/ui/specs/`只保存最近正式通过的独立CASE脚本。

强制规则以根目录`AGENTS.md`为准；本文提供实际操作顺序。

## 1. 当前状态初始化

仅在明确需要清空旧结果并从current重新开始时执行：

```powershell
python scripts/testflow.py reset-state
```

该命令保留current中的业务用例和CASE-ID，删除旧执行结论与自动化登记，为每条用例生成内容哈希，并把执行报告初始化为“未执行、未自动化”。

平时只同步报告：

```powershell
python scripts/testflow.py sync-report
python scripts/testflow.py validate-state
```

## 2. 从FreeMind生成增量CSV

```powershell
.\venv\Scripts\python.exe .\freemind_to_cases_AI.py `
  --input 'inputs\freemind\VLA数据任务平台-V1.0.mm' `
  --output 'cases\iterations\VLA数据任务平台-V1.0.csv'
```

`.mm`和迭代CSV只是输入，不是当前全量真源。转换器会校验同一模块下的重复用例标题，并以“场景N”做最小调整；Agent仍需检查标题是否准确表达差异。生成后必须通过变更计划合并。

## 3. 审核并应用增量

```powershell
python scripts/testflow.py prepare `
  'cases\iterations\本次迭代.csv' `
  --output 'cases\changes\本次变更.json'
```

Agent审核每个item：

| 动作 | 处理结果 |
| --- | --- |
| `add` | 分配新ID，结果未执行，无脚本 |
| `unchanged` | 保留ID、结果和有效脚本 |
| `modify` | 删除旧ID和旧脚本，分配新ID，结果未执行 |
| `delete` | 从current、报告、映射、契约、审计和脚本中删除 |
| `review` | 尚未判断，禁止apply |

修改不是revision升级。新旧业务内容不能共用ID。迭代CSV中缺失的当前用例不会删除。

审核完成后清空`uncertain`，将`status`改为`reviewed`：

```powershell
python scripts/testflow.py apply 'cases\changes\本次变更.json'
```

应用会先校验整份计划、输入CSV和current基线哈希，再删除旧资产并写入。写入中途失败时会恢复current、序号、报告、登记、计划和脚本；成功后自动同步执行报告。

## 4. 选择执行范围

查看特定CASE-ID：

```powershell
python scripts/testflow.py scope cases/current.csv --case-id CASE-000001
```

查看模块：

```powershell
python scripts/testflow.py scope cases/current.csv --module 用户管理
```

查看已经apply的增量范围及受影响回归：

```powershell
python scripts/testflow.py scope `
  cases/iterations/本次迭代.csv --plan cases/changes/本次变更.json
```

没有脚本或只有候选脚本时，普通回归范围会显示不可执行。Agent必须先按CSV直接探索页面。

## 5. 首次探索失败

直接探索过程中，只要页面行为、环境、数据或需求不满足，就执行以下处理：

1. 完成失败归因。
2. 记录失败分类、错误、执行时间和运行ID。
3. 保留截图、录像、Trace和错误上下文。
4. 记录并验证清理状态。
5. 把执行报告中的CASE写为未通过。
6. 不创建`tests/ui/specs/<CASE-ID>.spec.js`。
7. 不创建正式或候选自动化登记。

使用以下命令写入当前报告，`--evidence`可以重复：

```powershell
python scripts/testflow.py record-exploration-failure `
  --case-id CASE-000001 `
  --failure-category PRODUCT_DEFECT `
  --reason '页面最终状态与当前用例预期不一致' `
  --cleanup-status not-applicable `
  --evidence 'reports/evidence/<runId>/CASE-000001/error-context.md'
```

产品修复或环境恢复后，再从直接探索开始。

## 6. 首次探索通过

探索通过后仍不能直接把执行结果写为通过。必须生成并晋级脚本：

1. 创建`tests/ui/specs/<CASE-ID>.spec.js`，文件内只有一个测试。
2. 测试使用`testInfo.annotations.push({ type: 'case', description: '<CASE-ID>' })`关联唯一CASE，测试标题同时包含CASE-ID以区分同名业务用例。
3. 脚本必须动态报告清理结果。
4. 导出当前执行契约。
5. 生成覆盖审计模板。
6. 为每个`P*`、`S*`、`A*`填写具体实现和实际证据。
7. 登记候选脚本并提供直接探索证据。
8. 生成promotion运行计划。
9. 通过`run-ui-tests.ps1`正式复跑。

```powershell
python scripts/testflow.py export-contract --case-id CASE-000001

python scripts/testflow.py make-audit-template `
  --case-id CASE-000001 `
  --test-title '任务管理 › 示例用例 [CASE-000001]' `
  --file tests/ui/specs/CASE-000001.spec.js

python scripts/testflow.py register-candidate `
  --case-id CASE-000001 `
  --test-title '任务管理 › 示例用例 [CASE-000001]' `
  --file tests/ui/specs/CASE-000001.spec.js `
  --audit cases/audits/CASE-000001.json `
  --exploration-evidence '直接探索已完成全部步骤并验证最终列表状态'

python scripts/testflow.py make-run-plan cases/current.csv `
  --case-id CASE-000001 --promotion `
  --output cases/runs/CASE-000001-promotion.json

.\run-ui-tests.ps1 `
  -SourceCsv cases/current.csv `
  -RunPlan cases/runs/CASE-000001-promotion.json `
  -Promotion -Password '<密码>'
```

promotion通过后自动写为“通过、已自动化”。promotion失败后自动写未通过，并删除候选脚本、契约和审计。

## 7. 正式回归

按CASE-ID：

```powershell
.\run-ui-tests.ps1 -CaseId CASE-000001 -Password '<密码>'
```

按模块：

```powershell
.\run-ui-tests.ps1 -Module 用户管理 -Password '<密码>'
```

完整回归：

```powershell
.\run-ui-tests.ps1 -Full -Password '<密码>'
```

完整回归只能包含当前通过且拥有有效脚本的用例。如果current中有任何未执行、未通过或没有有效脚本的用例，`validate-state --full`会阻止执行。

正式执行默认`Workers=1`。只有确认用例之间不修改相同业务数据、系统配置或唯一性约束时，才能显式提高`-Workers`；每个CASE独立文件不会让同模块自动串行。

正式脚本回归失败后，报告合并器会：

- 把当前CASE写为未通过。
- 保存本批失败证据。
- 删除automation-registry中的正式映射。
- 删除该CASE独立脚本、契约和审计。
- 要求产品修复后重新走直接探索和promotion流程。

## 8. 增量正式批次

增量运行计划必须绑定已经apply的计划：

```powershell
python scripts/testflow.py make-run-plan `
  cases/iterations/本次迭代.csv `
  --plan cases/changes/本次变更.json `
  --output cases/runs/本次批次.json

.\run-ui-tests.ps1 `
  -SourceCsv cases/iterations/本次迭代.csv `
  -RunPlan cases/runs/本次批次.json `
  -Password '<密码>'
```

运行计划绑定输入CSV和current的SHA-256。输入、current、脚本或审计任一变化都必须重新生成计划。

## 9. 报告状态

`reports/execution_report.csv`主状态：

| 执行结果 | 自动化状态 | 含义 |
| --- | --- | --- |
| 未执行 | 未自动化 | 当前CASE尚未完成脚本晋级复跑 |
| 未通过 | 未自动化 | 当前CASE最近执行失败，仅保留报告证据 |
| 通过 | 已自动化 | 当前CASE存在唯一、审计完整且最近复跑通过的脚本 |

不允许出现“通过但未自动化”或“未通过但仍有正式脚本”。`validate-state`会拒绝这种状态。

## 10. 批次异常处理

- 普通失败继续执行其他计划用例。
- 缺少某个计划CASE结果时拒绝整批合并。
- skip、重复CASE-ID、计划外结果时拒绝合并；清理状态缺失、非法或未经动态验证时按`unverified`失败合并。
- current、脚本、契约或审计在计划生成后变化时拒绝合并。
- Playwright失败但结果完整且分类有效时，允许更新未通过结果并删除失败脚本。
- 无法自动归因的失败写为`UNCLASSIFIED`，仍然更新为未通过并删除脚本；后续直接探索时必须重新归因。
- 清理状态缺失、非法或只静态声明成功时写为`unverified`，整体按未通过处理并删除脚本。
- 进程中断且没有结果时，不更新为通过；修复环境后重新执行。
- 每批执行前清空`reports/latest`，失败证据归档到`reports/evidence/<runId>/<CASE-ID>/`。

## 11. 结束检查

```powershell
python scripts/testflow.py sync-report
python scripts/testflow.py validate-state
```

检查通过后再向用户报告：执行范围、通过/失败/未执行数量、失败分类、删除的失败脚本、清理状态和证据路径。
