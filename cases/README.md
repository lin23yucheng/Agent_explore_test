# 当前用例资产

- `current.csv`：当前全部有效用例的唯一真源，不保存历史revision或退役用例。
- `id-sequence.json`：只保存下一个永不复用的CASE序号。
- `automation-registry.json`：只登记最近正式复跑通过的自动化。
- `candidates/`：直接探索通过后、等待promotion复跑的临时候选登记。
- `iterations/`：FreeMind转换出的本次增量输入。
- `changes/`：本次增量与当前快照的审核计划。
- `contracts/`：当前CASE的执行契约。
- `audits/`：候选或正式脚本的逐项覆盖审计。
- `runs/`：精确CASE-ID运行计划。

修改业务用例时删除旧ID并分配新ID。删除只能来自明确指令。迭代文件中没有出现的当前用例继续有效。

执行报告必须通过`python scripts/testflow.py sync-report`与current保持一一对应。正式自动化只能由候选脚本promotion复跑通过后产生。
