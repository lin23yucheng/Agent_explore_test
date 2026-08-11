# 测试报告目录

本目录是唯一的测试执行产物入口。

- `latest/`：最近一次正式批次的报告、原始结果和失败附件。
- `latest/playwright-report/index.html`：Playwright可视化报告。
- `execution_report.csv`：唯一 CSV 报告，包含当前全量有效用例及其最近可信状态（未执行、通过或未通过）。每次执行会原地更新。
- `latest/test-results/`：失败截图、录像、Trace和错误上下文。
- `latest/run-manifest.json`：本批输入、测试文件、时间和退出码。
- `history/case-results.json`：每个稳定CASE-ID的最近可信结果历史。

`playwright-report/`、`test-results/`和`test-evidence/`不再作为顶层目录使用。
