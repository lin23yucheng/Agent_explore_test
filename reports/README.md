# 当前执行报告

- `execution_report.csv`：与`cases/current.csv`一一对应的当前执行状态。
- `execution_summary.json`：当前快照和最近批次汇总。
- `latest/`：最近一次正式批次的HTML、原始结果和附件。
- `evidence/<runId>/<CASE-ID>/`：失败截图、录像、Trace和错误上下文。

执行报告只保存当前CASE的最近结果。删除或修改产生新ID后，旧ID从报告移除。通过必须同时拥有有效正式脚本；未通过和未执行不得保留正式自动化映射。
