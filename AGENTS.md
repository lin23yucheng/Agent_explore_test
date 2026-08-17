# 当前快照测试执行协议

本项目只维护当前实际有效的测试用例、当前执行状态和最近正式通过的自动化脚本。不维护用例版本链，不使用历史revision、retired、superseded或历史通过结果推断当前结果。

用户要求执行CSV、FreeMind `.mm`、特定模块、特定CASE-ID或全部用例时，Agent完整负责生成、合并、探索、自动化、执行、失败归因、数据清理和报告更新。

## 0. 中断恢复和Agent上下文断层

对话上下文、Agent记忆和口头进度都不是恢复依据。新Agent接手、上下文压缩、工具调用中断、终端退出或正式批次异常后，必须从项目中的当前文件、事务日志、探索检查点和批次检查点恢复事实。

开始任何状态写入或继续测试前先执行：

```powershell
python scripts/testflow.py recovery-status
```

恢复规则：

- 检测到`未完成事务`、关键状态备份待恢复或待重试证据清理时，执行`python scripts/testflow.py recover-state`，然后重新运行`recovery-status`、`sync-report`和`validate-state`。
- `recover-state`是显式写操作。它只回滚未提交事务、完成已提交事务日志收尾、从有效last-known-good备份恢复损坏的关键JSON，并重试待清理任务；不能把损坏状态静默当成空状态。
- 发现锁正在被占用时，说明原批次或状态操作仍可能运行。禁止删除锁文件、事务目录、`reports/latest`或强制启动第二批；先等待原进程结束并重新检查。
- `cases/.transactions/`、`cases/.state-backups/`、`cases/explorations/`、`reports/latest/run-checkpoint.json`和`reports/pending-maintenance.json`属于恢复资产，禁止人工删除来绕过预检。
- 恢复后必须重新读取本次范围的CSV、契约、审计、脚本及检查点绑定哈希。对话摘要只能帮助定位，不能证明步骤完成或结果通过。

首次直接探索一开始就必须建立检查点，并在完成契约项、创建测试数据、保存证据或清理状态变化后立即更新：

```powershell
python scripts/testflow.py checkpoint-exploration `
  --case-id CASE-000001 --phase started `
  --note '准备核对前置条件'

python scripts/testflow.py checkpoint-exploration `
  --case-id CASE-000001 --phase steps-in-progress `
  --completed-item P1 --completed-item S1 `
  --created-data '用户:AI_RUN123_CASE000001_用户1；清理入口:用户管理删除' `
  --evidence 'reports/evidence/RUN123/CASE-000001/step-S1.png'
```

探索检查点只记录可恢复进度，不能作为通过结果。上下文恢复后，Agent必须核对页面当前状态、已创建数据和清理责任；无法确认的步骤必须重新执行。只有所有`P*`、`S*`、`A*`均完成且清理状态可信时，才能写为`passed-awaiting-automation`。探索失败正式落库或候选登记成功时，检查点由事务自动删除。

正式批次由`run-ui-tests.ps1`自动记录`planned`、`preflight-passed`、`running`、`results-ready`、`merging`、`merge-failed`和`completed`阶段。恢复命令：

```powershell
.\run-ui-tests.ps1 -Resume
```

- `results-ready`、`merging`或`merge-failed`且原始结果哈希一致时，`-Resume`只继续结果合并，不重复页面操作。
- `planned`、`preflight-passed`、`running`或`interrupted`没有可信完整结果时，`-Resume`归档旧`latest`并使用同一运行计划、新运行ID完整重跑。
- 已有结果不可信或合并错误不可重试时，使用`.\run-ui-tests.ps1 -Resume -Rerun`明确放弃本次结果并按原计划重跑。
- 存在有效`merge-receipt.json`表示报告事务已经提交，此时禁止`-Rerun`，只能用`-Resume`完成清理、清单和检查点收尾。
- `completed`表示报告合并已完成，即使Playwright退出码非零也不能盲目重跑；先读取执行报告、失败分类和证据。
- 检查点、运行计划、current、输入CSV或结果哈希不一致时禁止继续合并。保留现场，完成归因后重新生成计划或明确重跑。

