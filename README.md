# AI FreeMind Test Workflow

将FreeMind测试点转换成稳定用例资产，通过受约束的AI探索页面，沉淀Playwright脚本，并用精确CASE-ID运行计划执行可信回归。

## 目录

- `freemind_to_cases_AI.py`：FreeMind转用例的命令行入口。
- `run-ui-tests.ps1`：正式Playwright批次入口。
- `inputs/freemind/`：FreeMind测试点输入。
- `cases/`：用例注册表、当前有效用例、迭代、变更计划、契约、审计和运行计划。
- `tests/ui/specs/`：可复用的正式Playwright测试。
- `tests/ui/probes/`：页面探索脚本，不进入正式回归。
- `tests/ui/maintenance/`：测试数据清理等维护脚本，不进入正式回归。
- `tests/ui/helpers/`：共享Playwright辅助代码。
- `tests/unit/`：工作流治理单元测试。
- `scripts/`：用例生命周期、报告和Reporter实现。
- `config/`：辅助工具配置；正式Playwright配置仍保留在根目录。
- `reports/`：累计报告、执行历史和最近批次证据。
- `docs/`：执行协议和测试数据说明。

完整执行流程见 `docs/TEST_EXECUTION.md`。测试代理必须遵守根目录 `AGENTS.md`。

辅助脚本通过`npm run test:probes`或`npm run test:maintenance`运行，不会混入默认正式回归。
