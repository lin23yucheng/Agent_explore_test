# 新项目接入说明

说明：用户没有特殊说明看这份文档时，该文档内容不需要管，不需要看。

适用场景：将这套测试工程完整复制到另一个系统后，使用新的 FreeMind 测试点建立该系统的当前测试快照。除目标地址、账号和测试点外，执行流程沿用本工程的 `AGENTS.md`。

这里的“清理旧测试数据”专指仓库中的测试资产和执行状态，不是删除目标系统页面中的业务数据。

## `tests/ui/` 的迁移规则

复制工程后，`tests/ui/` 也按“框架代码保留、旧项目业务测试清空”处理：

- 保留：`global-setup.js`、`helpers/` 中已经验证为通用的登录、CASE 绑定和基础辅助代码；迁移后必须重新确认定位器是否仍适用。
- 清空：`specs/` 下所有旧项目 `CASE-*.spec.js` 正式脚本。
- 清空：`probes/` 下旧项目的探索、诊断和环境探针；仅保留目录占位文件，新的探索按新 `.mm` 用例重新产生。
- 视项目需要保留：`maintenance/` 下真正通用的维护脚本；旧业务专用维护脚本应删除。

不要把旧 `tests/ui/specs/` 脚本改名后继续使用。新 `.mm` 产生的 CASE-ID 必须重新探索、审计、登记和晋级。若某个 helper 内含旧系统页面定位器或业务字段，应在首次探索前修正或重写。

## 目录迁移清单

以下清单以当前工程目录为准。清理是指清理目录中的旧项目内容；需要保留目录结构时只保留 `.gitkeep` 或空目录。

| 目录 | 处理 | 原因 |
| --- | --- | --- |
| `.agents/` | 保留 | Agent/协作配置，不属于业务测试结果。 |
| `.auth/` | 保留并更新 | 登录状态或认证配置可能被框架使用；删除旧缓存，不能提交密码。 |
| `.idea/` | 保留 | IDE 工程配置，不是项目测试数据。 |
| `cases/` | 清理旧内容后重建 | 当前用例、契约、审计、候选和运行计划都绑定旧项目。 |
| `cases/.state-backups/` | 先恢复检查，再清理 | 是状态恢复资产；不能用直接删除绕过未完成事务。 |
| `cases/.transactions/` | 先恢复检查，再清理 | 可能存在未提交事务，必须按 `AGENTS.md` 收尾。 |
| `cases/audits/` | 清理 | 旧 CASE 覆盖审计。 |
| `cases/candidates/` | 清理 | 旧候选脚本登记。 |
| `cases/changes/` | 清理 | 旧项目变更计划。 |
| `cases/contracts/` | 清理 | 旧用例执行契约。 |
| `cases/explorations/` | 清理 | 旧探索检查点。 |
| `cases/iterations/` | 清理 | 旧 `.mm` 转换迭代 CSV。 |
| `cases/runs/` | 清理 | 旧运行计划。 |
| `config/` | 保留并复核 | 保留测试框架配置；清理 `config/reports/` 下旧报告输出。 |
| `docs/` | 保留 | 测试流程、数据规则和迁移说明是框架规范。 |
| `inputs/freemind/` | 清理旧文件 | 只保留本次新项目提供的 `.mm` 文件。 |
| `reports/` | 清理 | 全部是旧执行结果、证据、失败记录或维护队列。 |
| `reports/latest/` | 清理 | 不能把旧批次当作新项目当前结果。 |
| `reports/history/` | 清理 | 旧项目历史报告不适用于新项目。 |
| `reports/interrupted/` | 清理 | 旧项目中断批次现场。先确认没有运行中的进程。 |
| `reports/evidence/` | 清理 | 旧探索和执行证据。 |
| `reports/maintenance/` | 清理后按需重建 | 旧项目待清理任务。 |
| `reports/rechecks/` | 清理 | 旧失败用例复核证据。 |
| `scripts/` | 保留 | 测试转换、状态管理、报告合并和执行器属于通用框架。 |
| `tests/ui/` | 按下表处理 | 同时包含框架代码和旧业务脚本。 |
| `tests/ui/helpers/` | 保留并逐个复核 | 可能含通用能力，也可能含旧系统定位器。 |
| `tests/ui/maintenance/` | 保留通用脚本，清理旧业务脚本 | 维护脚本是否适用取决于内容。 |
| `tests/ui/probes/` | 清理旧文件 | 探索、诊断和环境探针绑定旧页面行为。 |
| `tests/ui/specs/` | 清理旧文件 | 每个正式脚本只对应旧项目的 CASE-ID。 |
| `tests/unit/` | 保留并执行 | 测试框架或脚本自身的单元测试；若明确绑定旧业务，再单独清理。 |
| `venv/` | 保留，不纳入业务清理 | 本地 Python 运行环境；按依赖文件重建或复用。 |
| `__pycache__/`、各目录下缓存 | 清理 | Python/工具生成缓存，不是源代码。 |
| `.git/` | 保留 | 版本库元数据，不应作为测试资产删除。 |

