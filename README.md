# AI FreeMind Test Workflow

把FreeMind测试点转换成当前有效用例快照，由Agent先直接探索页面，再将探索通过的用例生成独立Playwright候选脚本。候选脚本只有在正式复跑通过后才进入回归；任何失败都会撤销映射并删除该CASE脚本，只保留报告与证据。

## 核心资产

- `inputs/freemind/`：FreeMind测试点输入。
- `freemind_to_cases_AI.py`：测试点转增量CSV。
- `cases/current.csv`：当前全部有效用例的唯一真源。
- `reports/execution_report.csv`：当前用例的一对一执行视图。
- `scripts/testflow.py`：当前快照、变更计划、候选晋级和精确范围治理。
- `run-ui-tests.ps1`：正式Playwright批次入口。
- `tests/ui/specs/<CASE-ID>.spec.js`：最近正式通过的一CASE一文件脚本。
- `reports/evidence/`：失败证据，不作为可执行脚本历史。

项目不维护用例revision、retired/superseded链或历史通过结果。详细强制规则见`AGENTS.md`，操作说明见`docs/TEST_EXECUTION.md`。
