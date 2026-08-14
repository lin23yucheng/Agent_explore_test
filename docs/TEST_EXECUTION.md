# 测试执行说明

用户只需要提供测试点文件或版本，并说明“执行这个版本的测试用例”。Agent负责生成CSV、合并版本、审核自动化、探索页面、执行、失败分类、数据清理和报告生成。执行前必须同时读取 `docs/TEST_DATA_GUIDE.md`，按其中的账号、角色、业务数据依赖和清理规则准备测试环境。

测试点`.mm`是业务输入源；`cases/current.csv`是经过版本合并后的当前全量有效用例库。后续迭代`.mm`只描述本次变化，不要求重复历史测试点。

## 1. V1.0基线

从第一版测试点生成CSV：

```powershell
.\venv\Scripts\python.exe .\freemind_to_cases_AI.py `
  --input 'inputs\freemind\VLA数据任务平台-V1.0.mm' `
  --output 'cases\iterations\VLA数据任务平台-V1.0.csv' `
  --version 'V1.0'
```

如果`cases/case-registry.json`不存在，初始化基线：

```powershell
.\venv\Scripts\python.exe .\scripts\testflow.py bootstrap `
  'cases\iterations\VLA数据任务平台-V1.0.csv' --version 'V1.0'
```

初始化后，`cases/current.csv`就是V1.0全量有效用例。Agent必须逐条审核CSV与Playwright实现，修复或重写不完整自动化，再执行完整回归：

```powershell
.\run-ui-tests.ps1 -SourceCsv 'cases\current.csv' -Full
```

## 2. V2.0及后续增量

后续`.mm`只包含本次迭代测试点。先生成对应版本CSV：

```powershell
.\venv\Scripts\python.exe .\freemind_to_cases_AI.py `
  --input 'inputs\freemind\VLA数据任务平台-V2.0.mm' `
  --output 'cases\iterations\VLA数据任务平台-V2.0.csv' `
  --version 'V2.0'
```

然后生成变更计划：

```powershell
.\venv\Scripts\python.exe .\scripts\testflow.py prepare `
  'cases\iterations\VLA数据任务平台-V2.0.csv' --version 'V2.0'
```

Agent审核计划中的新增、修改、替代、明确退役、不确定项和受影响回归用例。迭代CSV中未出现的历史用例继续有效。计划状态改为`reviewed`后必须应用：

```powershell
.\venv\Scripts\python.exe .\scripts\testflow.py apply `
  'cases\changes\<V2.0变更计划>.merge-plan.json'
```

应用后，`cases/current.csv`自动成为V1.0与V2.0合并后的最新全量有效用例库。再解析本次范围：

```powershell
.\venv\Scripts\python.exe .\scripts\testflow.py scope `
  'cases\iterations\VLA数据任务平台-V2.0.csv' `
  --plan 'cases\changes\<V2.0变更计划>.merge-plan.json'
```

正式范围包含V2.0输入用例以及变更计划列出的受影响历史回归用例。只有用户明确要求全量回归时，才执行整个`cases/current.csv`。

## 3. 自动化可信规则

每个有效`CASE-ID`必须拥有一个独立Playwright测试、独立结果和独立失败证据。共享页面操作可以封装为辅助函数，但禁止：

执行顺序必须遵循“先执行、后自动化沉淀”的原则：

- 当前没有脚本与CASE-ID对应时，这是该用例的首次执行。必须根据CSV的前置条件、步骤和预期直接探索页面并执行；执行结果明确后，再创建Playwright脚本、登记CASE-ID映射，并复跑脚本确认结果。没有脚本不能作为跳过理由。
- 当前已有脚本与CASE-ID对应时，也必须先执行该用例，再将CSV与实际页面、脚本步骤、测试数据和断言逐项对照。发现不匹配、覆盖不足或脚本缺陷时，必须更新脚本后重新执行，并以最新正式结果替换历史结果；不得直接复用历史通过状态。

- 一个测试关联多个CASE-ID。
- 将同一测试体机械复制为多个CASE-ID结果。
- 仅因标题相似或历史通过就复用自动化。
- 对零行结果执行循环断言并视为通过。
- 只验证弹框、按钮或接口调用，没有验证列表、详情或最终业务状态。

已有映射在每次相关迭代中都要对照CSV的前置条件、步骤和预期进行语义审核。覆盖不足时先失效旧映射：

```powershell
.\venv\Scripts\python.exe .\scripts\testflow.py invalidate-automation `
  --case-id 'CASE-000001' --reason '未验证保存后的最终列表结果'
```

