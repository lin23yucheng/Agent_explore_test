import argparse
import json
import re
import shutil
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import testflow as flow


ROOT = flow.ROOT
CURRENT = flow.CURRENT
BATCH_RESULTS = ROOT / "reports" / "latest" / "playwright-results.json"
OUTPUT = flow.EXECUTION_REPORT
SUMMARY = ROOT / "reports" / "execution_summary.json"
EVIDENCE_ROOT = ROOT / "reports" / "evidence"
VALID_FAILURE_CATEGORIES = flow.VALID_FAILURE_CATEGORIES


def has_archivable_evidence(result):
    return any(
        item.get("name") != "cleanup-status.json" and (item.get("path") or item.get("body"))
        for item in result.get("attachments", [])
    )


def safe_name(value, limit=100):
    value = re.sub(r'[<>:"/\\|?*\x00-\x1f]', "_", str(value or "")).strip(" .")
    return (value or "unnamed")[:limit]


def archive_attachments(result, case_id):
    run_id = result.get("runId") or "unknown-run"
    destination_root = EVIDENCE_ROOT / safe_name(run_id) / safe_name(case_id)
    archived = []
    for index, item in enumerate(result.get("attachments", []), start=1):
        name = item.get("name") or f"attachment-{index}"
        if name == "cleanup-status.json":
            continue
        source_value = item.get("path", "")
        source = Path(source_value) if source_value else None
        if source and not source.is_absolute():
            source = ROOT / source
        destination_root.mkdir(parents=True, exist_ok=True)
        if source and source.exists():
            destination = destination_root / f"{index:02d}-{safe_name(source.name, 120)}"
            if source.is_dir():
                shutil.copytree(source, destination, dirs_exist_ok=True)
            else:
                shutil.copy2(source, destination)
        elif item.get("body"):
            suffix = ".json" if name.endswith(".json") else ".txt"
            destination = destination_root / f"{index:02d}-{safe_name(name, 100)}{suffix}"
            destination.write_text(str(item["body"]), encoding="utf-8")
        else:
            continue
        archived.append(destination.resolve().relative_to(ROOT.resolve()).as_posix())
    return archived


def load_run_plan(path):
    path = Path(path).resolve()
    plan = flow.load_json(path, {})
    if plan.get("status") != "ready":
        raise SystemExit("运行计划状态不是ready")
    if Path(plan.get("currentCsv", "")).resolve() != CURRENT.resolve():
        raise SystemExit("运行计划未绑定当前current.csv")
    if plan.get("currentHash") != flow.hash_file(CURRENT):
        raise SystemExit("current.csv在运行计划生成后发生变化")
    source = Path(plan.get("sourceCsv", ""))
    if not source.is_file() or plan.get("sourceHash") != flow.hash_file(source):
        raise SystemExit("运行计划输入CSV不存在或已经变化")
    return plan


def validate_binding(binding, case, automation):
    if binding.get("caseContentHash") != case["用例内容哈希"]:
        return "用例内容哈希与运行计划不一致"
    spec_path = flow.safe_spec_path(binding.get("file", ""))
    if not spec_path.is_file() or binding.get("implementationHash") != flow.hash_file(spec_path):
        return "脚本文件不存在或在运行计划生成后变化"
    audit_path = ROOT / binding.get("auditFile", "")
    if not audit_path.is_file() or binding.get("auditHash") != flow.hash_file(audit_path):
        return "覆盖审计不存在或在运行计划生成后变化"
    if binding.get("bindingType") == "promotion":
        entry = flow.load_json(flow.CANDIDATES_ROOT / f"{case['用例ID']}.json", {})
    else:
        entry = automation.get("cases", {}).get(case["用例ID"], {})
    for key in ["caseContentHash", "contractHash", "testTitle", "file",
                "implementationHash", "auditFile", "auditHash"]:
        if entry.get(key) != binding.get(key):
            return f"自动化登记字段{key}与运行计划不一致"
    return ""


