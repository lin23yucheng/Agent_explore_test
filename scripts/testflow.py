import argparse
import csv
import difflib
import hashlib
import json
import os
import re
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CASES_ROOT = ROOT / "cases"
CURRENT = CASES_ROOT / "current.csv"
ID_SEQUENCE = CASES_ROOT / "id-sequence.json"
AUTOMATION_REGISTRY = CASES_ROOT / "automation-registry.json"
CANDIDATES_ROOT = CASES_ROOT / "candidates"
CHANGES_ROOT = CASES_ROOT / "changes"
CONTRACTS_ROOT = CASES_ROOT / "contracts"
AUDITS_ROOT = CASES_ROOT / "audits"
RUNS_ROOT = CASES_ROOT / "runs"
EXECUTION_REPORT = ROOT / "reports" / "execution_report.csv"
SPECS_ROOT = ROOT / "tests" / "ui" / "specs"

BUSINESS_HEADERS = [
    "源测试点ID", "所属模块", "用例标题", "前置条件", "步骤", "预期",
    "关键词", "优先级", "用例类型", "适用阶段",
]
EXECUTION_HEADERS = ["所属模块", "用例标题", "前置条件", "步骤", "预期"]
CURRENT_HEADERS = ["用例ID", "用例内容哈希", *BUSINESS_HEADERS]
RESULT_HEADERS = [
    "自动化状态", "执行结果", "失败分类", "清理状态", "执行时间",
    "运行ID", "失败原因", "证据路径", "Playwright测试", "脚本路径",
]
VALID_ACTIONS = {"add", "unchanged", "modify", "delete"}
VALID_CLEANUP_STATUSES = {"passed", "failed", "not-applicable", "retained-by-design"}
VALID_FAILURE_CATEGORIES = {
    "DATA_PRECONDITION_MISSING", "DATA_SETUP_FAILED", "ENVIRONMENT_BLOCKED",
    "PRODUCT_DEFECT", "TEST_IMPLEMENTATION_DEFECT", "CASE_DESCRIPTION_AMBIGUOUS",
    "REQUIREMENT_CONFLICT", "CLEANUP_FAILED",
}
CONTRACT_FIELDS = {"preconditions": "前置条件", "steps": "步骤", "assertions": "预期"}


class ChineseArgumentParser(argparse.ArgumentParser):
    def error(self, message):
        replacements = {
            "the following arguments are required": "缺少必填参数",
            "unrecognized arguments": "无法识别的参数",
            "invalid choice": "不支持的命令",
        }
        for source, target in replacements.items():
            message = message.replace(source, target)
        super().error(message)


def now_iso():
    return datetime.now().astimezone().isoformat(timespec="seconds")


def read_csv(path):
    path = Path(path)
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        return list(reader), reader.fieldnames or []


def write_csv_atomic(path, rows, headers):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.tmp")
    with temporary.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)
    os.replace(temporary, path)


def load_json(path, default):
    path = Path(path)
    if not path.is_file():
        return default
    with path.open("r", encoding="utf-8-sig") as handle:
        return json.load(handle)