## 1. 必读文件

开始任何测试资产变更或正式执行前，必须读取并对照：

- `AGENTS.md`
- `docs/TEST_EXECUTION.md`
- `docs/TEST_DATA_GUIDE.md`
- `cases/current.csv`
- `reports/execution_report.csv`（不存在时先运行`python scripts/testflow.py sync-report`）
- `cases/automation-registry.json`（不存在视为空）
- 本次范围内的契约、审计、候选脚本和正式脚本

## 2. 唯一真源和一致性

`cases/current.csv`是当前全部有效用例的唯一真源。`reports/execution_report.csv`必须拥有完全相同的CASE-ID、顺序和业务字段，只额外包含执行信息。

每次合并后、生成运行计划前和结束任务前，都必须运行：

```powershell
python scripts/testflow.py sync-report
python scripts/testflow.py validate-state
```

`sync-report`是显式写操作；`validate-state`必须保持只读，只报告不一致，不能在校验时静默改写执行报告。

同步规则：

- current中没有、报告中存在的ID，从报告删除。
- current中存在、报告中没有的ID，以“未执行、未自动化”加入报告。
- 相同ID的业务字段必须以current为准。
- 相同ID但用例内容哈希变化属于非法手工修改，必须阻止执行并通过变更计划生成新ID。
- 局部执行只更新本批CASE-ID，其他当前用例结果保持不变。

## 3. FreeMind和增量合并

收到`.mm`时，先用`freemind_to_cases_AI.py`生成`cases/iterations/<名称>.csv`。第一份当前用例可以直接初始化；以后所有迭代CSV都只描述本次变化，未出现的历史当前用例继续有效。

后续迭代必须执行：

```powershell
python scripts/testflow.py prepare <iteration.csv> --output <merge-plan.json>
```

Agent逐条审核计划，并明确设置：

- `add`：新增业务用例，分配新CASE-ID。
- `unchanged`：业务目标、前置条件、步骤和预期未变，保留CASE-ID和当前结果。
- `modify`：业务内容发生实质变化，删除旧ID并分配新ID；新ID为未执行且无脚本。
- `delete`：只有用户或需求明确要求删除时使用，必须填写原因。

高相似候选不能自动决定。计划存在`review`或`uncertain`时禁止应用。迭代CSV缺少某条当前用例永远不能解释为删除。

审核后把计划`status`改为`reviewed`，再执行：

```powershell
python scripts/testflow.py apply <merge-plan.json>
```

`apply`必须先校验整份计划、输入CSV哈希和current基线哈希。只有全部动作校验通过后才能删除旧资产并写入；任一状态文件写入失败必须恢复current、序号、报告、登记、计划和脚本。修改和删除会同时移除旧报告行、自动化映射、候选、契约、审计和独立脚本。

## 4. CASE-ID规则

- 当前CASE-ID必须唯一。
- 同一模块内的用例标题必须唯一；FreeMind转换后若出现重复名称，必须按具体场景微调标题后才能prepare。
- 已分配ID永久不复用。
- 新增用例获得新ID。
- 标题、模块、前置条件、步骤或预期发生业务变化时，按modify处理并获得新ID。
- 关键词、优先级、用例类型或适用阶段等管理字段变化可以保留原ID。
- 禁止绕过变更计划直接修改current中相同ID的执行内容。

## 5. 首次探索和脚本晋级

没有正式脚本的用例必须先直接探索页面，不得因为无脚本而跳过，也不得先凭空编写脚本并把它当成通过结果。

首次流程严格为：