修复后重新登记，一个测试只能登记一个CASE-ID：

```powershell
.\venv\Scripts\python.exe .\scripts\testflow.py export-contract `
  --case-id 'CASE-000001'

.\venv\Scripts\python.exe .\scripts\testflow.py make-audit-template `
  --case-id 'CASE-000001' `
  --test-title '用户管理 › 查询用户' `
  --file 'tests/ui/specs/users.spec.js' `
  --output 'cases/audits/CASE-000001.json'

# 逐项填写审计文件中的implementation和evidence后才能登记。
.\venv\Scripts\python.exe .\scripts\testflow.py register-automation `
  --test-title '用户管理 › 查询用户' `
  --file 'tests/ui/specs/users.spec.js' `
  --case-id 'CASE-000001' `
  --audit 'cases/audits/CASE-000001.json'
```

登记时会绑定当前`CASE-ID + revision + contractHash + implementationHash`。用例内容、执行契约或脚本文件发生变化后，旧映射自动视为失效，必须重新审核和登记。
登记同时绑定覆盖审计文件哈希；审计内容被修改后自动失效。审计不得使用“按当前CASE契约执行”“正式执行时对应断言通过”等模板化描述，必须记录具体脚本位置、操作、断言和实际证据。

### 3.1 执行契约与覆盖审计

执行契约由CSV中的前置条件、步骤和预期生成，分别使用`P*`、`S*`和`A*`编号。覆盖审计必须为每个条目填写：

- `implementation`：Playwright中的具体实现位置或操作说明。
- `evidence`：证明该条目实际执行或验证的断言、响应、附件或最终状态。

缺少任一条目、存在重复条目或审计文件绑定旧revision时，不得把自动化登记为`active`。

### 3.2 精确运行计划

正式增量批次必须先生成精确CASE-ID运行计划：

```powershell
.\venv\Scripts\python.exe .\scripts\testflow.py make-run-plan `
  'cases/iterations/VLA数据任务平台-V2.0.csv' `
  --plan 'cases/changes/<V2.0变更计划>.merge-plan.json' `
  --output 'cases/runs/V2.0.json'

.\run-ui-tests.ps1 `
  -SourceCsv 'cases/iterations/VLA数据任务平台-V2.0.csv' `
  -RunPlan 'cases/runs/V2.0.json' `
  -Password '<测试账号密码>'
