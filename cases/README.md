# 用例数据目录

- `iterations/`存放每个迭代独立生成的CSV文件。
- `current.csv`由`case-registry.json`中的有效用例生成。
- `changes/`存放可审计的用例变更计划。
- `automation-registry.json`记录稳定用例ID与可复用Playwright脚本的映射。

不要手工将迭代CSV合并到`current.csv`，统一使用`scripts/testflow.py`处理。

第一版使用`bootstrap`建立基线；后续版本使用`prepare`生成变更计划，经Agent审核为`reviewed`后使用`apply`。`apply`会把迭代用例合并到当前全量用例库，迭代CSV中没有出现的历史有效用例不会被删除。
