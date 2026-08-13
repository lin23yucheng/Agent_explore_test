# 用例数据目录

- `iterations/`存放每个迭代独立生成的CSV文件。
- `current.csv`由`case-registry.json`中的有效用例生成。
- `changes/`存放可审计的用例变更计划。
- `automation-registry.json`记录稳定用例ID与可复用Playwright脚本的映射。
- `contracts/`存放由当前用例revision生成的结构化执行契约。
- `audits/`存放Playwright实现对执行契约的逐项覆盖审计。
- `runs/`存放正式批次的精确CASE-ID运行计划。

不要手工将迭代CSV合并到`current.csv`，统一使用`scripts/testflow.py`处理。

第一版使用`bootstrap`建立基线；后续版本使用`prepare`生成变更计划，经Agent审核为`reviewed`后使用`apply`。`apply`会把迭代用例合并到当前全量用例库，迭代CSV中没有出现的历史有效用例不会被删除。

每条用例具有独立`revision`和`contractHash`。`modify`保留CASE-ID并递增revision；`replace`创建新CASE-ID并将旧用例标记为`superseded`；`retire`只用于功能明确删除且必须填写原因。用例退役只解除自动化映射，只有脚本不再覆盖任何有效用例时才能删除测试代码或文件。

自动化登记必须提供`cases/audits/<CASE-ID>.json`，并绑定脚本文件哈希。正式执行必须使用`make-run-plan`生成运行计划，再通过`run-ui-tests.ps1 -RunPlan`执行。
