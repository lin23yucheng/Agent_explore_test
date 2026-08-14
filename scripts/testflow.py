import argparse
import csv
import difflib
import hashlib
import json
import re
import subprocess
from copy import deepcopy
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CASES_ROOT = ROOT / "cases"
CURRENT = CASES_ROOT / "current.csv"
CASE_REGISTRY = CASES_ROOT / "case-registry.json"
AUTOMATION_REGISTRY = CASES_ROOT / "automation-registry.json"
CHANGES_ROOT = CASES_ROOT / "changes"
RUNS_ROOT = CASES_ROOT / "runs"
LEGACY_SOURCE = ROOT / "ExcelFiles" / "AI测试用例_full_cases.csv"
LEGACY_MAPPINGS = ROOT / "scripts" / "case-mappings.json"
LEGACY_HISTORY = ROOT / "test-history" / "case-results.json"

META_HEADERS = ["用例ID", "用例Revision", "执行契约哈希", "状态", "首次版本", "最后变更版本",
                "源测试点ID", "迭代版本"]
IDENTITY_HEADERS = set(META_HEADERS)
VALID_ACTIONS = {"add", "unchanged", "modify", "replace", "retire"}
CONTRACT_FIELDS = {
    "preconditions": "前置条件",
    "steps": "步骤",
    "assertions": "预期",
}


class ChineseArgumentParser(argparse.ArgumentParser):
    """将argparse自动生成的终端帮助标题转换为中文。"""

    def format_help(self):
        help_text = super().format_help()
        replacements = {
            "usage:": "用法：",
            "options:": "可选参数：",
            "positional arguments:": "位置参数：",
            "show this help message and exit": "显示帮助信息并退出",
        }
        for source, target in replacements.items():
            help_text = help_text.replace(source, target)
        return help_text


def now_iso():
    return datetime.now().astimezone().isoformat(timespec="seconds")


def read_csv(path):
    with Path(path).open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        rows = [{key: value or "" for key, value in row.items()} for row in reader]
        return rows, reader.fieldnames or []


def write_csv(path, rows, headers):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def write_json(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding="utf-8")


def load_json(path, default):
    path = Path(path)
    if not path.exists():
        return deepcopy(default)
    return json.loads(path.read_text(encoding="utf-8"))


def normalized_content(row):
    return {
        key: re.sub(r"\s+", " ", str(value or "")).strip()
        for key, value in row.items()
        if key not in IDENTITY_HEADERS and value is not None
    }