根目录中的 `package.json`、Playwright 配置、Python 脚本和依赖文件默认保留；只有确认其中写死旧系统地址、旧业务名称或旧账号时才修改。

## 单文件迁移清单

| 文件或文件模式 | 处理 | 原因 |
| --- | --- | --- |
| `cases/current.csv` | 清理并由新 `.mm` 重建 | 新项目唯一当前用例来源。 |
| `cases/automation-registry.json` | 清理并初始化为空登记 | 所有映射都指向旧 CASE 脚本。 |
| `cases/id-sequence.json` | 清理并初始化新项目序号 | 不能携带旧项目 CASE-ID 序列；新项目内仍须保证新 ID 永不复用。 |
| `cases/known-pitfalls.json` | 清理旧项目条目后按当前格式重建 | 旧页面、控件和业务坑不能套用到新系统；新探索发现后重新登记。 |
| `cases/.testflow-state.lock` | 不直接删除 | 先确认没有运行进程并完成 `recovery-status`；锁仅能由正常恢复/结束流程消除。 |
| `cases/.state-backups/*.json` | 先恢复后清理 | 旧状态备份不能在未检查时直接删除。 |
| `cases/audits/CASE-*.json` | 清理 | 旧 CASE 的覆盖审计。 |
| `cases/contracts/CASE-*.json` | 清理 | 旧 CASE 的执行契约。 |
| `cases/candidates/*` | 清理 | 旧候选脚本映射。 |
| `cases/changes/*.json` | 清理 | 旧项目的合并/变更计划。 |
| `cases/iterations/*.{csv,json}` | 清理 | 旧 `.mm` 的转换结果和审核计划。 |
| `cases/runs/*.json` | 清理 | 旧精确运行计划。 |
| `reports/execution_report.csv` | 清理并由 `sync-report` 重建 | 旧项目执行状态不能继承。 |
| `reports/execution_summary.json` | 清理 | 由旧报告派生的汇总。 |
| `reports/.execution_report.csv.tmp` | 清理 | 中断或未完成写入留下的临时文件。 |
| `reports/pending-maintenance.json`（如存在） | 清理前先完成恢复检查 | 旧待维护/清理队列。 |
| `reports/latest/run-checkpoint.json`、`run-manifest.json`、`merge-receipt.json`、`playwright-results.json` | 清理 | 旧正式批次状态与结果。 |
| `reports/latest/playwright-report/`、`test-results/` | 清理 | 旧批次 HTML 报告和原始结果。 |
| `reports/evidence/**`、`reports/interrupted/**`、`reports/rechecks/**` | 清理 | 旧项目证据和中断现场。 |
| `inputs/freemind/*.mm` | 清理旧文件，放入新 `.mm` | 输入只能对应当前新项目。 |
| `tests/ui/specs/CASE-*.spec.js` | 清理 | 旧正式自动化与旧 CASE-ID 一一绑定。 |
| `tests/ui/probes/*.spec.js` | 清理 | 旧探索和诊断过程不可作为新系统证据。 |
| `tests/ui/helpers/*.js` | 保留并逐文件复核 | `case-test.js` 通常可直接保留；登录、角色、标签、任务等 helper 可能含旧业务或定位器。 |
| `tests/ui/global-setup.js` | 保留并更新 | 保留启动框架；替换旧环境地址、认证路径或初始化逻辑。 |
| `tests/unit/*` | 保留并执行 | 校验测试框架本身。仅删除明确断言旧业务的测试。 |
| `.auth/storage.json` | 清理并用新账号重新生成 | 旧系统会话、Cookie 和令牌无效且可能敏感。 |
| `.env` | 不提交；本地替换为新环境值 | 通常包含地址和凭据，不能沿用旧项目配置。 |
| `README.md` | 保留框架说明，更新项目名称/地址/业务描述 | 避免新项目保留旧项目文档。 |
| `AGENTS.md` | 保留 | 当前快照测试治理规则属于框架约束。 |
| `docs/TEST_EXECUTION.md`、`docs/TEST_DATA_GUIDE.md` | 保留 | 通用执行和数据规范。 |
| `docs/PROJECT_MIGRATION_BRIEF.md` | 保留并填写 | 新项目交接入口。 |
| `freemind_to_cases_AI.py`、`scripts/testflow.py`、`scripts/*.js`、`run-ui-tests.ps1` | 保留 | 用例转换、状态治理和执行框架。 |
| `package.json`、`package-lock.json`、`requirements.txt` | 保留并复核 | 依赖基线；仅在新系统需求变化时调整。 |
| `playwright.config.js`、`config/*.js` | 保留并更新 | 测试运行框架保留，但地址、认证或输出配置可能需调整。 |
| `.gitignore`、`.idea/.gitignore` | 保留 | 忽略规则。 |
| `.idea/workspace.xml` | 清理或不提交 | 本机临时 IDE 状态，不是可共享项目配置。 |
| 其他 `.idea/*.xml` | 保留 | 项目级 IDE 配置；若含旧项目名则更新。 |