```

运行计划固定本批CASE-ID、测试标题、脚本文件、用例revision、契约哈希、脚本哈希和输入CSV的SHA-256。使用增量变更计划时，变更计划必须已经`apply`且来源CSV一致；输入重复CASE-ID或重复叶子测试标题会被拒绝。若执行了计划外用例、漏执行计划用例，或计划生成后脚本、审计、用例或输入CSV发生变化，Reporter和报告合并器都会拒绝回写。正式脚本使用独占锁，同一时间只能运行一个批次。

`-TestFiles`不再用于正式结果批次。探索页面时可以直接运行Playwright，但探索结果只有在完成覆盖审计、重新登记并通过`-RunPlan`复跑后，才能成为可信历史结果。

## 4. 判定、失败分类和清理

输入限制按控件实际值和最终生效值判断。非法字符被过滤、超长内容被截断、即时提示、失焦提示或提交被阻止均可通过；只有非法实际值最终成功生效时才失败。

正式结果使用以下主分类：

- `DATA_PRECONDITION_MISSING`：前置数据不存在。
- `DATA_SETUP_FAILED`：测试数据无法创建或准备。
- `ENVIRONMENT_BLOCKED`：服务、网络、登录、浏览器或环境不可用。
- `PRODUCT_DEFECT`：系统最终行为违反明确预期。
- `TEST_IMPLEMENTATION_DEFECT`：脚本步骤、数据或断言不正确。
- `UNKNOWN`：普通断言差异或页面变化尚未完成人工/LLM归因，不得直接按脚本缺陷自愈。
- `CASE_DESCRIPTION_AMBIGUOUS`：用例描述无法唯一判断。
- `REQUIREMENT_CONFLICT`：用例、需求与产品规则冲突。
- `CLEANUP_FAILED`：功能结果已明确，但测试数据未清理。

功能状态与清理状态分开记录。正式测试必须在本次运行附件中报告`passed`、`not-applicable`或`retained-by-design`清理状态；仅写静态注解的`passed`不再可信，`not_reported`和非法状态禁止回写，`failed`会保留业务执行结果但使正式批次失败。普通失败必须完成归因后才能结束批次，`UNKNOWN`不能直接回写为可信历史。测试创建的数据必须使用运行ID/CASE-ID唯一前缀，创建后立即登记，并在`finally`或`afterEach`中逆序清理。被引用数据应先解除引用、换绑到安全基准数据或恢复原状态，再删除。系统明确禁止删除的基准数据可以保留，但必须记录`retained-by-design`及原因。清理后必须再次查询确认。

计划内用例不得使用`skip`跳过。环境、数据或需求问题必须执行到明确失败分类并写入本批结果。Playwright重试只保留最后一次尝试，不能将同一CASE-ID的多个尝试重复回写。

## 5. 报告

所有正式执行必须通过`run-ui-tests.ps1`。脚本会先清空`reports/latest`，确保本批原始结果不复用旧文件。普通失败不会阻止后续用例执行。完整回归使用`-Full`时也会先为`cases/current.csv`生成精确运行计划。

- `reports/latest/playwright-report/index.html`：本批可视化报告。
- `reports/execution_report.csv`：唯一 CSV 报告，包含当前全量有效用例及其最近可信状态（未执行、通过或未通过）。最后执行结果只有该CASE-ID重新执行时才更新；用例revision、脚本或审计失效只更新“自动化状态”，不得抹掉历史通过/失败。
- `reports/latest/test-results/`：本批失败截图、录像、Trace和错误上下文。
- `reports/history/evidence/<runId>/`：持久化历史证据；下一批清空`reports/latest`前，已合并结果的附件必须已经归档到这里。
- `reports/latest/run-manifest.json`：本批输入和执行清单。
- `reports/history/case-results.json`：按稳定CASE-ID保存的最近可信历史。

探测脚本和清理脚本是辅助工具，不得进入正式回归。正式批次结束前必须保证范围内每条用例均为通过、产品缺陷、环境阻塞、需求不明确或其他明确分类，且清理状态已记录。

## 6. 执行性能

- 正式批次启动时通过页面登录一次并生成临时 `storageState`，普通用例复用该登录态。验证登录、登出、禁用、删除会话等用例仍按用例步骤建立独立会话。
- 模块脚本优先直接进入模块URL；路由不可用时回退到菜单导航。公共模块初始化不得在同一用例中重复执行。
- 默认使用2个worker。用户管理、角色管理等共享会话或共享数据敏感脚本自动降为单worker；确定数据完全隔离后才提高并行度。
- 探索执行与正式回归分开。探测脚本不进入正式运行计划，正式回归不重复已完成的探索动作。
- 上一正式批次存在失败时，可以使用 `-FailedOnly` 生成只包含失败CASE-ID的新运行计划并正式复跑：

```powershell
.\run-ui-tests.ps1 -SourceCsv '<本批CSV>' -RunPlan '<上一批运行计划>' -FailedOnly -Password '<密码>'
```

- 测试数据准备和清理必须继续通过页面操作完成，不得直接调用业务API。允许复用登录态、直达页面和并行执行，但不能绕过页面来制造或删除业务数据。