def fingerprint(row):
    payload = json.dumps(normalized_content(row), ensure_ascii=False, sort_keys=True,
                         separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def hash_file(path):
    path = Path(path)
    if not path.is_file():
        return ""
    return hashlib.sha256(path.read_bytes()).hexdigest()


def split_contract_items(value):
    value = str(value or "").replace("\r\n", "\n").strip()
    if not value:
        return []
    parts = re.split(r"\n+|[；;]+", value)
    items = []
    for part in parts:
        text = re.sub(r"^\s*(?:\d+[.、)]|[-*])\s*", "", part).strip()
        if text:
            items.append(text)
    return items


def case_revision(case):
    return int(case.get("revision") or (len(case.get("revisions", [])) + 1))


def execution_contract(case):
    contract = {
        "schemaVersion": 1,
        "caseId": case["id"],
        "caseRevision": case_revision(case),
        "caseFingerprint": case.get("fingerprint", ""),
        "title": case.get("fields", {}).get("用例标题", ""),
    }
    for contract_key, field_name in CONTRACT_FIELDS.items():
        prefix = {"preconditions": "P", "steps": "S", "assertions": "A"}[contract_key]
        contract[contract_key] = [
            {"id": f"{prefix}{index}", "text": text}
            for index, text in enumerate(
                split_contract_items(case.get("fields", {}).get(field_name, "")), start=1
            )
        ]
    canonical = json.dumps(contract, ensure_ascii=False, sort_keys=True,
                           separators=(",", ":"))
    contract["contractHash"] = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    contract["completionGate"] = {
        "requiredCoverageIds": [
            item["id"] for key in CONTRACT_FIELDS for item in contract[key]
        ],
        "passRequiresCompleteCoverage": True,
    }
    return contract


def ensure_case_metadata(registry):
    changed = False
    for case in registry.get("cases", {}).values():
        revision = case_revision(case)
        contract_hash = execution_contract(case)["contractHash"]
        if case.get("revision") != revision:
            case["revision"] = revision
            changed = True
        if case.get("contractHash") != contract_hash:
            case["contractHash"] = contract_hash
            changed = True
    if changed:
        registry["version"] = max(int(registry.get("version", 1)), 3)
        registry["updatedAt"] = now_iso()
    return changed


def logical_key(row):
    return f"{row.get('所属模块', '').strip()}\x1f{row.get('用例标题', '').strip()}"


def history_key(row):
    return f"{row.get('所属模块', '')}\x1f{row.get('用例标题', '')}"


def empty_registry():
    return {"version": 3, "nextSequence": 1, "updatedAt": "", "cases": {}}


def allocate_case_id(registry):
    case_id = f"CASE-{registry['nextSequence']:06d}"
    registry["nextSequence"] += 1
    return case_id


def active_cases(registry):
    return [case for case in registry["cases"].values() if case.get("status") == "active"]


def source_fields(row):
    return {key: value for key, value in row.items() if key not in META_HEADERS}


def make_case(registry, row, version, case_id=None):
    case_id = case_id or allocate_case_id(registry)
    fields = source_fields(row)
    case = {
        "id": case_id,
        "status": "active",
        "revision": 1,
        "firstSeenVersion": version,
        "lastChangedVersion": version,
        "sourceNodeId": row.get("源测试点ID", ""),
        "fingerprint": fingerprint(fields),
        "fields": fields,
        "revisions": [],
        "replacedBy": "",
        "lastResult": {},
    }
    case["contractHash"] = execution_contract(case)["contractHash"]
    return case


def export_current(registry, path=None):
    path = path or CURRENT
    rows = []
    field_order = []
    for case in active_cases(registry):
        for field in case["fields"]:
            if field not in field_order and field not in META_HEADERS:
                field_order.append(field)
        rows.append({
            "用例ID": case["id"],
            "用例Revision": case_revision(case),
            "执行契约哈希": execution_contract(case)["contractHash"],
            "状态": "有效",
            "首次版本": case.get("firstSeenVersion", ""),
            "最后变更版本": case.get("lastChangedVersion", ""),
            "源测试点ID": case.get("sourceNodeId", ""),
            "迭代版本": case.get("lastChangedVersion", ""),
            **case["fields"],
        })
    write_csv(path, rows, META_HEADERS + field_order)
    return len(rows)


def write_contract(case, output=None):
    output = Path(output) if output else CASES_ROOT / "contracts" / f"{case['id']}.json"
    contract = execution_contract(case)
    write_json(output, contract)
    return output, contract


def export_contracts(case_ids=None, output_dir=None):
    registry = load_json(CASE_REGISTRY, empty_registry())
    ensure_case_metadata(registry)
    output_dir = Path(output_dir) if output_dir else CASES_ROOT / "contracts"
    selected = list(dict.fromkeys(case_ids or [case["id"] for case in active_cases(registry)]))
    missing = [case_id for case_id in selected if case_id not in registry.get("cases", {})]
    if missing:
        raise SystemExit(f"无法生成不存在用例的执行契约: {', '.join(missing)}")
    paths = []
    for case_id in selected:
        case = registry["cases"][case_id]
        if case.get("status") != "active":
            raise SystemExit(f"无法生成非有效用例的执行契约: {case_id}")
        path, _ = write_contract(case, output_dir / f"{case_id}.json")
        paths.append(str(path))
    write_json(CASE_REGISTRY, registry)
    print(json.dumps({"已生成执行契约数": len(paths), "执行契约": paths},
                     ensure_ascii=False, indent=2))


def migrate_state():
    registry = load_json(CASE_REGISTRY, empty_registry())
    changed = ensure_case_metadata(registry)
    automation = load_json(AUTOMATION_REGISTRY,
                           {"version": 2, "updatedAt": "", "tests": {}, "cases": {}})
    invalidated = 0
    for title, entry in automation.get("tests", {}).items():
        spec_file = entry.get("file", "").replace("\\", "/")
        if spec_file.startswith("tests/ui/") and spec_file.count("/") == 2:
            entry["file"] = f"tests/ui/specs/{Path(spec_file).name}"
        if entry.get("status") != "active":
            continue
        case_ids = entry.get("caseIds", [])
        case = registry.get("cases", {}).get(case_ids[0], {}) if len(case_ids) == 1 else {}
        issue = automation_binding_issue(entry, case) if case else "未唯一绑定有效用例"
        if issue:
            entry["status"] = "stale"
            entry["staleReason"] = f"状态迁移：{issue}"
            invalidated += 1
    registry["version"] = 3
    registry["updatedAt"] = now_iso()
    automation["version"] = max(int(automation.get("version", 1)), 2)
    automation["updatedAt"] = now_iso()
    write_json(CASE_REGISTRY, registry)
    write_json(AUTOMATION_REGISTRY, automation)
    count = export_current(registry)
    print(json.dumps({"迁移状态": "已完成", "用例元数据已变化": changed,
                      "旧自动化已显式失效": invalidated,
                      "当前有效用例数": count, "注册表版本": 3},
                     ensure_ascii=False, indent=2))


def make_audit_template(case_id, test_title, spec_file, output=None):
    registry = load_json(CASE_REGISTRY, empty_registry())
    ensure_case_metadata(registry)
    case = registry.get("cases", {}).get(case_id)
    if not case or case.get("status") != "active":
        raise SystemExit(f"无法为不存在或非有效用例生成覆盖审计: {case_id}")
    contract = execution_contract(case)
    output = Path(output) if output else CASES_ROOT / "audits" / f"{case_id}.json"
    payload = {
        "schemaVersion": 1,
        "caseId": case_id,
        "caseRevision": case_revision(case),
        "contractHash": contract["contractHash"],
        "testTitle": test_title,
        "file": spec_file.replace("\\", "/"),
        "coverage": [
            {
                "contractItemId": item_id,
                "implementation": "",
                "evidence": "",
            }
            for item_id in contract["completionGate"]["requiredCoverageIds"]
        ],
        "notes": "",
    }
    write_json(output, payload)
    write_json(CASE_REGISTRY, registry)
    print(json.dumps({"覆盖审计模板": str(output), "用例ID": case_id,
                      "待填写覆盖项数": len(payload["coverage"])},
                     ensure_ascii=False, indent=2))


def validate_audit(audit_path, case, spec_file, test_title):
    audit_path = Path(audit_path).resolve()
    if not audit_path.is_file():
        raise SystemExit(f"自动化覆盖审计文件不存在: {audit_path}")
    audit = load_json(audit_path, {})
    contract = execution_contract(case)
    required = set(contract["completionGate"]["requiredCoverageIds"])
    coverage = audit.get("coverage", [])
    covered = {item.get("contractItemId") for item in coverage
               if item.get("implementation") and item.get("evidence")}
    errors = []
    if audit.get("caseId") != case["id"]:
        errors.append("caseId不匹配")
    if int(audit.get("caseRevision", 0)) != case_revision(case):
        errors.append("caseRevision不是当前版本")
    if audit.get("contractHash") != contract["contractHash"]:
        errors.append("contractHash不是当前契约")
    if audit.get("testTitle") != test_title:
        errors.append("testTitle不匹配")
    if audit.get("file", "").replace("\\", "/") != spec_file.replace("\\", "/"):
        errors.append("file不匹配")
    missing = sorted(required - covered)
    unknown = sorted(value for value in covered - required if value)
    if missing:
        errors.append(f"缺少覆盖项: {', '.join(missing)}")
    if unknown:
        errors.append(f"包含未知覆盖项: {', '.join(unknown)}")
    if len(coverage) != len(covered):
        errors.append("覆盖项重复，或缺少implementation/evidence")
    if errors:
        raise SystemExit("自动化覆盖审计未通过：" + "；".join(errors))
    return audit_path, audit, contract


def find_spec_for_title(test_title):
    leaf_title = test_title.rsplit(" › ", 1)[-1]
    matches = []
    for spec in (ROOT / "tests" / "ui" / "specs").rglob("*.spec.js"):
        if leaf_title and leaf_title in spec.read_text(encoding="utf-8"):
            matches.append(str(spec.relative_to(ROOT)).replace("\\", "/"))
    return matches[0] if len(matches) == 1 else ""


def migrate_automation(registry):
    mappings = load_json(LEGACY_MAPPINGS, {})
    by_title = {}
    for case in registry["cases"].values():
        by_title.setdefault(case["fields"].get("用例标题", ""), []).append(case["id"])
    tests = {}
    cases = {}
    for test_title, case_titles in mappings.items():
        case_ids = []
        for title in case_titles:
            case_ids.extend(by_title.get(title, []))
        case_ids = list(dict.fromkeys(case_ids))
        tests[test_title] = {
            "file": find_spec_for_title(test_title),
            "caseIds": case_ids,
            "status": "stale",
            "source": "旧标题映射未绑定用例revision与执行契约，等待覆盖审计",
        }
        for case_id in case_ids:
            cases.setdefault(case_id, []).append(test_title)
    automation = {"version": 1, "updatedAt": now_iso(), "tests": tests, "cases": cases}
    write_json(AUTOMATION_REGISTRY, automation)
    return automation


def migrate_history(registry):
    history = load_json(LEGACY_HISTORY, {"cases": {}}).get("cases", {})
    migrated = 0
    for case in registry["cases"].values():
        entry = history.get(history_key(case["fields"])) or history.get(
            case["fields"].get("用例标题", ""))
        if entry:
            case["lastResult"] = entry
            migrated += 1
    return migrated


def bootstrap(source, version):
    source = Path(source)
    if CASE_REGISTRY.exists():
        raise SystemExit(f"用例注册表已存在，不可重复初始化: {CASE_REGISTRY}")
    rows, _ = read_csv(source)
    registry = empty_registry()
    seen = set()
    duplicates = []
    for index, row in enumerate(rows, start=1):
        key = (logical_key(row), fingerprint(row))
        if key in seen:
            duplicates.append(index)
            continue
        seen.add(key)
        case = make_case(registry, row, version)
        registry["cases"][case["id"]] = case
    migrated_results = migrate_history(registry)
    registry["updatedAt"] = now_iso()
    write_json(CASE_REGISTRY, registry)
    automation = migrate_automation(registry)
    count = export_current(registry)
    result = {
        "源文件": str(source),
        "有效用例数": count,
        "已跳过重复行": duplicates,
        "已迁移结果数": migrated_results,
        "已迁移自动化测试数": len(automation["tests"]),
        "当前有效用例文件": str(CURRENT),
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))


