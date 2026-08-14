import importlib.util
import io
import json
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch


REPO_ROOT = Path(__file__).resolve().parents[2]


def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class ExecutionGovernanceTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.testflow = load_module(
            "testflow_under_test", REPO_ROOT / "scripts" / "testflow.py")
        self.report = load_module(
            "case_report_under_test", REPO_ROOT / "scripts" / "build_case_report.py")
        self.configure_testflow_paths()
        self.report.ROOT = self.root
        self.report.OUTPUT = self.root / "reports" / "execution_report.csv"
        self.report.SUMMARY = self.root / "reports" / "execution_summary.json"
        self.report.EVIDENCE_ARCHIVE_ROOT = self.root / "reports" / "history" / "evidence"
        (self.root / "tests" / "ui" / "specs").mkdir(parents=True)

    def tearDown(self):
        self.temp.cleanup()

    def configure_testflow_paths(self):
        cases = self.root / "cases"
        cases.mkdir(parents=True)
        values = {
            "ROOT": self.root,
            "CASES_ROOT": cases,
            "CURRENT": cases / "current.csv",
            "CASE_REGISTRY": cases / "case-registry.json",
            "AUTOMATION_REGISTRY": cases / "automation-registry.json",
            "CHANGES_ROOT": cases / "changes",
            "RUNS_ROOT": cases / "runs",
            "LEGACY_SOURCE": self.root / "missing.csv",
            "LEGACY_MAPPINGS": self.root / "missing-mappings.json",
            "LEGACY_HISTORY": self.root / "missing-history.json",
        }
        for name, value in values.items():
            setattr(self.testflow, name, value)

    def make_case(self, case_id="CASE-000001"):
        registry = self.testflow.empty_registry()
        registry["nextSequence"] = 2
        row = {
            "所属模块": "用户管理",
            "用例标题": "创建用户",
            "前置条件": "已登录；存在管理员账号",
            "步骤": "1. 打开用户页面\n2. 输入账号\n3. 点击保存",
            "预期": "1. 弹框关闭\n2. 列表显示新用户",
        }
        case = self.testflow.make_case(registry, row, "V1.0", case_id=case_id)
        registry["cases"][case_id] = case
        self.testflow.write_json(self.testflow.CASE_REGISTRY, registry)
        self.testflow.write_json(
            self.testflow.AUTOMATION_REGISTRY,
            {"version": 2, "updatedAt": "", "tests": {}, "cases": {}},
        )
        return registry, case

    def complete_audit(self, case, title, spec_file):
        contract = self.testflow.execution_contract(case)
        audit = {
            "schemaVersion": 1,
            "caseId": case["id"],
            "caseRevision": case["revision"],
            "contractHash": contract["contractHash"],
            "testTitle": title,
            "file": spec_file,
            "coverage": [
                {
                    "contractItemId": item_id,
                    "implementation": f"users.spec.js: test body uses locator.fill and click for {item_id}",
                    "evidence": f"expect assertion verifies the final visible list state for {item_id}",
                }
                for item_id in contract["completionGate"]["requiredCoverageIds"]
            ],
        }
        path = self.root / "cases" / "audits" / f"{case['id']}.json"
        self.testflow.write_json(path, audit)
        return path

    def register_case(self, case, title="创建用户"):
        spec_file = "tests/ui/specs/users.spec.js"
        spec_path = self.root / spec_file
        spec_path.write_text("test('创建用户', async () => {});\n", encoding="utf-8")
        audit = self.complete_audit(case, title, spec_file)
        with redirect_stdout(io.StringIO()):
            self.testflow.register_automation(title, spec_file, [case["id"]], audit)
        return spec_path

    def test_modify_increments_revision_and_invalidates_automation(self):
        registry, case = self.make_case()
        self.register_case(case)
        changed_row = dict(case["fields"])
        changed_row["预期"] = "1. 弹框关闭\n2. 列表和详情均显示新用户"
        plan = {
            "status": "reviewed",
            "iterationVersion": "V2.0",
            "uncertain": [],
            "items": [{
                "action": "modify",
                "targetCaseId": case["id"],
                "retireCaseIds": [],
                "case": changed_row,
            }],
        }
        plan_path = self.root / "cases" / "changes" / "modify.json"
        self.testflow.write_json(plan_path, plan)

        with redirect_stdout(io.StringIO()):
            self.testflow.apply_plan(plan_path)

        updated = self.testflow.load_json(self.testflow.CASE_REGISTRY, {})["cases"][case["id"]]
        automation = self.testflow.load_json(self.testflow.AUTOMATION_REGISTRY, {})
        self.assertEqual(updated["revision"], 2)
        self.assertEqual(len(updated["revisions"]), 1)
        self.assertNotEqual(updated["contractHash"], case["contractHash"])
        self.assertEqual(automation["tests"]["创建用户"]["status"], "stale")

    def test_incomplete_audit_cannot_register_as_active(self):
        _, case = self.make_case()
        spec_file = "tests/ui/specs/users.spec.js"
        (self.root / spec_file).write_text("test('创建用户', async () => {});\n", encoding="utf-8")
        audit = self.complete_audit(case, "创建用户", spec_file)
        payload = json.loads(audit.read_text(encoding="utf-8"))
        payload["coverage"].pop()
        self.testflow.write_json(audit, payload)

        with self.assertRaisesRegex(SystemExit, "缺少覆盖项"):
            self.testflow.register_automation("创建用户", spec_file, [case["id"]], audit)

    def test_script_change_invalidates_binding_and_blocks_run_plan(self):
        _, case = self.make_case()
        spec_path = self.register_case(case)
        source = self.root / "cases" / "iteration.csv"
        self.testflow.export_current(
            self.testflow.load_json(self.testflow.CASE_REGISTRY, {}), source)
        spec_path.write_text("test('创建用户', async () => { throw new Error(); });\n",
                             encoding="utf-8")

        scope = self.testflow.resolve_scope(source, emit=False)

        self.assertIn(case["id"], scope["staleCaseIds"])
        self.assertIn("脚本文件已变化", scope["bindingIssues"][case["id"]]["创建用户"])
        with self.assertRaisesRegex(SystemExit, "自动化失效"):
            self.testflow.make_run_plan(source)

    def test_complete_audit_can_create_exact_run_plan(self):
        _, case = self.make_case()
        self.register_case(case)
        source = self.root / "cases" / "iteration.csv"
        self.testflow.export_current(
            self.testflow.load_json(self.testflow.CASE_REGISTRY, {}), source)
        output = self.root / "cases" / "runs" / "run.json"

        with redirect_stdout(io.StringIO()):
            plan = self.testflow.make_run_plan(source, output=output)

        self.assertEqual(plan["caseIds"], [case["id"]])
        self.assertEqual(plan["testTitles"], ["创建用户"])
        self.assertEqual(plan["bindings"][0]["caseRevision"], 1)
        self.assertEqual(plan["bindings"][0]["contractHash"], case["contractHash"])
        self.assertTrue(plan["bindings"][0]["implementationHash"])
        self.assertTrue(plan["bindings"][0]["auditHash"])

    def test_template_audit_cannot_register_as_active(self):
        _, case = self.make_case()
        spec_file = "tests/ui/specs/users.spec.js"
        (self.root / spec_file).write_text("test('创建用户', async () => {});\n", encoding="utf-8")
        audit = self.complete_audit(case, "创建用户", spec_file)
        payload = json.loads(audit.read_text(encoding="utf-8"))
        for item in payload["coverage"]:
            item["implementation"] = f"{spec_file} :: 创建用户（按当前CASE契约执行）"
            item["evidence"] = f"本批Playwright实际执行 {case['id']}；与执行契约对应。"
        self.testflow.write_json(audit, payload)

        with self.assertRaisesRegex(SystemExit, "模板化"):
            self.testflow.register_automation("创建用户", spec_file, [case["id"]], audit)

    def test_audit_change_invalidates_binding(self):
        _, case = self.make_case()
        self.register_case(case)
        automation = self.testflow.load_json(self.testflow.AUTOMATION_REGISTRY, {})
        audit = self.root / automation["tests"]["创建用户"]["auditFile"]
        payload = json.loads(audit.read_text(encoding="utf-8"))
        payload["notes"] = "changed after registration"
        self.testflow.write_json(audit, payload)

        issue = self.testflow.automation_binding_issue(
            automation["tests"]["创建用户"], case, "创建用户")
        self.assertIn("审计文件已变化", issue)

    def test_run_plan_rejects_duplicate_case_ids(self):
        _, case = self.make_case()
        self.register_case(case)
        source = self.root / "cases" / "iteration.csv"
        self.testflow.export_current(
            self.testflow.load_json(self.testflow.CASE_REGISTRY, {}), source)
        rows, headers = self.testflow.read_csv(source)
        self.testflow.write_csv(source, [rows[0], rows[0]], headers)

        with self.assertRaisesRegex(SystemExit, "重复解析到同一CASE-ID"):
            self.testflow.make_run_plan(source)

    def test_run_plan_requires_applied_matching_merge_plan(self):
        _, case = self.make_case()
        self.register_case(case)
        source = self.root / "cases" / "iteration.csv"
        self.testflow.export_current(
            self.testflow.load_json(self.testflow.CASE_REGISTRY, {}), source)
        plan_path = self.root / "cases" / "changes" / "plan.json"
        self.testflow.write_json(plan_path, {
            "status": "reviewed",
            "sourceCsv": str(source),
            "sourceHash": self.testflow.hash_file(source),
            "impactedRegressionCaseIds": [],
        })

        with self.assertRaisesRegex(SystemExit, "必须已经apply"):
            self.testflow.make_run_plan(source, plan_path=plan_path)

    def test_explicit_retire_does_not_create_replacement_case(self):
        registry, case = self.make_case()
        self.register_case(case)
        plan = {
            "status": "reviewed",
            "iterationVersion": "V2.0",
            "uncertain": [],
            "items": [{
                "action": "retire",
                "targetCaseId": case["id"],
                "retireCaseIds": [],
                "reason": "功能已明确删除",
                "case": {},
            }],
        }
        plan_path = self.root / "cases" / "changes" / "retire.json"
        self.testflow.write_json(plan_path, plan)

        with redirect_stdout(io.StringIO()):
            self.testflow.apply_plan(plan_path)

        updated = self.testflow.load_json(self.testflow.CASE_REGISTRY, {})
        automation = self.testflow.load_json(self.testflow.AUTOMATION_REGISTRY, {})
        self.assertEqual(len(updated["cases"]), len(registry["cases"]))
        self.assertEqual(updated["cases"][case["id"]]["status"], "retired")
        self.assertEqual(updated["cases"][case["id"]]["replacedBy"], "")
        self.assertEqual(automation["tests"]["创建用户"]["status"],
                         "retirement-candidate")

    def test_report_rejects_missing_planned_case_result(self):
        _, case = self.make_case()
        self.register_case(case)
        automation = self.testflow.load_json(self.testflow.AUTOMATION_REGISTRY, {})
        entry = automation["tests"]["创建用户"]
        run_plan = {
            "caseIds": [case["id"], "CASE-000002"],
            "bindings": [{
                "caseId": case["id"],
                "caseRevision": case["revision"],
                "contractHash": case["contractHash"],
                "testTitle": "创建用户",
                "file": entry["file"],
                "implementationHash": entry["implementationHash"],
                "auditHash": entry["auditHash"],
            }],
        }
        raw_results = [{
            "title": "创建用户",
            "caseIds": [case["id"]],
            "status": "passed",
            "cleanupStatus": "passed",
            "cleanupReportedDynamically": True,
        }]
        registry = self.testflow.load_json(self.testflow.CASE_REGISTRY, {})

        with self.assertRaisesRegex(SystemExit, "没有结果"):
            self.report.validate_batch_results(raw_results, automation, run_plan, registry)

    def test_report_rejects_skipped_planned_case(self):
        _, case = self.make_case()
        self.register_case(case)
        automation = self.testflow.load_json(self.testflow.AUTOMATION_REGISTRY, {})
        entry = automation["tests"]["创建用户"]
        run_plan = {
            "caseIds": [case["id"]],
            "bindings": [{
                "caseId": case["id"],
                "caseRevision": case["revision"],
                "contractHash": case["contractHash"],
                "testTitle": "创建用户",
                "file": entry["file"],
                "implementationHash": entry["implementationHash"],
            }],
        }
        raw_results = [{
            "title": "创建用户",
            "caseIds": [case["id"]],
            "status": "skipped",
            "cleanupStatus": "passed",
        }]
        registry = self.testflow.load_json(self.testflow.CASE_REGISTRY, {})

        with self.assertRaisesRegex(SystemExit, "被跳过"):
            self.report.validate_batch_results(raw_results, automation, run_plan, registry)

    def test_report_rejects_missing_cleanup_status(self):
        _, case = self.make_case()
        self.register_case(case)
        automation = self.testflow.load_json(self.testflow.AUTOMATION_REGISTRY, {})
        entry = automation["tests"]["创建用户"]
        run_plan = {
            "caseIds": [case["id"]],
            "bindings": [{
                "caseId": case["id"],
                "caseRevision": case["revision"],
                "contractHash": case["contractHash"],
                "testTitle": "创建用户",
                "file": entry["file"],
                "implementationHash": entry["implementationHash"],
            }],
        }
        raw_results = [{
            "title": "创建用户",
            "caseIds": [case["id"]],
            "status": "passed",
            "cleanupStatus": "not_reported",
        }]
        registry = self.testflow.load_json(self.testflow.CASE_REGISTRY, {})

        with self.assertRaisesRegex(SystemExit, "非法或未报告"):
            self.report.validate_batch_results(raw_results, automation, run_plan, registry)

    def test_report_rejects_static_cleanup_success(self):
        _, case = self.make_case()
        self.register_case(case)
        automation = self.testflow.load_json(self.testflow.AUTOMATION_REGISTRY, {})
        entry = automation["tests"]["创建用户"]
        run_plan = {
            "caseIds": [case["id"]],
            "bindings": [{
                "caseId": case["id"], "caseRevision": case["revision"],
                "contractHash": case["contractHash"], "testTitle": "创建用户",
                "file": entry["file"], "implementationHash": entry["implementationHash"],
                "auditHash": entry["auditHash"],
            }],
        }
        raw_results = [{
            "title": "创建用户", "caseIds": [case["id"]], "status": "passed",
            "cleanupStatus": "passed", "cleanupReportedDynamically": False,
        }]
        registry = self.testflow.load_json(self.testflow.CASE_REGISTRY, {})

        with self.assertRaisesRegex(SystemExit, "静态声明"):
            self.report.validate_batch_results(raw_results, automation, run_plan, registry)

    def test_report_rejects_unknown_failure_category(self):
        _, case = self.make_case()
        self.register_case(case)
        automation = self.testflow.load_json(self.testflow.AUTOMATION_REGISTRY, {})
        entry = automation["tests"]["创建用户"]
        run_plan = {
            "caseIds": [case["id"]],
            "bindings": [{
                "caseId": case["id"], "caseRevision": case["revision"],
                "contractHash": case["contractHash"], "testTitle": "创建用户",
                "file": entry["file"], "implementationHash": entry["implementationHash"],
                "auditHash": entry["auditHash"],
            }],
        }
        raw_results = [{
            "title": "创建用户", "caseIds": [case["id"]], "status": "failed",
            "cleanupStatus": "not-applicable", "failureCategory": "UNKNOWN",
        }]
        registry = self.testflow.load_json(self.testflow.CASE_REGISTRY, {})

        with self.assertRaisesRegex(SystemExit, "未归因"):
            self.report.validate_batch_results(raw_results, automation, run_plan, registry)

    def test_stale_mapping_does_not_erase_trusted_execution_result(self):
        registry, case = self.make_case()
        self.register_case(case)
        source = self.root / "cases" / "current.csv"
        self.testflow.export_current(registry, source)
        rows, headers = self.report.read_csv(source)
        automation = self.testflow.load_json(self.testflow.AUTOMATION_REGISTRY, {})
        automation["tests"]["创建用户"]["status"] = "stale"
        history = {
            "version": 1,
            "cases": {
                case["id"]: {
                    "fingerprint": self.report.case_fingerprint(rows[0], headers),
                    "status": "passed",
                    "trusted": True,
                    "testTitle": "创建用户",
                    "executedAt": "2026-08-14T00:00:00Z",
                    "failureCategory": "",
                    "cleanupStatus": "passed",
                    "error": "",
                    "evidence": [],
                }
            },
        }

        summary, _ = self.report.render_reports(
            history, rows, headers, set(), automation, registry)
        rendered, _ = self.report.read_csv(self.report.OUTPUT)

        self.assertEqual(summary["passed_case_count"], 1)
        self.assertEqual(summary["needs_rerun_case_count"], 1)
        self.assertEqual(rendered[0]["执行结果"], "通过")
        self.assertEqual(rendered[0]["自动化状态"], "需重新执行")

    def test_changed_case_does_not_erase_trusted_execution_result(self):
        registry, case = self.make_case()
        self.register_case(case)
        source = self.root / "cases" / "current.csv"
        self.testflow.export_current(registry, source)
        rows, headers = self.report.read_csv(source)
        old_fingerprint = self.report.case_fingerprint(rows[0], headers)
        rows[0]["预期"] = "当前版本已经修改预期"
        self.report.write_csv(source, rows, headers)
        automation = self.testflow.load_json(self.testflow.AUTOMATION_REGISTRY, {})
        history = {
            "version": 1,
            "cases": {
                case["id"]: {
                    "fingerprint": old_fingerprint,
                    "status": "failed",
                    "trusted": True,
                    "testTitle": "创建用户",
                    "executedAt": "2026-08-14T00:00:00Z",
                    "failureCategory": "PRODUCT_DEFECT",
                    "cleanupStatus": "passed",
                    "error": "产品行为不符合预期",
                    "evidence": [],
                }
            },
        }

        summary, _ = self.report.render_reports(
            history, rows, headers, set(), automation, registry)
        rendered, _ = self.report.read_csv(self.report.OUTPUT)

        self.assertEqual(summary["failed_case_count"], 1)
        self.assertEqual(summary["not_executed_case_count"], 0)
        self.assertEqual(rendered[0]["执行结果"], "未通过")
        self.assertEqual(rendered[0]["自动化状态"], "需重新执行")

    def test_stale_mapping_without_history_is_not_unautomated(self):
        registry, case = self.make_case()
        self.register_case(case)
        source = self.root / "cases" / "current.csv"
        self.testflow.export_current(registry, source)
        rows, headers = self.report.read_csv(source)
        automation = self.testflow.load_json(self.testflow.AUTOMATION_REGISTRY, {})
        automation["tests"]["创建用户"]["status"] = "stale"

        summary, _ = self.report.render_reports(
            {"version": 1, "cases": {}}, rows, headers, set(), automation, registry)
        rendered, _ = self.report.read_csv(self.report.OUTPUT)

        self.assertEqual(summary["needs_rerun_case_count"], 1)
        self.assertEqual(rendered[0]["执行结果"], "未执行")
        self.assertEqual(rendered[0]["自动化状态"], "需重新执行")

    def test_latest_evidence_is_archived_before_next_batch_cleanup(self):
        source = self.root / "reports" / "latest" / "test-results" / "failure.png"
        source.parent.mkdir(parents=True)
        source.write_bytes(b"evidence")
        history = {
            "version": 1,
            "cases": {
                "CASE-000001": {
                    "status": "failed",
                    "trusted": True,
                    "testTitle": "创建用户",
                    "executedAt": "2026-08-14T00:00:00Z",
                    "evidence": [str(source.relative_to(self.root))],
                }
            },
        }

        summary = self.report.cleanup_evidence(history)
        archived = history["cases"]["CASE-000001"]["evidence"][0]

        self.assertEqual(summary["归档证据路径数"], 1)
        self.assertTrue(archived.startswith("reports/history/evidence/"))
        self.assertTrue((self.root / archived).is_file())
        source.unlink()
        second = self.report.cleanup_evidence(history)
        self.assertEqual(second["清理失效路径数"], 0)
        self.assertTrue((self.root / archived).is_file())

    def test_discovery_preserves_audited_active_registration(self):
        _, case = self.make_case()
        self.register_case(case)
        completed = SimpleNamespace(
            returncode=0,
            stdout="  specs/users.spec.js:1:1 › 创建用户\n",
            stderr="",
        )

        with patch.object(self.testflow.subprocess, "run", return_value=completed):
            with redirect_stdout(io.StringIO()):
                self.testflow.discover_automation()

        automation = self.testflow.load_json(self.testflow.AUTOMATION_REGISTRY, {})
        entry = automation["tests"]["创建用户"]
        self.assertEqual(entry["status"], "active")
        self.assertEqual(entry["caseRevision"], 1)
        self.assertTrue(entry["implementationHash"])

    def test_annotation_sync_does_not_borrow_another_tests_audit(self):
        _, case = self.make_case()
        self.register_case(case)
        payload = {
            "suites": [{
                "title": "renamed.spec.js",
                "suites": [],
                "specs": [{
                    "title": "重命名后的测试",
                    "file": "specs/renamed.spec.js",
                    "tests": [{
                        "annotations": [{"type": "case", "description": case["id"]}],
                    }],
                }],
            }],
        }
        completed = SimpleNamespace(
            returncode=0,
            stdout=json.dumps(payload, ensure_ascii=False),
            stderr="",
        )

        with patch.object(self.testflow.subprocess, "run", return_value=completed):
            with redirect_stdout(io.StringIO()):
                self.testflow.sync_annotations()

        automation = self.testflow.load_json(self.testflow.AUTOMATION_REGISTRY, {})
        entry = automation["tests"]["重命名后的测试"]
        self.assertEqual(entry["status"], "stale")
        self.assertNotIn("implementationHash", entry)
        self.assertNotIn("auditFile", entry)


if __name__ == "__main__":
    unittest.main()
