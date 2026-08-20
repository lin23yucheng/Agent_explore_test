import csv
import importlib.util
import tempfile
import unittest
import xml.etree.ElementTree as ET
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

    def test_module_paths_preserve_hyphenated_root_name(self):
        paths = [
            "VLA数据任务平台-V1.2 - 总览 - 工作台 - 任务总数",
            "VLA数据任务平台-V1.2 - 任务管理 - 创建任务 - 名称必填",
            "VLA数据任务平台-V1.2 - 数据转换 - 转换任务 - 执行转换",
        ]

        self.assertEqual(
            self.generator.build_module_paths(paths),
            ["工作台", "任务管理", "数据转换"],
        )
        self.assertEqual(self.generator.get_summary_module_key(paths[0]), "工作台")

    def test_summary_module_key_removes_configured_author_annotation(self):
        self.assertEqual(
            self.generator.get_summary_module_key(
                "VLA数据任务平台-V1.2 - 总览 - 工作台（封伟） - 任务概览Tab"
            ),
            "工作台",
        )

    def test_business_module_config_is_authoritative(self):
        self.assertEqual(
            self.generator.BUSINESS_MODULES,
            (
                "工作台", "任务管理", "数据采集", "数据标注", "人工质检",
                "数据转换", "数据可视化", "用户与权限", "基础配置",
            ),
        )
        self.assertEqual(
            self.generator.get_summary_module_key(
                "VLA数据任务平台-V1.2 - 其他 - 数据正确性 - 自动化验证"
            ),
            "其他",
        )
        self.assertEqual(self.generator.FALLBACK_BUSINESS_MODULE, "其他")

    def test_all_configured_modules_are_unique(self):
        self.assertEqual(
            len(self.generator.BUSINESS_MODULE_OPTIONS),
            len(set(self.generator.BUSINESS_MODULE_OPTIONS)),
        )

    def test_unmatched_leaf_uses_fallback_module(self):
        self.assertEqual(
            self.generator.get_summary_module_key(
                "VLA数据任务平台-V1.2 - 未配置分组 - 新功能 - 校验点"
            ),
            "其他",
        )

    def test_freemind_metadata_does_not_hide_leaf_topic(self):
        node = ET.fromstring('<node TEXT="测试点"><font BOLD="true"/></node>')
        parent = ET.fromstring('<node TEXT="父节点"><node TEXT="子节点"/></node>')

        self.assertTrue(self.generator.is_leaf_topic_node(node))
        self.assertFalse(self.generator.is_leaf_topic_node(parent))

    def test_case_title_parser_preserves_hyphenated_root_name(self):
        title, module_path = self.generator.parse_case_title(
            "VLA数据任务平台-V1.2 - 任务管理 - 创建任务 - 名称必填"
        )

        self.assertEqual(title, "任务管理 - 创建任务 - 名称必填")
        self.assertEqual(module_path, "/任务管理 - 创建任务/")


if __name__ == "__main__":
    unittest.main()