def validate_results(raw_results, plan, current, automation):
    planned_ids = plan.get("caseIds", [])
    if len(planned_ids) != len(set(planned_ids)):
        raise SystemExit("运行计划包含重复CASE-ID")
    bindings = plan.get("bindings", [])
    binding_by_id = {item.get("caseId"): item for item in bindings}
    if len(binding_by_id) != len(bindings) or set(binding_by_id) != set(planned_ids):
        raise SystemExit("运行计划bindings与caseIds不是一一对应")
    current_by_id = {row["用例ID"]: row for row in current}
    seen = set()
    errors = []
    by_id = {}
    for result in raw_results:
        cleanup = result.get("cleanupStatus")
        cleanup_issue = ""
        if cleanup not in flow.VALID_CLEANUP_STATUSES:
            cleanup_issue = f"清理状态非法或未报告: {cleanup or '<空>'}"
        elif cleanup == "passed" and not result.get("cleanupReportedDynamically"):
            cleanup_issue = "清理成功只做了静态声明，未动态验证"
        if cleanup_issue:
            result["cleanupStatus"] = "unverified"
            if result.get("failureCategory") not in VALID_FAILURE_CATEGORIES:
                result["failureCategory"] = "UNCLASSIFIED"
            result["error"] = "; ".join(
                value for value in [result.get("error", ""), cleanup_issue] if value
            )
            if not has_archivable_evidence(result):
                result.setdefault("attachments", []).append({
                    "name": "cleanup-unverified",
                    "path": "",
                    "body": cleanup_issue,
                })
        elif cleanup == "failed" and not has_archivable_evidence(result):
            result.setdefault("attachments", []).append({
                "name": "cleanup-failed-context",
                "path": "",
                "body": result.get("error") or "测试数据清理失败",
            })
        case_ids = list(dict.fromkeys(result.get("caseIds", [])))
        if len(case_ids) != 1:
            errors.append(f"{result.get('title') or '<无标题>'}关联{len(case_ids)}个CASE-ID")
            continue
        case_id = case_ids[0]
        if case_id in seen:
            errors.append(f"{case_id}在本批产生多个结果")
            continue
        seen.add(case_id)
        binding = binding_by_id.get(case_id)
        case = current_by_id.get(case_id)
        if not binding or not case:
            errors.append(f"{case_id}不在当前运行计划或current.csv中")
            continue
        if result.get("title") != binding.get("testTitle"):
            errors.append(f"{case_id}测试标题与运行计划不一致")
        if result.get("status") == "skipped":
            errors.append(f"{case_id}被跳过")
        cleanup = result.get("cleanupStatus")
        successful = result.get("status") == "passed" and cleanup in {
            "passed", "not-applicable", "retained-by-design",
        }
        if not successful and result.get("failureCategory") not in VALID_FAILURE_CATEGORIES:
            errors.append(f"{case_id}失败尚未完成归因")
        if cleanup == "failed" and result.get("failureCategory") != "CLEANUP_FAILED":
            errors.append(f"{case_id}清理失败必须分类为CLEANUP_FAILED")
        if not successful and not has_archivable_evidence(result):
            errors.append(f"{case_id}失败结果缺少截图、录像、Trace或错误上下文证据")
        issue = validate_binding(binding, case, automation)
        if issue:
            errors.append(f"{case_id}{issue}")
        by_id[case_id] = result
    missing = sorted(set(planned_ids) - seen)
    if missing:
        errors.append("计划用例缺少结果: " + ", ".join(missing))
    if errors:
        raise SystemExit("拒绝合并不可信结果：" + "；".join(errors[:30]))
    return by_id, binding_by_id


def promote_candidate(case_id, binding, result, automation):
    candidate_path = flow.CANDIDATES_ROOT / f"{case_id}.json"
    candidate = flow.load_json(candidate_path, {})
    entry = {**candidate, "status": "active", "lastPassedAt": result.get("executedAt") or flow.now_iso(),
             "lastRunId": result.get("runId", "")}
    entry.pop("explorationEvidence", None)
    automation.setdefault("cases", {})[case_id] = entry
    flow.remove_file_if_present(candidate_path)
    return entry


def merge_results(plan, raw_results):
    current = flow.load_current()
    report_rows = flow.sync_report()
    report_by_id = {row["用例ID"]: row for row in report_rows}
    automation = flow.load_automation()
    results, bindings = validate_results(raw_results, plan, current, automation)
    passed = failed = 0
    for case_id in plan["caseIds"]:
        result = results[case_id]
        binding = bindings[case_id]
        cleanup = result.get("cleanupStatus", "")
        successful = result.get("status") == "passed" and cleanup in {
            "passed", "not-applicable", "retained-by-design",
        }
        evidence = archive_attachments(result, case_id)
        row = report_by_id[case_id]
        row.update({
            "执行结果": "通过" if successful else "未通过",
            "失败分类": "" if successful else (
                "CLEANUP_FAILED" if cleanup == "failed" else result.get("failureCategory", "")
            ),
            "清理状态": cleanup,
            "执行时间": result.get("executedAt") or flow.now_iso(),
            "运行ID": result.get("runId", ""),
            "失败原因": "" if successful else result.get("error", ""),
            "证据路径": "; ".join(evidence),
        })
        if successful:
            if binding.get("bindingType") == "promotion":
                entry = promote_candidate(case_id, binding, result, automation)
            else:
                entry = automation["cases"][case_id]
                entry["lastPassedAt"] = row["执行时间"]
                entry["lastRunId"] = row["运行ID"]
            row["自动化状态"] = "已自动化"
            row["Playwright测试"] = entry["testTitle"]
            row["脚本路径"] = entry["file"]
            passed += 1
        else:
            flow.remove_case_assets(case_id, automation, delete_script=True)
            row["自动化状态"] = "未自动化"
            row["Playwright测试"] = ""
            row["脚本路径"] = ""
            failed += 1
    automation["updatedAt"] = flow.now_iso()
    flow.write_json_atomic(flow.AUTOMATION_REGISTRY, automation)
    output = [report_by_id[row["用例ID"]] for row in current]
    flow.write_csv_atomic(OUTPUT, output, [*flow.CURRENT_HEADERS, *flow.RESULT_HEADERS])
    summary = flow.write_execution_summary(
        output, batch_passed=passed, batch_failed=failed, path=SUMMARY,
    )
    return summary


def main():
    parser = flow.ChineseArgumentParser(description="合并当前批次结果并维护通过脚本状态。")
    parser.add_argument("--run-plan", required=True)
    parser.add_argument("--batch-results", default=str(BATCH_RESULTS))
    args = parser.parse_args()
    plan = load_run_plan(args.run_plan)
    batch_path = Path(args.batch_results)
    if not batch_path.is_file():
        raise SystemExit(f"本批Playwright结果不存在: {batch_path}")
    raw_results = flow.load_json(batch_path, [])
    summary = merge_results(plan, raw_results)
    print(json.dumps({"结果已合并": str(OUTPUT), "汇总": summary}, ensure_ascii=False))


if __name__ == "__main__":
    main()
