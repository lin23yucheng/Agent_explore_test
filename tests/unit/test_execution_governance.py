import importlib.util
import io
import json
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]


def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class CurrentSnapshotGovernanceTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        self.flow = load_module("snapshot_testflow", REPO_ROOT / "scripts" / "testflow.py")
        self.report = load_module("snapshot_report", REPO_ROOT / "scripts" / "build_case_report.py")

        cases = self.root / "cases"
        self.flow.ROOT = self.root
        self.flow.CASES_ROOT = cases
        self.flow.CURRENT = cases / "current.csv"
        self.flow.ID_SEQUENCE = cases / "id-sequence.json"
        self.flow.AUTOMATION_REGISTRY = cases / "automation-registry.json"
        self.flow.CANDIDATES_ROOT = cases / "candidates"
        self.flow.CHANGES_ROOT = cases / "changes"
        self.flow.CONTRACTS_ROOT = cases / "contracts"
        self.flow.AUDITS_ROOT = cases / "audits"
        self.flow.RUNS_ROOT = cases / "runs"
        self.flow.EXECUTION_REPORT = self.root / "reports" / "execution_report.csv"
        self.flow.SPECS_ROOT = self.root / "tests" / "ui" / "specs"
        for path in [self.flow.CANDIDATES_ROOT, self.flow.CHANGES_ROOT,
                     self.flow.CONTRACTS_ROOT, self.flow.AUDITS_ROOT,
                     self.flow.RUNS_ROOT, self.flow.SPECS_ROOT]:
            path.mkdir(parents=True, exist_ok=True)

        self.report.flow = self.flow
        self.report.ROOT = self.root
        self.report.CURRENT = self.flow.CURRENT
        self.report.OUTPUT = self.flow.EXECUTION_REPORT
        self.report.SUMMARY = self.root / "reports" / "execution_summary.json"
        self.report.EVIDENCE_ROOT = self.root / "reports" / "evidence"

        self.case = self.make_case("CASE-000001", "创建用户")
        self.flow.write_csv_atomic(self.flow.CURRENT, [self.case], self.flow.CURRENT_HEADERS)
        self.flow.write_json_atomic(self.flow.ID_SEQUENCE, {"schemaVersion": 1, "nextSequence": 2})
        self.flow.write_json_atomic(self.flow.AUTOMATION_REGISTRY, self.flow.empty_automation())
        with redirect_stdout(io.StringIO()):
            self.flow.sync_report(reset=True)

    def tearDown(self):
        self.temporary.cleanup()

    def make_case(self, case_id, title, expected="用户创建成功"):
        return self.flow.normalize_case({
            "用例ID": case_id,
            "源测试点ID": f"node-{case_id}",
            "所属模块": "用户管理",
            "用例标题": title,
            "前置条件": "管理员已经登录系统",
            "步骤": "1. 打开用户管理\n2. 输入账号并保存",
            "预期": expected,
            "关键词": "用户",
            "优先级": "2",
            "用例类型": "功能测试",
            "适用阶段": "功能测试阶段",
        })

    def make_complete_audit(self, case, test_title, spec_file,
                            audit_path=None, contract_path=None):
        audit_path = audit_path or self.flow.AUDITS_ROOT / f"{case['用例ID']}.json"
        contract_path, contract = self.flow.write_contract(case, contract_path)
        coverage = []
        for key in self.flow.CONTRACT_FIELDS:
            for item in contract[key]:
                coverage.append({
                    "id": item["id"], "text": item["text"],
                    "implementation": f"{spec_file}: 执行{item['id']}对应的页面操作",
                    "evidence": f"Playwright断言和运行附件证明{item['id']}完成",
                })
        self.flow.write_json_atomic(audit_path, {
            "schemaVersion": 1,
            "caseId": case["用例ID"],
            "caseContentHash": case["用例内容哈希"],
            "contractHash": contract["contractHash"],
            "testTitle": test_title,
            "file": spec_file,
            "contractFile": str(contract_path.relative_to(self.root)).replace("\\", "/"),
            "coverage": coverage,
        })
        return audit_path

    def register_candidate(self):
        case_id = self.case["用例ID"]
        spec_file = f"tests/ui/specs/{case_id}.spec.js"
        title = f"用户管理 › 创建用户 [{case_id}]"
        spec_path = self.root / spec_file
        spec_path.write_text("const testBody = 'current case implementation';\n", encoding="utf-8")
        audit = self.make_complete_audit(self.case, title, spec_file)
        with redirect_stdout(io.StringIO()):
            self.flow.register_candidate(case_id, title, spec_file, audit,
                                         "直接探索已保存并验证最终列表")
        return title, spec_file, audit

    def promotion_plan(self):
        output = self.flow.RUNS_ROOT / "promotion.json"
        with redirect_stdout(io.StringIO()):
            return self.flow.make_run_plan(self.flow.CURRENT, output=output,
                                           case_ids=[self.case["用例ID"]], promotion=True)

    def result(self, title, status="passed", category=""):
        return {
            "title": title,
            "caseIds": [self.case["用例ID"]],
            "status": status,
            "failureCategory": category,
            "cleanupStatus": "not-applicable",
            "cleanupReportedDynamically": False,
            "executedAt": "2026-08-17T00:00:00Z",
            "runId": "RUN-1",
            "error": "" if status == "passed" else "产品行为不符合预期",
            "attachments": [] if status == "passed" else [{
                "name": "error-context", "path": "", "body": "failure evidence",
            }],
        }

    def test_reset_state_removes_version_columns_and_resets_results(self):
        old = {**self.case, "用例Revision": "8", "首次版本": "V1", "状态": "有效"}
        self.flow.write_csv_atomic(self.flow.CURRENT, [old], [
            "用例ID", "用例Revision", "首次版本", "状态", *self.flow.BUSINESS_HEADERS,
        ])
        with redirect_stdout(io.StringIO()):
            self.flow.reset_state()
        current, headers = self.flow.read_csv(self.flow.CURRENT)
        report, _ = self.flow.read_csv(self.flow.EXECUTION_REPORT)
        self.assertEqual(headers, self.flow.CURRENT_HEADERS)
        self.assertNotIn("用例Revision", current[0])
        self.assertEqual(report[0]["执行结果"], "未执行")
        self.assertEqual(report[0]["自动化状态"], "未自动化")

    def test_reset_state_repairs_stale_id_sequence(self):
        self.flow.write_json_atomic(
            self.flow.ID_SEQUENCE, {"schemaVersion": 1, "nextSequence": 1}
        )
        with redirect_stdout(io.StringIO()):
            self.flow.reset_state()
        self.assertEqual(self.flow.load_json(self.flow.ID_SEQUENCE, {})["nextSequence"], 2)

    def test_sync_report_mirrors_current_and_removes_extra_ids(self):
        extra = {**self.case, "用例ID": "CASE-999999", **self.flow.initial_result_fields()}
        existing = {**self.case, **self.flow.initial_result_fields(), "执行结果": "未通过"}
        self.flow.write_csv_atomic(self.flow.EXECUTION_REPORT, [existing, extra],
                                   [*self.flow.CURRENT_HEADERS, *self.flow.RESULT_HEADERS])
        with redirect_stdout(io.StringIO()):
            rows = self.flow.sync_report()
        self.assertEqual([row["用例ID"] for row in rows], ["CASE-000001"])
        self.assertEqual(rows[0]["执行结果"], "未通过")
        summary = self.flow.load_json(self.root / "reports" / "execution_summary.json", {})
        self.assertEqual(summary["source_case_count"], 1)
        self.assertEqual(summary["failed_case_count"], 1)

    def test_same_module_and_title_are_rejected_even_with_unique_ids(self):
        second = self.make_case("CASE-000002", "创建用户", "账号创建后显示在列表")
        with self.assertRaisesRegex(SystemExit, "重复模块和标题"):
            self.flow.validate_current_rows([self.case, second])

    def test_modify_allocates_new_id_and_removes_old_assets(self):
        title, spec_file, _ = self.register_candidate()
        source = self.root / "iteration.csv"
        changed = {**self.case, "预期": "用户保存后显示在列表"}
        self.flow.write_csv_atomic(source, [changed], self.flow.CURRENT_HEADERS)
        plan_path = self.flow.CHANGES_ROOT / "modify.json"
        plan = {
            "schemaVersion": 1, "status": "reviewed", "uncertain": [],
            "sourceCsv": str(source), "sourceHash": self.flow.hash_file(source),
            "baseCurrentHash": self.flow.hash_file(self.flow.CURRENT),
            "items": [{"inputRow": 1, "action": "modify",
                       "targetCaseId": "CASE-000001", "reason": "业务预期变化",
                       "case": self.flow.business_fields(changed)}],
            "impactedRegressionCaseIds": [],
        }
        self.flow.write_json_atomic(plan_path, plan)
        with redirect_stdout(io.StringIO()):
            self.flow.apply_plan(plan_path)
        current = self.flow.load_current()
        report, _ = self.flow.read_csv(self.flow.EXECUTION_REPORT)
        self.assertEqual(current[0]["用例ID"], "CASE-000002")
        self.assertEqual(report[0]["执行结果"], "未执行")
        self.assertFalse((self.root / spec_file).exists())
        self.assertFalse((self.flow.CANDIDATES_ROOT / "CASE-000001.json").exists())

    def test_invalid_later_plan_item_does_not_delete_earlier_case_assets(self):
        _, spec_file, _ = self.register_candidate()
        source = self.root / "iteration.csv"
        changed = {**self.case, "预期": "用户保存后显示在列表"}
        self.flow.write_csv_atomic(source, [changed], self.flow.CURRENT_HEADERS)
        plan_path = self.flow.CHANGES_ROOT / "invalid.json"
        plan = {
            "schemaVersion": 1, "status": "reviewed", "uncertain": [],
            "sourceCsv": str(source), "sourceHash": self.flow.hash_file(source),
            "baseCurrentHash": self.flow.hash_file(self.flow.CURRENT),
            "items": [
                {"inputRow": 1, "action": "modify", "targetCaseId": "CASE-000001",
                 "reason": "业务预期变化", "case": self.flow.business_fields(changed)},
                {"inputRow": 2, "action": "invalid", "targetCaseId": "CASE-000001",
                 "reason": "后续计划未审核", "case": self.flow.business_fields(changed)},
            ],
            "impactedRegressionCaseIds": [],
        }
        self.flow.write_json_atomic(plan_path, plan)
        with self.assertRaisesRegex(SystemExit, "未审核动作"):
            self.flow.apply_plan(plan_path)
        self.assertTrue((self.root / spec_file).exists())
        self.assertTrue((self.flow.CANDIDATES_ROOT / "CASE-000001.json").exists())
        self.assertEqual(self.flow.load_current()[0]["用例ID"], "CASE-000001")

    def test_apply_write_failure_rolls_back_state_and_case_assets(self):
        _, spec_file, _ = self.register_candidate()
        source = self.root / "iteration.csv"
        changed = {**self.case, "预期": "用户保存后显示在列表"}
        self.flow.write_csv_atomic(source, [changed], self.flow.CURRENT_HEADERS)
        plan_path = self.flow.CHANGES_ROOT / "rollback.json"
        plan = {
            "schemaVersion": 1, "status": "reviewed", "uncertain": [],
            "sourceCsv": str(source), "sourceHash": self.flow.hash_file(source),
            "baseCurrentHash": self.flow.hash_file(self.flow.CURRENT),
            "items": [{"inputRow": 1, "action": "modify",
                       "targetCaseId": "CASE-000001", "reason": "业务预期变化",
                       "case": self.flow.business_fields(changed)}],
            "impactedRegressionCaseIds": [],
        }
        self.flow.write_json_atomic(plan_path, plan)
        original_write_json = self.flow.write_json_atomic

        def fail_after_current(path, value):
            if Path(path) == self.flow.ID_SEQUENCE:
                raise OSError("simulated sequence write failure")
            return original_write_json(path, value)

        self.flow.write_json_atomic = fail_after_current
        try:
            with self.assertRaisesRegex(OSError, "simulated sequence"):
                self.flow.apply_plan(plan_path)
        finally:
            self.flow.write_json_atomic = original_write_json

        self.assertEqual(self.flow.load_current()[0]["用例ID"], "CASE-000001")
        self.assertEqual(self.flow.load_sequence()["nextSequence"], 2)
        self.assertEqual(self.flow.load_json(plan_path, {})["status"], "reviewed")
        self.assertTrue((self.root / spec_file).exists())
        self.assertTrue((self.flow.CANDIDATES_ROOT / "CASE-000001.json").exists())

    def test_incremental_scope_requires_applied_plan(self):
        source = self.root / "iteration.csv"
        self.flow.write_csv_atomic(source, [self.case], self.flow.CURRENT_HEADERS)
        with self.assertRaisesRegex(SystemExit, "必须提供已经apply"):
            self.flow.select_scope(source)

    def test_candidate_requires_case_id_in_test_title(self):
        spec_file = "tests/ui/specs/CASE-000001.spec.js"
        (self.root / spec_file).write_text("test body", encoding="utf-8")
        audit = self.make_complete_audit(self.case, "用户管理 › 创建用户", spec_file)
        with self.assertRaisesRegex(SystemExit, "标题必须包含CASE-ID"):
            self.flow.register_candidate("CASE-000001", "用户管理 › 创建用户",
                                         spec_file, audit, "直接探索通过")

    def test_promotion_pass_creates_active_automation_and_pass_result(self):
        title, spec_file, _ = self.register_candidate()
        plan = self.promotion_plan()
        with redirect_stdout(io.StringIO()):
            summary = self.report.merge_results(plan, [self.result(title)])
        automation = self.flow.load_automation()
        report, _ = self.flow.read_csv(self.flow.EXECUTION_REPORT)
        self.assertIn("CASE-000001", automation["cases"])
        self.assertTrue((self.root / spec_file).exists())
        self.assertEqual(report[0]["执行结果"], "通过")
        self.assertEqual(report[0]["自动化状态"], "已自动化")
        self.assertEqual(summary["automated_case_count"], 1)

    def test_promotion_failure_deletes_script_and_keeps_evidence(self):
        title, spec_file, _ = self.register_candidate()
        plan = self.promotion_plan()
        with redirect_stdout(io.StringIO()):
            self.report.merge_results(plan, [self.result(title, "failed", "PRODUCT_DEFECT")])
        report, _ = self.flow.read_csv(self.flow.EXECUTION_REPORT)
        self.assertFalse((self.root / spec_file).exists())
        self.assertNotIn("CASE-000001", self.flow.load_automation()["cases"])
        self.assertEqual(report[0]["执行结果"], "未通过")
        self.assertIn("reports/evidence/", report[0]["证据路径"])

    def test_unclassified_failure_deletes_script_and_records_report(self):
        title, spec_file, _ = self.register_candidate()
        plan = self.promotion_plan()
        with redirect_stdout(io.StringIO()):
            self.report.merge_results(plan, [self.result(title, "failed", "UNCLASSIFIED")])
        report, _ = self.flow.read_csv(self.flow.EXECUTION_REPORT)
        self.assertFalse((self.root / spec_file).exists())
        self.assertEqual(report[0]["执行结果"], "未通过")
        self.assertEqual(report[0]["失败分类"], "UNCLASSIFIED")
        self.assertNotIn("CASE-000001", self.flow.load_automation()["cases"])

    def test_unverified_cleanup_deletes_script_and_records_failure(self):
        title, spec_file, _ = self.register_candidate()
        plan = self.promotion_plan()
        result = self.result(title)
        result["cleanupStatus"] = "not_reported"
        with redirect_stdout(io.StringIO()):
            self.report.merge_results(plan, [result])
        report, _ = self.flow.read_csv(self.flow.EXECUTION_REPORT)
        self.assertFalse((self.root / spec_file).exists())
        self.assertEqual(report[0]["执行结果"], "未通过")
        self.assertEqual(report[0]["失败分类"], "UNCLASSIFIED")
        self.assertEqual(report[0]["清理状态"], "unverified")
        self.assertIn("reports/evidence/", report[0]["证据路径"])

    def test_direct_exploration_failure_updates_report_without_script(self):
        with redirect_stdout(io.StringIO()):
            self.flow.record_exploration_failure(
                "CASE-000001", "PRODUCT_DEFECT", "保存后列表没有出现用户",
                "not-applicable", ["reports/evidence/RUN-1/CASE-000001/error.png"], "RUN-1")
        report, _ = self.flow.read_csv(self.flow.EXECUTION_REPORT)
        self.assertEqual(report[0]["执行结果"], "未通过")
        self.assertEqual(report[0]["失败分类"], "PRODUCT_DEFECT")
        self.assertEqual(report[0]["自动化状态"], "未自动化")
        self.assertFalse(list(self.flow.SPECS_ROOT.glob("*.spec.js")))

    def test_direct_exploration_failure_requires_evidence(self):
        with self.assertRaisesRegex(SystemExit, "必须提供截图"):
            self.flow.record_exploration_failure(
                "CASE-000001", "PRODUCT_DEFECT", "保存失败",
                "not-applicable", [], "RUN-1")

    def test_active_regression_failure_removes_previously_passed_script(self):
        title, spec_file, _ = self.register_candidate()
        promotion = self.promotion_plan()
        with redirect_stdout(io.StringIO()):
            self.report.merge_results(promotion, [self.result(title)])
            regression = self.flow.make_run_plan(
                self.flow.CURRENT, output=self.flow.RUNS_ROOT / "regression.json",
                case_ids=["CASE-000001"], promotion=False)
            self.report.merge_results(
                regression, [self.result(title, "failed", "PRODUCT_DEFECT")])
        report, _ = self.flow.read_csv(self.flow.EXECUTION_REPORT)
        self.assertFalse((self.root / spec_file).exists())
        self.assertEqual(report[0]["执行结果"], "未通过")
        self.assertEqual(report[0]["自动化状态"], "未自动化")

    def test_invalidate_removes_custom_audit_and_contract_paths(self):
        case_id = self.case["用例ID"]
        spec_file = f"tests/ui/specs/{case_id}.spec.js"
        title = f"用户管理 › 创建用户 [{case_id}]"
        spec_path = self.root / spec_file
        spec_path.write_text("const testBody = 'custom assets';\n", encoding="utf-8")
        audit_path = self.flow.AUDITS_ROOT / "custom" / "coverage.json"
        contract_path = self.flow.CONTRACTS_ROOT / "custom" / "contract.json"
        audit = self.make_complete_audit(
            self.case, title, spec_file, audit_path=audit_path,
            contract_path=contract_path,
        )
        with redirect_stdout(io.StringIO()):
            self.flow.register_candidate(case_id, title, spec_file, audit,
                                         "直接探索已保存并验证最终列表")
            self.flow.invalidate_automation([case_id], "用例需要重新执行")
        self.assertFalse(spec_path.exists())
        self.assertFalse(audit_path.exists())
        self.assertFalse(contract_path.exists())
        self.assertFalse((self.flow.CANDIDATES_ROOT / f"{case_id}.json").exists())

    def test_invalidate_write_failure_restores_candidate_and_assets(self):
        _, spec_file, audit_path = self.register_candidate()
        contract_path = self.flow.CONTRACTS_ROOT / "CASE-000001.json"
        original_write_json = self.flow.write_json_atomic

        def fail_registry_write(path, value):
            if Path(path) == self.flow.AUTOMATION_REGISTRY:
                raise OSError("simulated registry write failure")
            return original_write_json(path, value)

        self.flow.write_json_atomic = fail_registry_write
        try:
            with self.assertRaisesRegex(OSError, "simulated registry"):
                self.flow.invalidate_automation(["CASE-000001"], "重新探索")
        finally:
            self.flow.write_json_atomic = original_write_json
        self.assertTrue((self.flow.CANDIDATES_ROOT / "CASE-000001.json").exists())
        self.assertTrue((self.root / spec_file).exists())
        self.assertTrue(audit_path.exists())
        self.assertTrue(contract_path.exists())

    def test_exploration_failure_write_failure_restores_candidate_and_assets(self):
        _, spec_file, audit_path = self.register_candidate()
        contract_path = self.flow.CONTRACTS_ROOT / "CASE-000001.json"
        original_write_csv = self.flow.write_csv_atomic

        def fail_report_write(path, rows, headers):
            if Path(path) == self.flow.EXECUTION_REPORT:
                raise OSError("simulated exploration report failure")
            return original_write_csv(path, rows, headers)

        self.flow.write_csv_atomic = fail_report_write
        try:
            with self.assertRaisesRegex(OSError, "simulated exploration"):
                self.flow.record_exploration_failure(
                    "CASE-000001", "PRODUCT_DEFECT", "最终结果不符合预期",
                    "not-applicable", ["reports/evidence/RUN/error.txt"], "RUN",
                )
        finally:
            self.flow.write_csv_atomic = original_write_csv
        report, _ = self.flow.read_csv(self.flow.EXECUTION_REPORT)
        self.assertEqual(report[0]["执行结果"], "未执行")
        self.assertTrue((self.flow.CANDIDATES_ROOT / "CASE-000001.json").exists())
        self.assertTrue((self.root / spec_file).exists())
        self.assertTrue(audit_path.exists())
        self.assertTrue(contract_path.exists())

    def test_reset_state_removes_all_script_audit_and_contract_assets(self):
        _, spec_file, audit_path = self.register_candidate()
        contract_path = self.flow.CONTRACTS_ROOT / "CASE-000001.json"
        with redirect_stdout(io.StringIO()):
            self.flow.reset_state()
        self.assertFalse((self.root / spec_file).exists())
        self.assertFalse(audit_path.exists())
        self.assertFalse(contract_path.exists())
        self.assertFalse(list(self.flow.CANDIDATES_ROOT.glob("*.json")))
        self.assertFalse(self.flow.load_automation()["cases"])

    def test_merge_write_failure_restores_candidate_and_all_assets(self):
        title, spec_file, audit_path = self.register_candidate()
        contract_path = self.flow.CONTRACTS_ROOT / "CASE-000001.json"
        plan = self.promotion_plan()
        original_write_csv = self.flow.write_csv_atomic

        def fail_report_write(path, rows, headers):
            if Path(path) == self.flow.EXECUTION_REPORT:
                raise OSError("simulated report write failure")
            return original_write_csv(path, rows, headers)

        self.flow.write_csv_atomic = fail_report_write
        try:
            with self.assertRaisesRegex(OSError, "simulated report"):
                self.report.merge_results(plan, [self.result(title)])
        finally:
            self.flow.write_csv_atomic = original_write_csv

        report, _ = self.flow.read_csv(self.flow.EXECUTION_REPORT)
        self.assertEqual(report[0]["执行结果"], "未执行")
        self.assertFalse(self.flow.load_automation()["cases"])
        self.assertTrue((self.flow.CANDIDATES_ROOT / "CASE-000001.json").exists())
        self.assertTrue((self.root / spec_file).exists())
        self.assertTrue(audit_path.exists())
        self.assertTrue(contract_path.exists())

    def test_evidence_archive_failure_leaves_state_and_assets_unchanged(self):
        title, spec_file, audit_path = self.register_candidate()
        contract_path = self.flow.CONTRACTS_ROOT / "CASE-000001.json"
        plan = self.promotion_plan()
        first = self.root / "first.txt"
        second = self.root / "second.txt"
        first.write_text("first", encoding="utf-8")
        second.write_text("second", encoding="utf-8")
        result = self.result(title, "failed", "PRODUCT_DEFECT")
        result["attachments"] = [
            {"name": "first", "path": str(first), "body": ""},
            {"name": "second", "path": str(second), "body": ""},
        ]
        original_copy = self.report.shutil.copy2
        copy_count = 0

        def fail_second_copy(source, destination):
            nonlocal copy_count
            copy_count += 1
            if copy_count == 2:
                raise OSError("simulated evidence copy failure")
            return original_copy(source, destination)

        self.report.shutil.copy2 = fail_second_copy
        try:
            with self.assertRaisesRegex(OSError, "simulated evidence"):
                self.report.merge_results(plan, [result])
        finally:
            self.report.shutil.copy2 = original_copy

        report, _ = self.flow.read_csv(self.flow.EXECUTION_REPORT)
        self.assertEqual(report[0]["执行结果"], "未执行")
        self.assertFalse(self.flow.load_automation()["cases"])
        self.assertTrue((self.flow.CANDIDATES_ROOT / "CASE-000001.json").exists())
        self.assertTrue((self.root / spec_file).exists())
        self.assertTrue(audit_path.exists())
        self.assertTrue(contract_path.exists())
        evidence_files = list(self.report.EVIDENCE_ROOT.rglob("*")) \
            if self.report.EVIDENCE_ROOT.exists() else []
        self.assertFalse([path for path in evidence_files if path.is_file()])

    def test_validate_state_accepts_valid_candidate_assets(self):
        self.register_candidate()
        with redirect_stdout(io.StringIO()):
            self.flow.validate_state()

    def test_validate_state_does_not_rewrite_execution_report(self):
        before = self.flow.EXECUTION_REPORT.read_bytes()
        original_write_csv = self.flow.write_csv_atomic

        def reject_write(*_args, **_kwargs):
            raise AssertionError("validate-state must be read-only")

        self.flow.write_csv_atomic = reject_write
        try:
            with redirect_stdout(io.StringIO()):
                self.flow.validate_state()
        finally:
            self.flow.write_csv_atomic = original_write_csv
        self.assertEqual(self.flow.EXECUTION_REPORT.read_bytes(), before)

    def test_validate_state_reports_full_ready_from_actual_active_state(self):
        title, _, _ = self.register_candidate()
        plan = self.promotion_plan()
        with redirect_stdout(io.StringIO()):
            self.report.merge_results(plan, [self.result(title)])
        output = io.StringIO()
        with redirect_stdout(output):
            self.flow.validate_state(require_all_automated=True)
        self.assertIn('"完整回归就绪": true', output.getvalue())

    def test_missing_planned_result_is_rejected(self):
        self.register_candidate()
        plan = self.promotion_plan()
        with self.assertRaisesRegex(SystemExit, "缺少结果"):
            self.report.merge_results(plan, [])

    def test_script_change_blocks_promotion_plan(self):
        _, spec_file, _ = self.register_candidate()
        (self.root / spec_file).write_text("changed after audit", encoding="utf-8")
        with self.assertRaisesRegex(SystemExit, "候选脚本不存在或已变化"):
            self.promotion_plan()

    def test_full_validation_rejects_unexecuted_cases(self):
        with self.assertRaisesRegex(SystemExit, "尚未达到完整回归条件"):
            with redirect_stdout(io.StringIO()):
                self.flow.validate_state(require_all_automated=True)


if __name__ == "__main__":
    unittest.main()