def similarity(row, case):
    old = case["fields"]
    title_score = difflib.SequenceMatcher(
        None, row.get("用例标题", ""), old.get("用例标题", "")).ratio()
    module_score = difflib.SequenceMatcher(
        None, row.get("所属模块", ""), old.get("所属模块", "")).ratio()
    return round(title_score * 0.75 + module_score * 0.25, 4)


def candidate_cases(row, registry, limit=5):
    scored = [
        (similarity(row, case), case)
        for case in active_cases(registry)
    ]
    return [
        {
            "caseId": case["id"],
            "title": case["fields"].get("用例标题", ""),
            "module": case["fields"].get("所属模块", ""),
            "score": score,
        }
        for score, case in sorted(scored, key=lambda item: item[0], reverse=True)[:limit]
        if score >= 0.45
    ]


def prepare(source, version, output=None):
    if not CASE_REGISTRY.exists():
        raise SystemExit("尚未初始化用例注册表，请先运行 testflow.py bootstrap。")
    source = Path(source).resolve()
    rows, _ = read_csv(source)
    registry = load_json(CASE_REGISTRY, empty_registry())
    by_key = {}
    for case in active_cases(registry):
        by_key.setdefault(logical_key(case["fields"]), []).append(case)
    by_source = {}
    for case in active_cases(registry):
        if case.get("sourceNodeId"):
            by_source.setdefault(case["sourceNodeId"], []).append(case)

    items = []
    for index, row in enumerate(rows, start=1):
        exact_matches = by_key.get(logical_key(row), [])
        exact = exact_matches[0] if len(exact_matches) == 1 else None
        source_matches = by_source.get(row.get("源测试点ID", ""), [])
        matched = exact or (source_matches[0] if len(source_matches) == 1 else None)
        if matched:
            same = fingerprint(source_fields(row)) == matched.get("fingerprint")
            action = "unchanged" if same else "modify"
            confidence = "exact" if exact else "source-node"
            target = matched["id"]
        else:
            action = "add"
            confidence = "new-or-needs-agent-review"
            target = ""
        items.append({
            "inputRow": index,
            "action": action,
            "targetCaseId": target,
            "retireCaseIds": [],
            "reason": "",
            "confidence": confidence,
            "case": row,
            "candidates": [] if matched else candidate_cases(row, registry),
        })

    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    output = Path(output) if output else CHANGES_ROOT / f"{version}-{stamp}.merge-plan.json"
    plan = {
        "version": 1,
        "status": "draft",
        "createdAt": now_iso(),
        "sourceCsv": str(source),
        "iterationVersion": version,
        "rules": {
            "incrementalInput": True,
            "absenceNeverMeansRetirement": True,
            "agentMustReviewCandidates": True,
        },
        "items": items,
        "impactedRegressionCaseIds": [],
        "uncertain": [],
    }
    write_json(output, plan)
    summary = {action: sum(item["action"] == action for item in items)
               for action in sorted(VALID_ACTIONS)}
    summary_text = {
        "新增": summary["add"],
        "修改": summary["modify"],
        "替代": summary["replace"],
        "退役": summary["retire"],
        "未变化": summary["unchanged"],
    }
    print(json.dumps({"变更计划": str(output), "动作统计": summary_text,
                      "需要Agent审核": True}, ensure_ascii=False, indent=2))


