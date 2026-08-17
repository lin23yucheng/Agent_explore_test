import csv
import importlib.util
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]


def load_generator():
    spec = importlib.util.spec_from_file_location(
        "freemind_generator_under_test", REPO_ROOT / "freemind_to_cases_AI.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class FreeMindGenerationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.generator = load_generator()

    def test_duplicate_titles_are_minimally_adjusted_within_module(self):
        self.assertNotIn("迭代版本", self.generator.EXPORT_FIELDS)
        with tempfile.TemporaryDirectory() as root:
            output = Path(root) / "cases.csv"
            rows = []
            for module in ["用户管理", "用户管理", "角色管理"]:
                row = dict(self.generator.cases_format)
                row["所属模块"] = module
                row["用例标题"] = "新增名称必填校验"
                row["步骤"] = "1. 提交空名称"
                row["预期"] = "1. 提交被阻止"
                rows.append(row)
            with output.open("w", newline="", encoding="utf-8-sig") as handle:
                writer = csv.DictWriter(handle, fieldnames=self.generator.EXPORT_FIELDS)
                writer.writeheader()
                writer.writerows(rows)

            adjusted = self.generator.ensure_unique_case_titles(output)

            with output.open("r", newline="", encoding="utf-8-sig") as handle:
                generated = list(csv.DictReader(handle))
            self.assertEqual(adjusted, 1)
            self.assertEqual(generated[0]["用例标题"], "新增名称必填校验")
            self.assertEqual(generated[1]["用例标题"], "新增名称必填校验（场景2）")
            self.assertEqual(generated[2]["用例标题"], "新增名称必填校验")


if __name__ == "__main__":
    unittest.main()