1. 按CSV前置条件、步骤和预期直接探索页面。
2. 创建并持续更新该CASE-ID的探索检查点，记录契约项、测试数据、证据和清理责任。
3. 读取控件实际值，验证提交后的列表、详情或最终业务状态。
4. 探索失败时写入未通过结果、分类、截图、录像、Trace和清理状态；不得创建正式脚本。
5. 探索通过后，将检查点更新为`passed-awaiting-automation`，再为该CASE-ID创建独立文件`tests/ui/specs/<CASE-ID>.spec.js`。
6. 一个脚本文件只能包含一个正式测试并关联一个CASE-ID；测试标题必须包含CASE-ID以区分同名业务用例。
7. 生成当前执行契约和覆盖审计，逐项填写每个`P*`、`S*`和`A*`的具体实现与证据。
8. 使用`register-candidate`登记探索通过的候选脚本，必须提供探索证据；登记成功后自动清除探索检查点。
9. 生成`--promotion`运行计划并正式复跑。
10. 候选脚本复跑通过后，报告合并器自动把它晋级为正式自动化。
11. 候选复跑失败时，删除候选映射、契约、审计和脚本，只保留失败报告与证据。

直接探索失败必须立即写入当前执行报告，`--evidence`可以重复：

```powershell
python scripts/testflow.py record-exploration-failure `
  --case-id CASE-000001 `
  --failure-category PRODUCT_DEFECT `
  --reason '<具体实际行为与当前预期的差异>' `
  --cleanup-status not-applicable `
  --evidence '<截图、录像、Trace或错误上下文路径>'
```

示例：

```powershell
python scripts/testflow.py export-contract --case-id CASE-000001
python scripts/testflow.py make-audit-template `
  --case-id CASE-000001 `
  --test-title '模块 › 用例标题 [CASE-000001]' `
  --file tests/ui/specs/CASE-000001.spec.js

# 填写审计后登记候选
python scripts/testflow.py register-candidate `
  --case-id CASE-000001 `
  --test-title '模块 › 用例标题 [CASE-000001]' `
  --file tests/ui/specs/CASE-000001.spec.js `
  --audit cases/audits/CASE-000001.json `
  --exploration-evidence '<本次直接探索的具体结果或证据路径>'

python scripts/testflow.py make-run-plan cases/current.csv `
  --case-id CASE-000001 --promotion `
  --output cases/runs/CASE-000001-promotion.json

.\run-ui-tests.ps1 -SourceCsv cases/current.csv `
  -RunPlan cases/runs/CASE-000001-promotion.json -Promotion
```

## 6. 已有正式脚本

已有映射不代表可以盲目复用。执行相关用例前，必须逐条核对当前CSV的前置条件、数据、步骤和预期与脚本实现、契约及审计一致。

以下任一情况必须先运行`invalidate-automation`，该命令会解除映射并删除独立脚本：

- 用例内容和脚本不对应。
- 缺少关键步骤或最终断言。
- 输入数据不符合当前用例。
- 存在零行循环断言或可能空跑。
- 只验证按钮、弹窗或接口，没有验证最终业务状态。
- 脚本、契约或审计哈希发生变化。

```powershell
python scripts/testflow.py invalidate-automation `
  --case-id CASE-000001 --reason '<具体覆盖不足原因>'
```

失效后必须重新直接探索，不能在旧脚本上降低断言以迎合产品行为。

## 7. 失败脚本规则

正式自动化只保存当前最近一次正式通过的用例脚本。

- 首次探索失败：不创建脚本。
- 候选晋级复跑失败：删除候选脚本。
- 已有正式脚本本次回归失败：执行报告写未通过，立即解除正式映射并删除该CASE的独立脚本。
- 产品修复后必须重新直接探索、生成候选并完成晋级复跑。
- 失败的错误、截图、录像、Trace和错误上下文保存在报告证据目录，不以正式可执行脚本作为历史资产。

## 8. 精确运行计划

正式批次只能通过精确CASE-ID运行计划执行。禁止使用测试文件代替CASE-ID范围。

增量CSV必须绑定已经apply的变更计划：

```powershell
python scripts/testflow.py make-run-plan <iteration.csv> `
  --plan <applied-plan.json> --output <run-plan.json>
```

按CASE-ID或模块执行当前快照：