def archive_revision(case):
    case.setdefault("revisions", []).append({
        "changedAt": now_iso(),
        "version": case.get("lastChangedVersion", ""),
        "fingerprint": case.get("fingerprint", ""),
        "revision": case_revision(case),
        "contractHash": case.get("contractHash", execution_contract(case)["contractHash"]),
        "fields": deepcopy(case.get("fields", {})),
    })


def apply_plan(plan_path):
    plan_path = Path(plan_path)
    plan = load_json(plan_path, {})
    if plan.get("status") != "reviewed":
        raise SystemExit("合并计划必须先由 Agent 审核并将 status 设置为 reviewed。")
    if plan.get("uncertain"):
        raise SystemExit("合并计划仍包含 uncertain 项，不能应用。")
    registry = load_json(CASE_REGISTRY, empty_registry())
    ensure_case_metadata(registry)
    automation = load_json(AUTOMATION_REGISTRY,
                           {"version": 1, "updatedAt": "", "tests": {}, "cases": {}})
    changed_ids = []
    retired_ids = []
    version = plan.get("iterationVersion", "iteration")

    for item in plan.get("items", []):
        action = item.get("action")
        if action not in VALID_ACTIONS:
            raise SystemExit(f"不支持的合并动作: {action}")
        row = item.get("case", {})
        target_id = item.get("targetCaseId", "")
        result_case_id = target_id
        if action in {"unchanged", "modify"} and target_id in item.get("retireCaseIds", []):
            raise SystemExit(f"{action} 不能同时退役自身 {target_id}；替代用例请使用 replace。")
        if action == "retire":
            if target_id not in registry["cases"]:
                raise SystemExit(f"retire 缺少有效 targetCaseId: {target_id}")
            if not item.get("reason", "").strip():
                raise SystemExit(f"retire 必须说明明确退役原因: {target_id}")
            item.setdefault("retireCaseIds", []).append(target_id)
            result_case_id = ""
        elif action == "unchanged":
            if target_id not in registry["cases"]:
                raise SystemExit(f"unchanged 缺少有效 targetCaseId: {target_id}")
        elif action == "modify":
            if target_id not in registry["cases"]:
                raise SystemExit(f"modify 缺少有效 targetCaseId: {target_id}")
            case = registry["cases"][target_id]
            archive_revision(case)
            case["revision"] = case_revision(case) + 1
            case["fields"] = source_fields(row)
            case["fingerprint"] = fingerprint(case["fields"])
            case["sourceNodeId"] = row.get("源测试点ID", case.get("sourceNodeId", ""))
            case["lastChangedVersion"] = version
            case["lastResult"] = {}
            case["contractHash"] = execution_contract(case)["contractHash"]
            changed_ids.append(target_id)
        else:
            case = make_case(registry, row, version)
            registry["cases"][case["id"]] = case
            result_case_id = case["id"]
            changed_ids.append(case["id"])
            if action == "replace":
                if target_id not in registry["cases"]:
                    raise SystemExit(f"replace 缺少有效 targetCaseId: {target_id}")
                item.setdefault("retireCaseIds", []).append(target_id)

        for retire_id in item.get("retireCaseIds", []):
            old = registry["cases"].get(retire_id)
            if retire_id in retired_ids:
                continue
            if not old or old.get("status") != "active":
                raise SystemExit(f"无法退役不存在或非有效用例: {retire_id}")
            old["status"] = "superseded" if action == "replace" else "retired"
            old["lastChangedVersion"] = version
            old["replacedBy"] = result_case_id if action == "replace" else ""
            retired_ids.append(retire_id)
            for test_title in automation.get("cases", {}).get(retire_id, []):
                test_entry = automation.get("tests", {}).get(test_title, {})
                test_entry["caseIds"] = [value for value in test_entry.get("caseIds", [])
                                         if value != retire_id]
                if not test_entry["caseIds"]:
                    test_entry["status"] = "retirement-candidate"

    for case_id in changed_ids:
        for test_title in automation.get("cases", {}).get(case_id, []):
            automation["tests"][test_title]["status"] = "stale"
            automation["tests"][test_title]["staleReason"] = "用例revision或执行契约已变化"
    registry["updatedAt"] = now_iso()
    automation["updatedAt"] = now_iso()
    write_json(CASE_REGISTRY, registry)
    write_json(AUTOMATION_REGISTRY, automation)
    count = export_current(registry)
    plan["status"] = "applied"
    plan["appliedAt"] = now_iso()
    plan["changedCaseIds"] = changed_ids
    plan["retiredCaseIds"] = list(dict.fromkeys(retired_ids))
    write_json(plan_path, plan)
    print(json.dumps({"有效用例数": count, "已变更用例ID": changed_ids,
                      "已退役用例ID": retired_ids, "当前有效用例文件": str(CURRENT)},
                     ensure_ascii=False, indent=2))


def list_specs():
    registry = load_json(AUTOMATION_REGISTRY, {"tests": {}})
    files = {
        entry.get("file") for entry in registry.get("tests", {}).values()
        if entry.get("status") == "active" and entry.get("file")
    }
    for path in sorted(files):
        print(path)