def write_json_atomic(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(f".{path.name}.tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding="utf-8")
    os.replace(temporary, path)


def hash_file(path):
    path = Path(path)
    return hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else ""


def normalize_text(value):
    return str(value or "").replace("\r\n", "\n").replace("\r", "\n").strip()


def business_fields(row):
    return {header: normalize_text(row.get(header, "")) for header in BUSINESS_HEADERS}


def case_content_hash(row):
    payload = {header: normalize_text(row.get(header, "")) for header in EXECUTION_HEADERS}
    canonical = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def normalize_case(row, case_id=None):
    normalized = business_fields(row)
    normalized["用例ID"] = case_id or normalize_text(row.get("用例ID", ""))
    normalized["用例内容哈希"] = case_content_hash(normalized)
    return {header: normalized.get(header, "") for header in CURRENT_HEADERS}


def logical_key(row):
    return f"{normalize_text(row.get('所属模块'))}\x1f{normalize_text(row.get('用例标题'))}"


def load_current():
    if not CURRENT.is_file():
        raise SystemExit(f"当前有效用例文件不存在: {CURRENT}")
    rows, _ = read_csv(CURRENT)
    normalized = [normalize_case(row) for row in rows]
    validate_current_rows(normalized)
    return normalized


def validate_current_rows(rows):
    ids = [row.get("用例ID", "") for row in rows]
    missing = [index for index, value in enumerate(ids, start=1) if not value]
    duplicates = sorted({value for value in ids if value and ids.count(value) > 1})
    logical_keys = [logical_key(row) for row in rows]
    duplicate_titles = sorted({value for value in logical_keys
                               if value.strip("\x1f") and logical_keys.count(value) > 1})
    if missing:
        raise SystemExit("当前用例存在空CASE-ID，行号：" + ", ".join(map(str, missing)))
    if duplicates:
        raise SystemExit("当前用例存在重复CASE-ID：" + ", ".join(duplicates))
    if duplicate_titles:
        readable = [value.replace("\x1f", " / ") for value in duplicate_titles[:20]]
        raise SystemExit("当前用例存在重复模块和标题：" + "；".join(readable))


def empty_automation():
    return {"schemaVersion": 1, "updatedAt": "", "cases": {}}


def load_automation():
    value = load_json(AUTOMATION_REGISTRY, empty_automation())
    value.setdefault("cases", {})
    return value


def load_sequence(rows=None):
    state = load_json(ID_SEQUENCE, {})
    if int(state.get("nextSequence", 0) or 0) > 0:
        return state
    rows = rows if rows is not None else load_current()
    numbers = [int(match.group(1)) for row in rows
               if (match := re.fullmatch(r"CASE-(\d+)", row.get("用例ID", "")))]
    return {"schemaVersion": 1, "nextSequence": max(numbers, default=0) + 1}


def allocate_case_id(sequence):
    case_id = f"CASE-{int(sequence['nextSequence']):06d}"
    sequence["nextSequence"] = int(sequence["nextSequence"]) + 1
    return case_id


def split_contract_items(value):
    value = normalize_text(value)
    if not value:
        return []
    parts = re.split(r"\n+|[；;]+", value)
    items = []
    for part in parts:
        text = re.sub(r"^\s*(?:\d+[.、)]|[-*])\s*", "", part).strip()
        if text:
            items.append(text)
    return items


def execution_contract(case):
    contract = {
        "schemaVersion": 1,
        "caseId": case["用例ID"],
        "caseContentHash": case["用例内容哈希"],
        "title": case.get("用例标题", ""),
    }
    for contract_key, field_name in CONTRACT_FIELDS.items():
        prefix = {"preconditions": "P", "steps": "S", "assertions": "A"}[contract_key]
        contract[contract_key] = [
            {"id": f"{prefix}{index}", "text": text}
            for index, text in enumerate(split_contract_items(case.get(field_name, "")), start=1)
        ]
    canonical = json.dumps(contract, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    contract["contractHash"] = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    contract["completionGate"] = {
        "requiredCoverageIds": [
            item["id"] for key in CONTRACT_FIELDS for item in contract[key]
        ],
        "passRequiresCompleteCoverage": True,
    }
    return contract


def find_case(case_id):
    return next((row for row in load_current() if row["用例ID"] == case_id), None)


def write_contract(case, output=None):
    output = Path(output) if output else CONTRACTS_ROOT / f"{case['用例ID']}.json"
    contract = execution_contract(case)
    write_json_atomic(output, contract)
    return output, contract


def export_contracts(case_ids=None, output_dir=None):
    rows = load_current()
    selected = rows if not case_ids else [row for row in rows if row["用例ID"] in case_ids]
    if case_ids:
        missing = sorted(set(case_ids) - {row["用例ID"] for row in selected})
        if missing:
            raise SystemExit("找不到当前有效用例：" + ", ".join(missing))
    root = Path(output_dir) if output_dir else CONTRACTS_ROOT
    for row in selected:
        write_contract(row, root / f"{row['用例ID']}.json")
    print(json.dumps({"已导出契约数": len(selected), "目录": str(root)}, ensure_ascii=False, indent=2))


def audit_is_specific(item):
    implementation = normalize_text(item.get("implementation"))
    evidence = normalize_text(item.get("evidence"))
    if not implementation or not evidence:
        return False
    combined = f"{implementation} {evidence}".lower()
    generic = ["按当前case契约", "对应断言通过", "正式执行时", "已覆盖", "见脚本", "todo"]
    return len(implementation) >= 8 and len(evidence) >= 8 and not any(value in combined for value in generic)


def make_audit_template(case_id, test_title, spec_file, output=None):
    case = find_case(case_id)
    if not case:
        raise SystemExit(f"找不到当前有效用例: {case_id}")
    contract_path, contract = write_contract(case)
    output = Path(output) if output else AUDITS_ROOT / f"{case_id}.json"
    coverage = []
    for key in CONTRACT_FIELDS:
        for item in contract[key]:
            coverage.append({"id": item["id"], "text": item["text"], "implementation": "", "evidence": ""})
    payload = {
        "schemaVersion": 1,
        "caseId": case_id,
        "caseContentHash": case["用例内容哈希"],
        "contractHash": contract["contractHash"],
        "testTitle": test_title,
        "file": spec_file.replace("\\", "/"),
        "contractFile": str(contract_path.relative_to(ROOT)).replace("\\", "/"),
        "coverage": coverage,
    }
    write_json_atomic(output, payload)
    print(json.dumps({"覆盖审计模板": str(output), "覆盖项数": len(coverage)}, ensure_ascii=False, indent=2))


def validate_audit(audit_path, case, spec_file, test_title):
    audit_path = Path(audit_path)
    if not audit_path.is_absolute():
        audit_path = ROOT / audit_path
    audit = load_json(audit_path, {})
    contract = execution_contract(case)
    if audit.get("caseId") != case["用例ID"]:
        raise SystemExit("覆盖审计绑定的CASE-ID不一致")
    if audit.get("caseContentHash") != case["用例内容哈希"]:
        raise SystemExit("覆盖审计绑定的用例内容已变化")
    if audit.get("contractHash") != contract["contractHash"]:
        raise SystemExit("覆盖审计绑定的执行契约已变化")
    if audit.get("testTitle") != test_title:
        raise SystemExit("覆盖审计绑定的测试标题不一致")
    if audit.get("file", "").replace("\\", "/") != spec_file.replace("\\", "/"):
        raise SystemExit("覆盖审计绑定的脚本文件不一致")
    required = contract["completionGate"]["requiredCoverageIds"]
    items = audit.get("coverage", [])
    ids = [item.get("id") for item in items]
    missing = sorted(set(required) - set(ids))
    extra = sorted(set(ids) - set(required))
    duplicate = sorted({value for value in ids if value and ids.count(value) > 1})
    incomplete = [item.get("id") for item in items if not audit_is_specific(item)]
    if missing or extra or duplicate or incomplete:
        raise SystemExit(
            "覆盖审计未完成："
            f"缺少={missing or '无'}；多余={extra or '无'}；重复={duplicate or '无'}；"
            f"描述不具体={incomplete or '无'}"
        )
    return audit_path, contract


def safe_spec_path(spec_file):
    path = (ROOT / spec_file).resolve()
    try:
        path.relative_to(SPECS_ROOT.resolve())
    except ValueError as error:
        raise SystemExit("正式脚本必须位于 tests/ui/specs 目录") from error
    return path


def remove_file_if_present(path):
    path = Path(path)
    if path.is_file():
        path.unlink()


def remove_case_assets(case_id, automation=None, delete_script=True):
    automation = automation if automation is not None else load_automation()
    entry = automation.get("cases", {}).pop(case_id, None)
    candidate_path = CANDIDATES_ROOT / f"{case_id}.json"
    candidate = load_json(candidate_path, {})
    files = []
    if entry and entry.get("file"):
        files.append(entry["file"])
    if candidate.get("file"):
        files.append(candidate["file"])
    if delete_script:
        other_files = {
            value.get("file") for value in automation.get("cases", {}).values() if value.get("file")
        }
        for value in CANDIDATES_ROOT.glob("*.json") if CANDIDATES_ROOT.is_dir() else []:
            if value != candidate_path:
                other_files.add(load_json(value, {}).get("file"))
        for spec_file in set(files) - other_files:
            remove_file_if_present(safe_spec_path(spec_file))
    remove_file_if_present(candidate_path)
    remove_file_if_present(CONTRACTS_ROOT / f"{case_id}.json")
    remove_file_if_present(AUDITS_ROOT / f"{case_id}.json")
    return entry or candidate


def valid_active_entry(case, entry):
    if not entry or entry.get("status") != "active":
        return False, "自动化状态不是active"
    if entry.get("caseContentHash") != case["用例内容哈希"]:
        return False, "自动化绑定的用例内容已变化"
    contract = execution_contract(case)
    if entry.get("contractHash") != contract["contractHash"]:
        return False, "自动化绑定的执行契约已变化"
    spec_file = entry.get("file", "")
    try:
        spec_path = safe_spec_path(spec_file)
    except SystemExit as error:
        return False, str(error)
    if not spec_path.is_file():
        return False, "脚本文件不存在"
    if entry.get("implementationHash") != hash_file(spec_path):
        return False, "脚本文件已变化"
    audit_file = ROOT / entry.get("auditFile", "")
    if not audit_file.is_file() or entry.get("auditHash") != hash_file(audit_file):
        return False, "覆盖审计不存在或已变化"
    try:
        validate_audit(audit_file, case, spec_file, entry.get("testTitle", ""))
    except SystemExit as error:
        return False, str(error)
    return True, ""


def initial_result_fields():
    return {
        "自动化状态": "未自动化", "执行结果": "未执行", "失败分类": "",
        "清理状态": "未执行", "执行时间": "", "运行ID": "", "失败原因": "",
        "证据路径": "", "Playwright测试": "", "脚本路径": "",
    }


def write_execution_summary(rows, batch_passed=None, batch_failed=None, path=None):
    summary_path = Path(path) if path else ROOT / "reports" / "execution_summary.json"
    previous = load_json(summary_path, {})
    summary = {
        "source_case_count": len(rows),
        "passed_case_count": sum(row["执行结果"] == "通过" for row in rows),
        "failed_case_count": sum(row["执行结果"] == "未通过" for row in rows),
        "not_executed_case_count": sum(row["执行结果"] == "未执行" for row in rows),
        "automated_case_count": sum(row["自动化状态"] == "已自动化" for row in rows),
        "batch_passed_case_count": (
            previous.get("batch_passed_case_count", 0) if batch_passed is None else batch_passed
        ),
        "batch_failed_case_count": (
            previous.get("batch_failed_case_count", 0) if batch_failed is None else batch_failed
        ),
    }
    write_json_atomic(summary_path, summary)
    return summary


def sync_report(reset=False):
    current = load_current()
    old_rows = []
    if EXECUTION_REPORT.is_file() and not reset:
        old_rows, _ = read_csv(EXECUTION_REPORT)
    old_by_id = {row.get("用例ID", ""): row for row in old_rows}
    automation = load_automation()
    output = []
    for case in current:
        previous = old_by_id.get(case["用例ID"])
        fields = initial_result_fields()
        if previous and previous.get("用例内容哈希") == case["用例内容哈希"]:
            fields.update({header: previous.get(header, fields[header]) for header in RESULT_HEADERS})
        entry = automation.get("cases", {}).get(case["用例ID"])
        active, _ = valid_active_entry(case, entry)
        if fields["执行结果"] == "通过" and active:
            fields["自动化状态"] = "已自动化"
            fields["Playwright测试"] = entry.get("testTitle", "")
            fields["脚本路径"] = entry.get("file", "")
        elif fields["执行结果"] == "通过":
            fields = initial_result_fields()
        else:
            fields["自动化状态"] = "未自动化"
            fields["Playwright测试"] = ""
            fields["脚本路径"] = ""
        output.append({**case, **fields})
    write_csv_atomic(EXECUTION_REPORT, output, [*CURRENT_HEADERS, *RESULT_HEADERS])
    if reset:
        write_execution_summary(output, batch_passed=0, batch_failed=0)
    else:
        write_execution_summary(output)
    print(json.dumps({
        "当前有效用例数": len(current), "执行报告行数": len(output),
        "报告": str(EXECUTION_REPORT), "模式": "重置" if reset else "同步",
    }, ensure_ascii=False, indent=2))
    return output


def reset_state():
    rows, _ = read_csv(CURRENT)
    normalized = [normalize_case(row) for row in rows]
    validate_current_rows(normalized)
    write_csv_atomic(CURRENT, normalized, CURRENT_HEADERS)
    sequence = load_sequence(normalized)
    write_json_atomic(ID_SEQUENCE, sequence)
    write_json_atomic(AUTOMATION_REGISTRY, empty_automation())
    CANDIDATES_ROOT.mkdir(parents=True, exist_ok=True)
    for path in CANDIDATES_ROOT.glob("*.json"):
        path.unlink()
    sync_report(reset=True)
    print(json.dumps({
        "已重置用例数": len(normalized), "下一个CASE序号": sequence["nextSequence"],
        "历史结果": "已清空", "正式自动化": "已清空",
    }, ensure_ascii=False, indent=2))


def similarity(row, case):
    title_score = difflib.SequenceMatcher(None, row.get("用例标题", ""), case.get("用例标题", "")).ratio()
    module_score = difflib.SequenceMatcher(None, row.get("所属模块", ""), case.get("所属模块", "")).ratio()
    return round(title_score * 0.8 + module_score * 0.2, 4)


def candidate_cases(row, current, limit=5):
    scored = sorted(((similarity(row, case), case) for case in current), reverse=True,
                    key=lambda item: item[0])
    return [{"caseId": case["用例ID"], "title": case["用例标题"],
             "module": case["所属模块"], "score": score}
            for score, case in scored[:limit] if score >= 0.45]


def prepare(source, output=None):
    source = Path(source).resolve()
    input_rows, _ = read_csv(source)
    current = load_current()
    by_id = {row["用例ID"]: row for row in current}
    by_key = {}
    by_source = {}
    for case in current:
        by_key.setdefault(logical_key(case), []).append(case)
        if case.get("源测试点ID"):
            by_source.setdefault(case["源测试点ID"], []).append(case)
    seen = set()
    seen_titles = set()
    items = []
    uncertain = []
    for index, raw in enumerate(input_rows, start=1):
        row = normalize_case(raw)
        duplicate_key = (logical_key(row), row["用例内容哈希"])
        if duplicate_key in seen:
            raise SystemExit(f"迭代CSV存在重复用例，行号: {index}")
        seen.add(duplicate_key)
        if logical_key(row) in seen_titles:
            raise SystemExit(f"迭代CSV存在重复模块和用例标题，行号: {index}，请先微调标题")
        seen_titles.add(logical_key(row))
        explicit = by_id.get(normalize_text(raw.get("用例ID")))
        exact = by_key.get(logical_key(row), [])
        source_matches = by_source.get(row.get("源测试点ID", ""), [])
        matched = explicit or (exact[0] if len(exact) == 1 else None)
        confidence = "explicit-id" if explicit else "exact-title" if matched else ""
        if not matched and len(source_matches) == 1:
            matched = source_matches[0]
            confidence = "source-node"
        candidates = [] if matched else candidate_cases(row, current)
        if matched:
            action = "unchanged" if row["用例内容哈希"] == matched["用例内容哈希"] else "modify"
            target = matched["用例ID"]
        elif candidates and candidates[0]["score"] >= 0.70:
            action = "review"
            target = ""
            uncertain.append({"inputRow": index, "reason": "存在高相似历史用例，需确认新增或修改"})
            confidence = "needs-agent-review"
        else:
            action = "add"
            target = ""
            confidence = "new"
        items.append({
            "inputRow": index, "action": action, "targetCaseId": target,
            "reason": "", "confidence": confidence, "case": business_fields(row),
            "candidates": candidates,
        })
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    output = Path(output) if output else CHANGES_ROOT / f"merge-plan-{stamp}.json"
    plan = {
        "schemaVersion": 1, "status": "draft", "createdAt": now_iso(),
        "sourceCsv": str(source), "sourceHash": hash_file(source),
        "baseCurrentHash": hash_file(CURRENT),
        "rules": {"incrementalInput": True, "absenceNeverMeansDeletion": True,
                  "modifiedCaseGetsNewId": True, "agentReviewRequired": True},
        "items": items, "impactedRegressionCaseIds": [], "uncertain": uncertain,
    }
    write_json_atomic(output, plan)
    counts = {name: sum(item["action"] == name for item in items)
              for name in ["add", "unchanged", "modify", "review"]}
    print(json.dumps({"变更计划": str(output), "动作统计": counts,
                      "需要审核": True, "不确定项": len(uncertain)}, ensure_ascii=False, indent=2))


def apply_plan(plan_path):
    plan_path = Path(plan_path)
    plan = load_json(plan_path, {})
    if plan.get("status") != "reviewed":
        raise SystemExit("变更计划必须先由Agent审核并把status改为reviewed")
    if plan.get("uncertain"):
        raise SystemExit("变更计划仍包含uncertain项，不能应用")
    source = Path(plan.get("sourceCsv", ""))
    if not source.is_file() or hash_file(source) != plan.get("sourceHash"):
        raise SystemExit("迭代CSV不存在或在计划生成后发生变化")
    if hash_file(CURRENT) != plan.get("baseCurrentHash"):
        raise SystemExit("current.csv在计划生成后发生变化，请重新prepare")
    current = load_current()
    sequence = load_sequence(current)
    automation = load_automation()
    by_id = {row["用例ID"]: row for row in current}
    order = [row["用例ID"] for row in current]
    touched_targets = set()
    result_ids = []
    for item in plan.get("items", []):
        action = item.get("action")
        target = item.get("targetCaseId", "")
        if action not in VALID_ACTIONS:
            raise SystemExit(f"变更计划包含未审核动作: {action}")
        if target:
            if target in touched_targets:
                raise SystemExit(f"变更计划重复处理CASE-ID: {target}")
            touched_targets.add(target)
        if action == "unchanged":
            if target not in by_id:
                raise SystemExit(f"unchanged目标不存在: {target}")
            item["resultCaseId"] = target
            result_ids.append(target)
            continue
        if action == "delete":
            if target not in by_id or not normalize_text(item.get("reason")):
                raise SystemExit(f"delete必须提供有效targetCaseId和明确原因: {target}")
            by_id.pop(target)
            order.remove(target)
            remove_case_assets(target, automation)
            item["resultCaseId"] = ""
            continue
        normalized = normalize_case(item.get("case", {}))
        if action == "modify":
            if target not in by_id:
                raise SystemExit(f"modify目标不存在: {target}")
            position = order.index(target)
            by_id.pop(target)
            order.remove(target)
            remove_case_assets(target, automation)
        else:
            position = len(order)
        new_id = allocate_case_id(sequence)
        new_case = normalize_case(normalized, new_id)
        by_id[new_id] = new_case
        order.insert(position, new_id)
        item["resultCaseId"] = new_id
        result_ids.append(new_id)
    output = [by_id[case_id] for case_id in order]
    validate_current_rows(output)
    write_csv_atomic(CURRENT, output, CURRENT_HEADERS)
    write_json_atomic(ID_SEQUENCE, sequence)
    automation["updatedAt"] = now_iso()
    write_json_atomic(AUTOMATION_REGISTRY, automation)
    plan["status"] = "applied"
    plan["appliedAt"] = now_iso()
    plan["resultCaseIds"] = result_ids
    plan["appliedCurrentHash"] = hash_file(CURRENT)
    write_json_atomic(plan_path, plan)
    sync_report()
    print(json.dumps({"当前有效用例数": len(output), "本次结果用例ID": result_ids,
                      "当前用例文件": str(CURRENT)}, ensure_ascii=False, indent=2))


def register_candidate(case_id, test_title, spec_file, audit_path, exploration_evidence):
    case = find_case(case_id)
    if not case:
        raise SystemExit(f"找不到当前有效用例: {case_id}")
    if not normalize_text(exploration_evidence):
        raise SystemExit("候选脚本必须提供探索通过证据")
    if case_id not in test_title:
        raise SystemExit("正式测试标题必须包含CASE-ID，以区分当前库中的同名用例")
    normalized_file = spec_file.replace("\\", "/")
    spec_path = safe_spec_path(normalized_file)
    if not spec_path.is_file():
        raise SystemExit(f"候选脚本不存在: {normalized_file}")
    if spec_path.name != f"{case_id}.spec.js":
        raise SystemExit(f"每个候选脚本必须使用独立文件 tests/ui/specs/{case_id}.spec.js")
    audit_path, contract = validate_audit(audit_path, case, normalized_file, test_title)
    automation = load_automation()
    if case_id in automation.get("cases", {}):
        raise SystemExit("该用例已有正式自动化，必须先失效后再登记候选")
    CANDIDATES_ROOT.mkdir(parents=True, exist_ok=True)
    payload = {
        "schemaVersion": 1, "status": "candidate", "caseId": case_id,
        "caseContentHash": case["用例内容哈希"], "contractHash": contract["contractHash"],
        "testTitle": test_title, "file": normalized_file,
        "implementationHash": hash_file(spec_path),
        "auditFile": str(audit_path.relative_to(ROOT)).replace("\\", "/"),
        "auditHash": hash_file(audit_path), "explorationEvidence": exploration_evidence,
        "exploredAt": now_iso(),
    }
    write_json_atomic(CANDIDATES_ROOT / f"{case_id}.json", payload)
    print(json.dumps({"候选自动化": case_id, "脚本": normalized_file,
                      "下一步": "生成promotion运行计划并正式复跑"}, ensure_ascii=False, indent=2))


def invalidate_automation(case_ids, reason):
    if not normalize_text(reason):
        raise SystemExit("失效自动化必须填写原因")
    automation = load_automation()
    invalidated = []
    for case_id in list(dict.fromkeys(case_ids)):
        removed = remove_case_assets(case_id, automation)
        if removed:
            invalidated.append(case_id)
    automation["updatedAt"] = now_iso()
    write_json_atomic(AUTOMATION_REGISTRY, automation)
    sync_report()
    print(json.dumps({"已删除正式或候选自动化": invalidated, "原因": reason}, ensure_ascii=False, indent=2))


def record_exploration_failure(case_id, category, reason, cleanup_status, evidence, run_id=None):
    case = find_case(case_id)
    if not case:
        raise SystemExit(f"找不到当前有效用例: {case_id}")
    if category not in VALID_FAILURE_CATEGORIES:
        raise SystemExit(f"不支持的失败分类: {category}")
    if cleanup_status not in VALID_CLEANUP_STATUSES:
        raise SystemExit(f"不支持的清理状态: {cleanup_status}")
    if cleanup_status == "failed":
        category = "CLEANUP_FAILED"
    if not normalize_text(reason):
        raise SystemExit("探索失败必须记录具体原因")
    evidence = [normalize_text(value) for value in evidence if normalize_text(value)]
    if not evidence:
        raise SystemExit("探索失败必须提供截图、录像、Trace或错误上下文证据")
    automation = load_automation()
    remove_case_assets(case_id, automation, delete_script=True)
    automation["updatedAt"] = now_iso()
    write_json_atomic(AUTOMATION_REGISTRY, automation)
    report = sync_report()
    for row in report:
        if row["用例ID"] != case_id:
            continue
        row.update({
            "自动化状态": "未自动化", "执行结果": "未通过",
            "失败分类": category, "清理状态": cleanup_status,
            "执行时间": now_iso(),
            "运行ID": run_id or f"EXPLORATION-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "失败原因": reason, "证据路径": "; ".join(evidence),
            "Playwright测试": "", "脚本路径": "",
        })
        break
    write_csv_atomic(EXECUTION_REPORT, report, [*CURRENT_HEADERS, *RESULT_HEADERS])
    write_execution_summary(report)
    print(json.dumps({"用例ID": case_id, "执行结果": "未通过", "失败分类": category,
                      "清理状态": cleanup_status, "正式脚本": "无"}, ensure_ascii=False, indent=2))


def select_scope(source, plan_path=None, case_ids=None, modules=None):
    source = Path(source).resolve()
    current = load_current()
    by_id = {row["用例ID"]: row for row in current}
    selected_ids = []
    if source == CURRENT.resolve():
        selected_ids = [row["用例ID"] for row in current]
    else:
        if not plan_path:
            raise SystemExit("增量CSV必须提供已经apply的变更计划")
        plan = load_json(plan_path, {})
        if plan.get("status") != "applied":
            raise SystemExit("增量运行计划绑定的变更计划必须已经apply")
        if Path(plan.get("sourceCsv", "")).resolve() != source:
            raise SystemExit("变更计划sourceCsv与本次输入不一致")
        if hash_file(source) != plan.get("sourceHash"):
            raise SystemExit("增量CSV在变更计划应用后发生变化")
        if hash_file(CURRENT) != plan.get("appliedCurrentHash"):
            raise SystemExit("current.csv在变更计划应用后发生变化")
        selected_ids = list(plan.get("resultCaseIds", []))
        selected_ids.extend(plan.get("impactedRegressionCaseIds", []))
    if case_ids:
        requested = list(dict.fromkeys(case_ids))
        missing = [value for value in requested if value not in by_id]
        if missing:
            raise SystemExit("请求的CASE-ID不存在：" + ", ".join(missing))
        selected_ids = [value for value in selected_ids if value in requested]
    if modules:
        allowed = set(modules)
        selected_ids = [value for value in selected_ids if by_id[value].get("所属模块") in allowed]
    selected_ids = list(dict.fromkeys(value for value in selected_ids if value in by_id))
    if not selected_ids:
        raise SystemExit("执行范围为空")
    return source, [by_id[value] for value in selected_ids]


def candidate_binding(case):
    entry = load_json(CANDIDATES_ROOT / f"{case['用例ID']}.json", {})
    if not entry or entry.get("status") != "candidate":
        return None, "没有待晋级候选脚本"
    if entry.get("caseContentHash") != case["用例内容哈希"]:
        return None, "候选脚本绑定的用例内容已变化"
    spec_path = safe_spec_path(entry.get("file", ""))
    if not spec_path.is_file() or entry.get("implementationHash") != hash_file(spec_path):
        return None, "候选脚本不存在或已变化"
    audit_path = ROOT / entry.get("auditFile", "")
    if not audit_path.is_file() or entry.get("auditHash") != hash_file(audit_path):
        return None, "候选覆盖审计不存在或已变化"
    try:
        validate_audit(audit_path, case, entry["file"], entry["testTitle"])
    except SystemExit as error:
        return None, str(error)
    return entry, ""


def make_run_plan(source, plan_path=None, output=None, case_ids=None, modules=None,
                  promotion=False):
    source, cases = select_scope(source, plan_path, case_ids, modules)
    automation = load_automation()
    report_rows = sync_report()
    report_by_id = {row["用例ID"]: row for row in report_rows}
    bindings = []
    issues = []
    for case in cases:
        if promotion:
            entry, issue = candidate_binding(case)
            binding_type = "promotion"
        else:
            entry = automation.get("cases", {}).get(case["用例ID"])
            valid, issue = valid_active_entry(case, entry)
            entry = entry if valid else None
            binding_type = "active"
            if entry and report_by_id[case["用例ID"]].get("执行结果") != "通过":
                issue = "正式自动化没有对应的当前通过结果"
                entry = None
        if not entry:
            issues.append(f"{case['用例ID']}: {issue}")
            continue
        bindings.append({
            "caseId": case["用例ID"], "caseContentHash": case["用例内容哈希"],
            "contractHash": entry["contractHash"], "testTitle": entry["testTitle"],
            "file": entry["file"], "implementationHash": entry["implementationHash"],
            "auditFile": entry["auditFile"], "auditHash": entry["auditHash"],
            "bindingType": binding_type,
        })
    if issues:
        raise SystemExit("无法生成正式运行计划：" + "；".join(issues[:20]))
    titles = [item["testTitle"] for item in bindings]
    leaf_titles = [value.rsplit(" › ", 1)[-1] for value in titles]
    duplicate_titles = sorted({value for value in leaf_titles if leaf_titles.count(value) > 1})
    if duplicate_titles:
        raise SystemExit("运行计划包含重复叶子测试标题：" + "；".join(duplicate_titles))
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    output = Path(output) if output else RUNS_ROOT / f"run-plan-{stamp}.json"
    payload = {
        "schemaVersion": 2, "status": "ready", "createdAt": now_iso(),
        "runType": "promotion" if promotion else "regression",
        "sourceCsv": str(source), "sourceHash": hash_file(source),
        "currentCsv": str(CURRENT.resolve()), "currentHash": hash_file(CURRENT),
        "mergePlan": str(Path(plan_path).resolve()) if plan_path else "",
        "caseIds": [item["caseId"] for item in bindings], "testTitles": titles,
        "testFiles": sorted({item["file"] for item in bindings}), "bindings": bindings,
    }
    write_json_atomic(output, payload)
    print(json.dumps({"运行计划": str(output), "类型": payload["runType"],
                      "用例数": len(bindings), "脚本文件": payload["testFiles"]},
                     ensure_ascii=False, indent=2))
    return payload


def resolve_scope(source, plan_path=None, case_ids=None, modules=None, promotion=False):
    _, cases = select_scope(source, plan_path, case_ids, modules)
    automation = load_automation()
    output = []
    for case in cases:
        if promotion:
            entry, issue = candidate_binding(case)
        else:
            candidate = automation.get("cases", {}).get(case["用例ID"])
            valid, issue = valid_active_entry(case, candidate)
            entry = candidate if valid else None
        output.append({"用例ID": case["用例ID"], "所属模块": case["所属模块"],
                       "用例标题": case["用例标题"], "可执行": bool(entry),
                       "脚本": entry.get("file", "") if entry else "", "问题": issue})
    print(json.dumps({"范围用例数": len(output), "用例": output}, ensure_ascii=False, indent=2))


def validate_state(require_all_automated=False):
    current = load_current()
    report = sync_report()
    automation = load_automation()
    current_ids = [row["用例ID"] for row in current]
    report_ids = [row["用例ID"] for row in report]
    issues = []
    if current_ids != report_ids:
        issues.append("current.csv与execution_report.csv的ID或顺序不一致")
    by_id = {row["用例ID"]: row for row in current}
    registered_files = set()
    for result in report:
        case = by_id[result["用例ID"]]
        for header in CURRENT_HEADERS:
            if result.get(header, "") != case.get(header, ""):
                issues.append(f"{case['用例ID']}报告字段{header}与current.csv不一致")
                break
        entry = automation.get("cases", {}).get(case["用例ID"])
        active, reason = valid_active_entry(case, entry)
        if result.get("执行结果") == "通过" and not active:
            issues.append(f"{case['用例ID']}通过但没有有效自动化: {reason}")
        if result.get("执行结果") != "通过" and active:
            issues.append(f"{case['用例ID']}未通过或未执行但仍有正式自动化")
        if require_all_automated and (result.get("执行结果") != "通过" or not active):
            issues.append(f"{case['用例ID']}尚未达到完整回归条件")
        if active:
            if entry["file"] in registered_files:
                issues.append(f"脚本文件被多个CASE-ID共享: {entry['file']}")
            registered_files.add(entry["file"])
    orphan_files = []
    candidate_files = {
        load_json(path, {}).get("file") for path in CANDIDATES_ROOT.glob("*.json")
    } if CANDIDATES_ROOT.is_dir() else set()
    for path in SPECS_ROOT.glob("*.spec.js") if SPECS_ROOT.is_dir() else []:
        relative = str(path.relative_to(ROOT)).replace("\\", "/")
        if relative not in registered_files and relative not in candidate_files:
            orphan_files.append(relative)
    if orphan_files:
        issues.append("存在未登记正式脚本：" + ", ".join(orphan_files))
    if issues:
        raise SystemExit("状态校验失败：" + "；".join(issues[:30]))
    print(json.dumps({"检查结果": "通过", "当前用例数": len(current),
                      "正式自动化数": len(registered_files),
                      "完整回归就绪": require_all_automated}, ensure_ascii=False, indent=2))


def main():
    parser = ChineseArgumentParser(description="管理当前用例快照、通过脚本和精确执行范围。")
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("reset-state", help="保留current.csv业务用例并清空执行与自动化状态")
    subparsers.add_parser("sync-report", help="让执行报告严格镜像current.csv")

    prepare_parser = subparsers.add_parser("prepare")
    prepare_parser.add_argument("source")
    prepare_parser.add_argument("--output")
    apply_parser = subparsers.add_parser("apply")
    apply_parser.add_argument("plan")

    contract_parser = subparsers.add_parser("export-contract")
    contract_parser.add_argument("--case-id", action="append")
    contract_parser.add_argument("--output-dir")
    audit_parser = subparsers.add_parser("make-audit-template")
    audit_parser.add_argument("--case-id", required=True)
    audit_parser.add_argument("--test-title", required=True)
    audit_parser.add_argument("--file", required=True)
    audit_parser.add_argument("--output")
    candidate_parser = subparsers.add_parser("register-candidate")
    candidate_parser.add_argument("--case-id", required=True)
    candidate_parser.add_argument("--test-title", required=True)
    candidate_parser.add_argument("--file", required=True)
    candidate_parser.add_argument("--audit", required=True)
    candidate_parser.add_argument("--exploration-evidence", required=True)
    invalidate_parser = subparsers.add_parser("invalidate-automation")
    invalidate_parser.add_argument("--case-id", action="append", required=True)
    invalidate_parser.add_argument("--reason", required=True)
    failure_parser = subparsers.add_parser("record-exploration-failure")
    failure_parser.add_argument("--case-id", required=True)
    failure_parser.add_argument("--failure-category", required=True,
                                choices=sorted(VALID_FAILURE_CATEGORIES))
    failure_parser.add_argument("--reason", required=True)
    failure_parser.add_argument("--cleanup-status", required=True,
                                choices=sorted(VALID_CLEANUP_STATUSES))
    failure_parser.add_argument("--evidence", action="append", required=True)
    failure_parser.add_argument("--run-id")

    for name in ["scope", "make-run-plan"]:
        scope_parser = subparsers.add_parser(name)
        scope_parser.add_argument("source", nargs="?", default=str(CURRENT))
        scope_parser.add_argument("--plan")
        scope_parser.add_argument("--case-id", action="append")
        scope_parser.add_argument("--module", action="append")
        scope_parser.add_argument("--promotion", action="store_true")
        if name == "make-run-plan":
            scope_parser.add_argument("--output")
    validate_parser = subparsers.add_parser("validate-state")
    validate_parser.add_argument("--full", action="store_true")

    args = parser.parse_args()
    if args.command == "reset-state":
        reset_state()
    elif args.command == "sync-report":
        sync_report()
    elif args.command == "prepare":
        prepare(args.source, args.output)
    elif args.command == "apply":
        apply_plan(args.plan)
    elif args.command == "export-contract":
        export_contracts(args.case_id, args.output_dir)
    elif args.command == "make-audit-template":
        make_audit_template(args.case_id, args.test_title, args.file, args.output)
    elif args.command == "register-candidate":
        register_candidate(args.case_id, args.test_title, args.file, args.audit,
                           args.exploration_evidence)
    elif args.command == "invalidate-automation":
        invalidate_automation(args.case_id, args.reason)
    elif args.command == "record-exploration-failure":
        record_exploration_failure(args.case_id, args.failure_category, args.reason,
                                   args.cleanup_status, args.evidence, args.run_id)
    elif args.command == "scope":
        resolve_scope(args.source, args.plan, args.case_id, args.module, args.promotion)
    elif args.command == "make-run-plan":
        make_run_plan(args.source, args.plan, args.output, args.case_id, args.module,
                      args.promotion)
    elif args.command == "validate-state":
        validate_state(args.full)


if __name__ == "__main__":
    main()