## 用户只需填写

```text
系统名称：
测试环境地址：
登录账号：
登录密码：
新的测试点 .mm 文件路径：
测试点中的测试人员名单（用于转换时从名称/模块中去除）：
  - 
```

凭据只应填写在本地未提交文件或通过环境变量提供，不能提交到 Git。

测试人员名单是 `.mm` 转换配置，不是登录账号表。它用于识别测试点标题或模块路径中的署名标记，例如 `功能模块（张三）`；转换时应从用例标题和所属模块中移除这些姓名。Agent 必须把名单同步到 `config/tester-names.json`，再执行转换。

名单为空时不要凭经验删除姓名；只清理用户明确提供的名单。

## 给 Agent 的固定指令

```text
这是从既有测试工程复制出的新项目接入任务。

1. 先读取 AGENTS.md、docs/TEST_EXECUTION.md、docs/TEST_DATA_GUIDE.md 和本文件；
   在任何状态写入前执行 python scripts/testflow.py recovery-status。
2. 将这里提供的 .mm 文件转换为本次项目的迭代 CSV，并按 AGENTS.md 的 prepare、审核、apply 流程建立 current.csv。
3. 重置复制来源遗留的仓库测试资产：旧 `cases/current.csv`、执行报告、运行计划、自动化登记、候选、契约、审计、`tests/ui/specs/` 独立 CASE 脚本、`tests/ui/probes/` 旧探针、探索检查点、旧证据和批次检查点。
   这些资产属于旧项目，不能作为新项目的当前结果。必须先完成恢复检查；涉及事务、备份或未完成批次时，按 `AGENTS.md` 的恢复规则处理，不得直接删除恢复资产来绕过预检。
   不要因为本步骤去删除目标系统中的页面数据、数据库数据、账号或系统配置。
4. 将本文件中的测试人员名单写入 `config/tester-names.json`，确认转换器不再使用旧项目硬编码名单；然后使用新地址和凭据登录，严格依照新 CSV 的每条用例直接探索。没有正式脚本的用例不可跳过。
5. 对探索通过的用例，依照 AGENTS.md 生成独立 CASE 脚本、契约和审计，登记候选并执行 promotion 正式复跑；探索或正式复跑失败则按规则记录证据、归因并清理脚本。
6. 最后执行 sync-report 和 validate-state，确保新项目只保留当前 .mm 派生的用例、结果和最近正式通过的自动化脚本。

所有页面行为、控件结构、业务数据和断言必须通过直接探索确认，不得根据复制来源的旧脚本或旧结果推断。
```

## Agent 交付内容

- 新 `.mm` 到 `current.csv` 的转换及合并结果。
- 每个 CASE-ID 的当前执行结果、失败分类和证据。
- 当前有效的正式脚本、契约和覆盖审计。
- 已重置的旧仓库测试资产清单（不涉及目标系统业务数据）。
- `python scripts/testflow.py validate-state` 的通过结果，或明确的环境/需求阻塞项。