def register_automation(test_title, spec_file, case_ids, audit_path=None):
    case_ids = list(dict.fromkeys(case_ids))
    if len(case_ids) != 1:
        raise SystemExit(
            f"正式测试必须且只能关联一个用例ID，当前收到{len(case_ids)}个："
            f"{', '.join(case_ids) or '无'}"
        )
    registry = load_json(CASE_REGISTRY, empty_registry())
    ensure_case_metadata(registry)
    missing = [case_id for case_id in case_ids if case_id not in registry.get("cases", {})]
    if missing:
        raise SystemExit(f"无法关联不存在的用例ID: {', '.join(missing)}")
    case = registry["cases"][case_ids[0]]
    if case.get("status") != "active":
        raise SystemExit(f"无法关联非有效用例: {case['id']}")
    normalized_spec = spec_file.replace("\\", "/")
    absolute_spec = ROOT / normalized_spec
    if not absolute_spec.is_file():
        raise SystemExit(f"Playwright脚本不存在: {normalized_spec}")
    if audit_path is None:
        raise SystemExit("登记可信自动化必须提供 --audit 覆盖审计文件")
    audit_path, _audit, contract = validate_audit(audit_path, case, normalized_spec, test_title)
    automation = load_json(AUTOMATION_REGISTRY,
                           {"version": 1, "updatedAt": "", "tests": {}, "cases": {}})
    previous = automation["tests"].get(test_title, {})
    for old_case_id in previous.get("caseIds", []):
        automation["cases"][old_case_id] = [
            title for title in automation["cases"].get(old_case_id, []) if title != test_title
        ]
    automation["tests"][test_title] = {
        "file": normalized_spec,
        "caseIds": case_ids,
        "status": "active",
        "source": "agent",
        "caseRevision": case_revision(case),
        "contractHash": contract["contractHash"],
        "implementationHash": hash_file(absolute_spec),
        "auditFile": str(audit_path.relative_to(ROOT)).replace("\\", "/"),
        "auditedAt": now_iso(),
    }
    for case_id in case_ids:
        # A newly audited one-to-one test supersedes stale candidates for the
        # same case. Keeping both would make the full-run gate fail forever.
        for old_title in list(automation["cases"].get(case_id, [])):
            if old_title == test_title:
                continue
            old_entry = automation["tests"].get(old_title, {})
            same_agent_test_renamed = (
                old_entry.get("status") == "active"
                and old_entry.get("source") == "agent"
                and old_entry.get("file", "").replace("\\", "/") == normalized_spec
            )
            if old_entry.get("status") != "stale" and not same_agent_test_renamed:
                continue
            old_entry["caseIds"] = [
                value for value in old_entry.get("caseIds", []) if value != case_id
            ]
            automation["cases"][case_id] = [
                value for value in automation["cases"].get(case_id, []) if value != old_title
            ]
            if not old_entry["caseIds"]:
                automation["tests"].pop(old_title, None)
        automation["cases"].setdefault(case_id, [])
        if test_title not in automation["cases"][case_id]:
            automation["cases"][case_id].append(test_title)
    automation["updatedAt"] = now_iso()
    write_json(CASE_REGISTRY, registry)
    write_json(AUTOMATION_REGISTRY, automation)
    registered = automation["tests"][test_title]
    print(json.dumps({
        "测试标题": test_title,
        "脚本文件": registered["file"],
        "关联用例ID": registered["caseIds"],
        "用例Revision": registered["caseRevision"],
        "执行契约哈希": registered["contractHash"],
        "状态": "有效" if registered["status"] == "active" else registered["status"],
    }, ensure_ascii=False, indent=2))


def invalidate_automation(case_ids, reason):
    if not reason.strip():
        raise SystemExit("失效自动化时必须说明语义覆盖不足的原因")
    automation = load_json(AUTOMATION_REGISTRY,
                           {"version": 1, "updatedAt": "", "tests": {}, "cases": {}})
    invalidated = []
    missing = []
    for case_id in list(dict.fromkeys(case_ids)):
        titles = automation.get("cases", {}).get(case_id, [])
        active_titles = [
            title for title in titles
            if automation.get("tests", {}).get(title, {}).get("status") == "active"
        ]
        if not active_titles:
            missing.append(case_id)
            continue
        for title in active_titles:
            entry = automation["tests"][title]
            entry["status"] = "stale"
            entry["source"] = f"语义审计未完整覆盖：{reason.strip()}"
            invalidated.append({"caseId": case_id, "testTitle": title})
    if missing:
        raise SystemExit(f"以下用例没有可失效的有效自动化映射：{', '.join(missing)}")
    automation["updatedAt"] = now_iso()
    write_json(AUTOMATION_REGISTRY, automation)
    print(json.dumps({
        "已失效自动化": invalidated,
        "原因": reason.strip(),
    }, ensure_ascii=False, indent=2))