```powershell
.\run-ui-tests.ps1 -CaseId CASE-000001
.\run-ui-tests.ps1 -Module 用户管理
```

完整回归：

```powershell
.\run-ui-tests.ps1 -Full
```

完整回归要求current中的每条用例均为通过且拥有当前有效自动化。未执行、失败、候选或脚本失效都会阻止完整回归，不能用skip绕过。

运行计划绑定输入CSV哈希、current快照哈希、CASE-ID、契约、脚本和审计哈希。任何内容在计划生成后变化都必须拒绝执行或回写。

已经提供`-RunPlan`时可以省略`-SourceCsv`，执行器必须使用计划内绑定的输入CSV；若同时显式提供，两者必须一致。预检必须枚举选中脚本内的全部测试，文件中存在任何计划外测试都要拒绝执行。

## 9. 判定、失败分类和清理

输入限制按控件实际值和最终生效值判断。字符被过滤、超长内容被截断、即时提示、失焦提示或提交被阻止均可满足业务目标；只有非法实际值最终成功生效才失败，除非用例明确要求具体交互或文案。

正式失败分类：

- `DATA_PRECONDITION_MISSING`
- `DATA_SETUP_FAILED`
- `ENVIRONMENT_BLOCKED`
- `PRODUCT_DEFECT`
- `TEST_IMPLEMENTATION_DEFECT`
- `CASE_DESCRIPTION_AMBIGUOUS`
- `REQUIREMENT_CONFLICT`
- `CLEANUP_FAILED`
- `UNCLASSIFIED`（工具无法仅凭错误文本确定归因，仍必须保留失败证据并删除脚本；后续直接探索时重新归因）

普通断言差异不能未经分析直接标为脚本缺陷。无法自动归因时先记录为`UNCLASSIFIED`，按未通过删除脚本；任务结束前仍需通过直接探索完成最终归因。

功能结果和清理状态分开记录。正式用例必须动态报告`passed`、`not-applicable`或`retained-by-design`。清理失败最终按未通过处理，并删除正式或候选脚本；清理状态缺失、非法或只静态声明成功时记录为`unverified`，同样按未通过删除脚本。

测试数据必须使用运行ID和CASE-ID唯一前缀，创建后登记，在`finally`中逆序清理，清理后再次查询确认。不得删除管理员、系统基准数据或其他批次数据。

## 10. 批次异常

- 普通用例失败不能中断后续用例。
- 自动归因失败也必须落为`未通过`并删除该CASE脚本，不能因为等待人工归因而保留可回归脚本。
- 正式范围内每个CASE-ID必须有且只有一个结果。
- 禁止skip、计划外结果、重复CASE-ID和重复叶子测试标题。
- 运行中断后，没有结果的用例不得写成通过。
- 能确认环境故障时标记`ENVIRONMENT_BLOCKED`；无法确认执行状态时批次保持不完整并重新执行。
- 每次没有未完成检查点的正式运行先清空`reports/latest`；存在未完成检查点时必须保留现场并使用`-Resume`，禁止复用或覆盖上一批原始结果。
- 正式运行使用独占锁，禁止并发批次覆盖报告。
- 默认使用单Worker执行。只有确认用例之间不读写相同业务数据、系统配置或唯一性约束时，才能显式提高`-Workers`；一个CASE一个文件并不代表同模块会自动串行。

## 11. 结束条件

结束任务前必须保证：

- current与执行报告一一对应。
- 本批每条用例都有明确结果。
- 通过用例拥有唯一、当前有效、审计完整的正式脚本。
- 未通过或未执行用例没有正式自动化映射。
- 不存在非当前CASE-ID登记、无效候选、共享脚本、孤儿脚本/审计/契约或倒退的ID序号。
- 失败证据和清理结果已保存。
- 不存在未完成事务、待清理队列、未落库探索检查点或未完成正式批次检查点。
- `python scripts/testflow.py validate-state`通过。

只有缺少凭据、环境不可访问、操作有实质风险或用例预期确实无法判断时才能暂停。