def discover_automation():
    """从Playwright测试清单中发现与当前用例标题完全一致的旧脚本。"""
    registry = load_json(CASE_REGISTRY, empty_registry())
    automation = load_json(AUTOMATION_REGISTRY,
                           {"version": 1, "updatedAt": "", "tests": {}, "cases": {}})
    by_title = {}
    for case in active_cases(registry):
        title = case["fields"].get("用例标题", "")
        by_title.setdefault(title, []).append(case["id"])

    completed = subprocess.run(
        ["npx.cmd", "playwright", "test", "--list"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )
    if completed.returncode != 0:
        raise SystemExit(f"读取Playwright测试清单失败：{completed.stderr.strip()}")

    pattern = re.compile(r"^\s+([^:]+\.spec\.js):\d+:\d+ › (.+)$")
    discovered = 0
    ambiguous = []
    unmatched = []
    for line in completed.stdout.splitlines():
        match = pattern.match(line)
        if not match:
            continue
        spec_name, test_title = match.groups()
        leaf_title = test_title.rsplit(" › ", 1)[-1]
        case_ids = by_title.get(leaf_title, [])
        if len(case_ids) != 1:
            (ambiguous if len(case_ids) > 1 else unmatched).append(test_title)
            continue
        full_title = test_title
        previous = automation.get("tests", {}).get(full_title, {})
        automation["tests"][full_title] = {
            "file": f"tests/ui/{spec_name.replace(chr(92), '/')}",
            "caseIds": case_ids,
            "status": previous.get("status", "stale"),
            "source": previous.get("source", "按标题重新发现，等待本次执行验证"),
            **({key: previous[key] for key in (
                "caseRevision", "contractHash", "implementationHash",
                "auditFile", "auditedAt", "staleReason") if previous.get(key)}),
            **({"lastRun": previous["lastRun"]} if previous.get("lastRun") else {}),
        }
        for case_id in case_ids:
            automation["cases"].setdefault(case_id, [])
            if full_title not in automation["cases"][case_id]:
                automation["cases"][case_id].append(full_title)
        discovered += 1
    automation["updatedAt"] = now_iso()
    write_json(AUTOMATION_REGISTRY, automation)
    print(json.dumps({
        "发现的待验证测试数": discovered,
        "标题对应多条用例的测试": ambiguous,
        "未匹配当前用例的旧测试数": len(unmatched),
        "未匹配当前用例的旧测试": unmatched,
    }, ensure_ascii=False, indent=2))


def sync_annotations():
    """从Playwright清单中的case注解同步稳定用例映射。"""
    registry = load_json(CASE_REGISTRY, empty_registry())
    automation = load_json(AUTOMATION_REGISTRY,
                           {"version": 1, "updatedAt": "", "tests": {}, "cases": {}})
    previous_tests = dict(automation.get("tests", {}))
    completed = subprocess.run(
        ["npx.cmd", "playwright", "test", "--list", "--reporter=json"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        check=False,
    )
    if completed.returncode != 0:
        raise SystemExit(f"读取Playwright注解失败：{completed.stderr.strip()}")
    payload = json.loads(completed.stdout)
    synced = 0
    seen_titles = set()

    def visit(suite, parents):
        nonlocal synced
        title = suite.get("title", "")
        current_parents = parents if title.endswith(".spec.js") else [*parents, title]
        for spec in suite.get("specs", []):
            tests = spec.get("tests", [])
            annotations = tests[0].get("annotations", []) if tests else []
            case_ids = [item.get("description", "") for item in annotations
                        if item.get("type") == "case" and item.get("description")]
            shared_derived = any(item.get("type") == "implementation"
                                  and item.get("description") == "shared-derived"
                                  for item in annotations)
            if not case_ids:
                continue
            missing = [case_id for case_id in case_ids if case_id not in registry.get("cases", {})]
            if missing:
                raise SystemExit(f"测试{spec.get('title')}引用了不存在的用例ID：{', '.join(missing)}")
            test_title = " › ".join([*current_parents, spec.get("title", "")])
            seen_titles.add(test_title)
            previous = previous_tests.get(test_title, {})
            for old_case_id in previous.get("caseIds", []):
                automation["cases"][old_case_id] = [
                    value for value in automation["cases"].get(old_case_id, []) if value != test_title
                ]
            invalid_case_count = len(case_ids) != 1
            automation["tests"][test_title] = {
                "file": f"tests/ui/{spec.get('file')}",
                "caseIds": case_ids,
                "status": "stale" if shared_derived or invalid_case_count
                          else previous.get("status", "stale"),
                "source": ("测试关联多个用例ID，等待逐用例实现"
                           if invalid_case_count else
                           "聚合脚本机械拆分，等待逐用例实现"
                           if shared_derived else "Playwright用例注解"),
                **({key: previous[key] for key in (
                    "caseRevision", "contractHash", "implementationHash",
                    "auditFile", "auditedAt", "staleReason") if previous.get(key)}),
                **({"lastRun": previous["lastRun"]} if previous.get("lastRun") else {}),
            }
            for case_id in case_ids:
                automation["cases"].setdefault(case_id, [])
                if test_title not in automation["cases"][case_id]:
                    automation["cases"][case_id].append(test_title)
            synced += 1
        for child in suite.get("suites", []):
            visit(child, current_parents)

    for suite in payload.get("suites", []):
        visit(suite, [])
    removed = prune_automation_entries(automation, seen_titles)
    duplicate_cases = {
        case_id: titles for case_id, titles in automation.get("cases", {}).items()
        if len(titles) > 1
    }
    if duplicate_cases:
        details = "；".join(
            f"{case_id}: {' | '.join(titles)}"
            for case_id, titles in sorted(duplicate_cases.items())
        )
        raise SystemExit(f"注解同步发现CASE-ID重复映射，拒绝写入注册表：{details}")
    automation["updatedAt"] = now_iso()
    write_json(AUTOMATION_REGISTRY, automation)
    print(json.dumps({
        "已同步带用例ID的测试数": synced,
        "已清理旧自动化记录数": removed,
    }, ensure_ascii=False, indent=2))


def prune_automation_entries(automation, retained_titles):
    """仅保留当前脚本中存在的测试，并重建用例到测试的反向索引。"""
    previous = automation.get("tests", {})
    automation["tests"] = {
        title: entry for title, entry in previous.items() if title in retained_titles
    }
    cases = {}
    for title, entry in automation["tests"].items():
        for case_id in entry.get("caseIds", []):
            cases.setdefault(case_id, []).append(title)
    automation["cases"] = cases
    return len(previous) - len(automation["tests"])


def automation_binding_issue(entry, case):
    if entry.get("status") != "active":
        return "自动化状态不是active"
    spec_file = entry.get("file", "").replace("\\", "/")
    if not spec_file or not (ROOT / spec_file).is_file():
        return "脚本文件不存在"
    expected_contract = execution_contract(case)["contractHash"]
    if int(entry.get("caseRevision", 0)) != case_revision(case):
        return "自动化绑定的caseRevision已过期"
    if entry.get("contractHash") != expected_contract:
        return "自动化绑定的执行契约已过期"
    if entry.get("implementationHash") != hash_file(ROOT / spec_file):
        return "脚本文件已变化但尚未重新审计登记"
    audit_file = entry.get("auditFile", "")
    if not audit_file or not (ROOT / audit_file).is_file():
        return "缺少自动化覆盖审计文件"
    return ""


def classified_tests(case_id, registry, automation):
    case = registry.get("cases", {}).get(case_id, {})
    active_titles = []
    stale_titles = []
    binding_issues = {}
    for title in automation.get("cases", {}).get(case_id, []):
        entry = automation.get("tests", {}).get(title, {})
        if entry.get("status") == "active":
            issue = automation_binding_issue(entry, case)
            if issue:
                stale_titles.append(title)
                binding_issues[title] = issue
            else:
                active_titles.append(title)
        elif entry.get("status") == "stale":
            stale_titles.append(title)
            binding_issues[title] = entry.get("staleReason") or entry.get("source", "")
    return active_titles, stale_titles, binding_issues


def make_run_plan(source, plan_path=None, output=None):
    scope = resolve_scope(source, emit=False, plan_path=plan_path)
    if scope["unknownInputRows"]:
        raise SystemExit("运行计划包含无法匹配稳定CASE-ID的输入行")
    if scope["unautomatedCaseIds"] or scope["staleCaseIds"]:
        details = []
        if scope["unautomatedCaseIds"]:
            details.append(f"未自动化: {', '.join(scope['unautomatedCaseIds'])}")
        if scope["staleCaseIds"]:
            details.append(f"自动化失效: {', '.join(scope['staleCaseIds'])}")
        raise SystemExit("无法生成正式运行计划；" + "；".join(details))
    registry = load_json(CASE_REGISTRY, empty_registry())
    ensure_case_metadata(registry)
    automation = load_json(AUTOMATION_REGISTRY, {"tests": {}, "cases": {}})
    case_ids = [item["caseId"] for item in scope["resolved"]]
    test_titles = []
    bindings = []
    for case_id in case_ids:
        active, _, _ = classified_tests(case_id, registry, automation)
        if len(active) != 1:
            raise SystemExit(f"{case_id}必须且只能有一个可信自动化，当前为{len(active)}个")
        title = active[0]
        entry = automation["tests"][title]
        test_titles.append(title)
        bindings.append({
            "caseId": case_id,
            "caseRevision": case_revision(registry["cases"][case_id]),
            "contractHash": registry["cases"][case_id]["contractHash"],
            "testTitle": title,
            "file": entry["file"],
            "implementationHash": entry["implementationHash"],
        })
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    output = Path(output) if output else RUNS_ROOT / f"run-plan-{stamp}.json"
    payload = {
        "schemaVersion": 1,
        "status": "ready",
        "createdAt": now_iso(),
        "sourceCsv": str(Path(source).resolve()),
        "mergePlan": str(Path(plan_path).resolve()) if plan_path else "",
        "caseIds": case_ids,
        "testTitles": test_titles,
        "testFiles": sorted({item["file"] for item in bindings}),
        "bindings": bindings,
    }
    write_json(output, payload)
    print(json.dumps({"运行计划": str(output), "用例数": len(case_ids),
                      "脚本文件": payload["testFiles"]}, ensure_ascii=False, indent=2))
    return payload


def resolve_scope(source, emit=True, plan_path=None):
    rows, _ = read_csv(source)
    registry = load_json(CASE_REGISTRY, empty_registry())
    ensure_case_metadata(registry)
    automation = load_json(AUTOMATION_REGISTRY, {"tests": {}, "cases": {}})
    by_key = {}
    by_fingerprint = {}
    for case in active_cases(registry):
        by_key.setdefault(logical_key(case["fields"]), []).append(case["id"])
        by_fingerprint.setdefault(case.get("fingerprint", ""), []).append(case["id"])
    resolved = []
    unknown_rows = []
    test_files = set()
    unautomated = []
    stale = []
    for index, row in enumerate(rows, start=1):
        case_id = row.get("用例ID", "")
        if (case_id not in registry.get("cases", {})
                or registry.get("cases", {}).get(case_id, {}).get("status") != "active"):
            fingerprint_matches = by_fingerprint.get(fingerprint(source_fields(row)), [])
            if len(fingerprint_matches) == 1:
                case_id = fingerprint_matches[0]
            else:
                matches = by_key.get(logical_key(row), [])
                case_id = matches[0] if len(matches) == 1 else ""
        if not case_id:
            unknown_rows.append(index)
            continue
        active_titles, stale_titles, binding_issues = classified_tests(
            case_id, registry, automation)
        entries = [automation.get("tests", {}).get(title, {})
                   for title in active_titles + stale_titles]
        for entry in entries:
            if entry.get("file"):
                test_files.add(entry["file"])
        if stale_titles:
            stale.append(case_id)
        if not active_titles and not stale_titles:
            unautomated.append(case_id)
        resolved.append({
            "inputRow": index,
            "caseId": case_id,
            "activeTests": active_titles,
            "staleTests": stale_titles,
            "bindingIssues": binding_issues,
        })
    impacted_ids = []
    if plan_path:
        plan = load_json(plan_path, {})
        impacted_ids = list(dict.fromkeys(plan.get("impactedRegressionCaseIds", [])))
        present_ids = {item["caseId"] for item in resolved if item.get("caseId")}
        for case_id in impacted_ids:
            if case_id in present_ids or case_id not in registry.get("cases", {}):
                continue
            active_titles, stale_titles, binding_issues = classified_tests(
                case_id, registry, automation)
            entries = [automation.get("tests", {}).get(title, {})
                       for title in active_titles + stale_titles]
            for entry in entries:
                if entry.get("file"):
                    test_files.add(entry["file"])
            if stale_titles:
                stale.append(case_id)
            if not active_titles and not stale_titles:
                unautomated.append(case_id)
            resolved.append({
                "inputRow": f"impact:{case_id}",
                "caseId": case_id,
                "activeTests": active_titles,
                "staleTests": stale_titles,
                "bindingIssues": binding_issues,
                "impactedRegression": True,
            })
    result = {
        "sourceCsv": str(Path(source).resolve()),
        "resolved": resolved,
        "testFiles": sorted(test_files),
        "unautomatedCaseIds": list(dict.fromkeys(unautomated)),
        "staleCaseIds": list(dict.fromkeys(stale)),
        "bindingIssues": {item["caseId"]: item.get("bindingIssues", {})
                          for item in resolved if item.get("bindingIssues")},
        "unknownInputRows": unknown_rows,
        "impactedRegressionCaseIds": impacted_ids,
    }
    resolved_text = [{
        "输入行": item["inputRow"],
        "用例ID": item["caseId"],
        "有效测试": item["activeTests"],
        "已失效测试": item["staleTests"],
        "绑定问题": item.get("bindingIssues", {}),
    } for item in result["resolved"]]
    output = {
        "源用例文件": result["sourceCsv"],
        "已解析用例": resolved_text,
        "需要执行的脚本": result["testFiles"],
        "未自动化用例ID": result["unautomatedCaseIds"],
        "自动化已失效用例ID": result["staleCaseIds"],
        "无法匹配的输入行": result["unknownInputRows"],
        "受影响回归用例ID": result["impactedRegressionCaseIds"],
    }
    if emit:
        print(json.dumps(output, ensure_ascii=False, indent=2))
    return result


def validate_automation(source):
    """完整回归前验证全部用例均有唯一、可执行的有效映射。"""
    scope = resolve_scope(source, emit=False)
    automation = load_json(AUTOMATION_REGISTRY, {"tests": {}, "cases": {}})
    missing_files = [path for path in scope["testFiles"] if not (ROOT / path).is_file()]
    duplicate_case_ids = [
        item["caseId"] for item in scope["resolved"] if len(item.get("activeTests", [])) > 1
    ]
    shared_result_tests = [
        title for title, entry in automation.get("tests", {}).items()
        if entry.get("status") == "active" and len(entry.get("caseIds", [])) != 1
    ]
    issues = []
    if scope["unknownInputRows"]:
        issues.append(f"{len(scope['unknownInputRows'])} 行无法匹配稳定用例ID")
    if scope["unautomatedCaseIds"]:
        issues.append(f"{len(scope['unautomatedCaseIds'])} 条用例没有自动化映射")
    if scope["staleCaseIds"]:
        issues.append(f"{len(scope['staleCaseIds'])} 条用例仍有关联的失效映射")
    if duplicate_case_ids:
        issues.append(f"{len(duplicate_case_ids)} 条用例存在重复有效映射")
    if shared_result_tests:
        issues.append(f"{len(shared_result_tests)} 个测试仍共享多个用例结果")
    if missing_files:
        issues.append(f"{len(missing_files)} 个自动化脚本文件不存在")
    if issues:
        raise SystemExit("完整回归前检查失败：" + "；".join(issues))
    result = {
        "检查结果": "通过",
        "有效用例数": len(scope["resolved"]),
        "自动化脚本数": len(scope["testFiles"]),
        "脚本文件": scope["testFiles"],
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return result


def main():
    parser = ChineseArgumentParser(description="管理增量测试用例、变更计划和测试执行范围。")
    subparsers = parser.add_subparsers(dest="command", required=True)

    bootstrap_parser = subparsers.add_parser("bootstrap")
    bootstrap_parser.add_argument("source")
    bootstrap_parser.add_argument("--version", default="baseline")

    prepare_parser = subparsers.add_parser("prepare")
    prepare_parser.add_argument("source")
    prepare_parser.add_argument("--version")
    prepare_parser.add_argument("--output")

    apply_parser = subparsers.add_parser("apply")
    apply_parser.add_argument("plan")
    register_parser = subparsers.add_parser("register-automation")
    register_parser.add_argument("--test-title", required=True)
    register_parser.add_argument("--file", required=True)
    register_parser.add_argument("--case-id", action="append", required=True)
    register_parser.add_argument("--audit", required=True,
                                 help="逐项对应当前执行契约的覆盖审计JSON。")
    invalidate_parser = subparsers.add_parser("invalidate-automation")
    invalidate_parser.add_argument("--case-id", action="append", required=True)
    invalidate_parser.add_argument("--reason", required=True)
    scope_parser = subparsers.add_parser("scope")
    scope_parser.add_argument("source")
    scope_parser.add_argument("--plan", help="将变更计划中的受影响历史回归用例加入执行范围。")
    contract_parser = subparsers.add_parser("export-contract")
    contract_parser.add_argument("--case-id", action="append")
    contract_parser.add_argument("--output-dir")
    audit_parser = subparsers.add_parser("make-audit-template")
    audit_parser.add_argument("--case-id", required=True)
    audit_parser.add_argument("--test-title", required=True)
    audit_parser.add_argument("--file", required=True)
    audit_parser.add_argument("--output")
    run_plan_parser = subparsers.add_parser("make-run-plan")
    run_plan_parser.add_argument("source")
    run_plan_parser.add_argument("--plan")
    run_plan_parser.add_argument("--output")
    subparsers.add_parser("discover-automation")
    subparsers.add_parser("sync-annotations")
    subparsers.add_parser("list-specs")
    subparsers.add_parser("migrate-state")
    validate_parser = subparsers.add_parser("validate-automation")
    validate_parser.add_argument("source", nargs="?", default=str(CURRENT))

    args = parser.parse_args()
    if args.command == "bootstrap":
        bootstrap(args.source, args.version)
    elif args.command == "prepare":
        version = args.version or Path(args.source).stem
        prepare(args.source, version, args.output)
    elif args.command == "apply":
        apply_plan(args.plan)
    elif args.command == "register-automation":
        register_automation(args.test_title, args.file, args.case_id, args.audit)
    elif args.command == "invalidate-automation":
        invalidate_automation(args.case_id, args.reason)
    elif args.command == "scope":
        resolve_scope(args.source, plan_path=args.plan)
    elif args.command == "export-contract":
        export_contracts(args.case_id, args.output_dir)
    elif args.command == "make-audit-template":
        make_audit_template(args.case_id, args.test_title, args.file, args.output)
    elif args.command == "make-run-plan":
        make_run_plan(args.source, args.plan, args.output)
    elif args.command == "discover-automation":
        discover_automation()
    elif args.command == "sync-annotations":
        sync_annotations()
    elif args.command == "validate-automation":
        validate_automation(args.source)
    elif args.command == "migrate-state":
        migrate_state()
    else:
        list_specs()


if __name__ == "__main__":
    main()
