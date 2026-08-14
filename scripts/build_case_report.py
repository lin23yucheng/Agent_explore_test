import argparse
import csv
import hashlib
import json
import re
import shutil
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'cases' / 'current.csv'
BATCH_RESULTS = ROOT / 'reports' / 'latest' / 'playwright-results.json'
MAPPINGS = Path(__file__).with_name('case-mappings.json')
HISTORY = ROOT / 'reports' / 'history' / 'case-results.json'
OUTPUT = ROOT / 'reports' / 'execution_report.csv'
SUMMARY = ROOT / 'reports' / 'execution_summary.json'
EVIDENCE_ROOT = ROOT / 'reports' / 'latest' / 'test-results'
EVIDENCE_ARCHIVE_ROOT = ROOT / 'reports' / 'history' / 'evidence'
VALID_CLEANUP_STATUSES = {'passed', 'failed', 'not-applicable', 'retained-by-design'}
VALID_FAILURE_CATEGORIES = {
    'DATA_PRECONDITION_MISSING', 'DATA_SETUP_FAILED', 'ENVIRONMENT_BLOCKED',
    'PRODUCT_DEFECT', 'TEST_IMPLEMENTATION_DEFECT', 'CASE_DESCRIPTION_AMBIGUOUS',
    'REQUIREMENT_CONFLICT', 'CLEANUP_FAILED',
}
EVIDENCE_RETENTION_BATCHES = 1
AUTOMATION_REGISTRY = ROOT / 'cases' / 'automation-registry.json'
CASE_REGISTRY = ROOT / 'cases' / 'case-registry.json'
RUN_PLAN = None

RESULT_HEADERS = [
    '自动化状态', '执行结果', '失败分类', '清理状态',
    'Playwright测试', '执行时间', 'AI自愈', '失败原因', '证据路径',
]
ANSI_ESCAPE = re.compile(r'\x1b\[[0-?]*[ -/]*[@-~]')


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
    return datetime.now().astimezone().isoformat(timespec='seconds')


def safe_name(value, limit=100):
    value = re.sub(r'[<>:"/\\|?*\x00-\x1f]', '_', value).strip(' .')
    return (value or 'unnamed')[:limit]


def case_fingerprint(row, source_headers):
    payload = {header: row.get(header, '') for header in source_headers}
    encoded = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode('utf-8')
    return hashlib.sha256(encoded).hexdigest()


def file_hash(path):
    path = Path(path)
    return hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else ''


def case_key(row):
    return row.get('用例ID') or f"{row.get('所属模块', '')}\x1f{row.get('用例标题', '')}"


def read_csv(path):
    with path.open('r', encoding='utf-8-sig', newline='') as handle:
        reader = csv.DictReader(handle)
        return list(reader), reader.fieldnames or []


def write_csv(path, rows, headers):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('w', encoding='utf-8-sig', newline='') as handle:
        writer = csv.DictWriter(handle, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)


def load_history():
    if not HISTORY.exists():
        return {'version': 1, 'updatedAt': '', 'cases': {}}
    with HISTORY.open('r', encoding='utf-8') as handle:
        data = json.load(handle)
    data.setdefault('cases', {})
    return data


def save_history(history):
    HISTORY.parent.mkdir(parents=True, exist_ok=True)
    history['updatedAt'] = now_iso()
    HISTORY.write_text(json.dumps(history, ensure_ascii=False, indent=2), encoding='utf-8')


def resolve_evidence(path_value):
    path = Path(path_value)
    return path if path.is_absolute() else ROOT / path


def archive_paths(paths, run_id, test_title, cache):
    """Copy durable evidence out of reports/latest and return repository-relative paths."""
    archived = []
    archive_root = EVIDENCE_ARCHIVE_ROOT.resolve()
    for index, path_value in enumerate(paths, start=1):
        if not path_value:
            continue
        source = resolve_evidence(path_value)
        if not source.exists():
            continue
        source_key = str(source.resolve()).lower()
        if source_key in cache:
            archived.append(cache[source_key])
            continue
        resolved = source.resolve()
        try:
            resolved.relative_to(archive_root)
            destination = resolved
        except ValueError:
            destination_dir = (
                EVIDENCE_ARCHIVE_ROOT / safe_name(run_id) / safe_name(test_title)
            )
            destination_dir.mkdir(parents=True, exist_ok=True)
            destination = destination_dir / f'{index:02d}-{safe_name(source.name, 120)}'
            if source.is_dir():
                shutil.copytree(source, destination, dirs_exist_ok=True)
            else:
                shutil.copy2(source, destination)
        relative = destination.resolve().relative_to(ROOT.resolve()).as_posix()
        cache[source_key] = relative
        archived.append(relative)
    return archived


def bootstrap_existing_report(history, source_headers):
    if history['cases'] or not OUTPUT.exists():
        return 0
    old_rows, _ = read_csv(OUTPUT)
    cache = {}
    migrated = 0
    for row in old_rows:
        if row.get('自动化状态') != '已自动化':
            continue
        case_title = row.get('用例标题', '')
        if not case_title:
            continue
        execution_time = row.get('执行时间') or 'legacy'
        run_id = f'legacy-{execution_time.replace(":", "-")}'
        evidence = archive_paths(row.get('证据路径', '').split('; '), run_id,
                                 row.get('Playwright测试') or case_title, cache)
        history['cases'][case_key(row)] = {
            'fingerprint': case_fingerprint(row, source_headers),
            'status': 'passed' if row.get('执行结果') == '通过' else 'failed',
            'trusted': False,
            'testTitle': row.get('Playwright测试', ''),
            'executedAt': execution_time,
            'healing': row.get('AI自愈', ''),
            'error': row.get('失败原因', ''),
            'evidence': evidence,
        }
        migrated += 1
    save_history(history)
    return migrated


def build_case_to_test(source_rows, mappings, batch_results, automation=None):
    case_to_test = {}
    for test_title, case_titles in mappings.items():
        for case_title in case_titles:
            if case_title in case_to_test:
                raise SystemExit(f'用例标题被重复映射: {case_title}')
            case_to_test[case_title] = test_title

    for test_title, entry in (automation or {}).get('tests', {}).items():
        if entry.get('status') not in {'active', 'stale'}:
            continue
        for case_id in entry.get('caseIds', []):
            case_to_test[case_id] = test_title

    source_titles = {row['用例标题'] for row in source_rows}
    for test_title, result in batch_results.items():
        for case_id in result.get('caseIds', []):
            case_to_test[case_id] = test_title
        direct_title = test_title.rsplit(' › ', 1)[-1]
        if direct_title in source_titles and direct_title not in case_to_test:
            case_to_test[direct_title] = test_title
    return case_to_test


def archive_batch_results(batch_results, execution_time):
    cache = {}
    archived = {}
    run_id = next((item.get('runId') for item in batch_results.values() if item.get('runId')), None)
    run_id = run_id or execution_time.replace(':', '-')
    for test_title, result in batch_results.items():
        paths = [item.get('path', '') for item in result.get('attachments', [])]
        result = dict(result)
        result['evidence'] = archive_paths(paths, run_id, test_title, cache)
        result['executedAt'] = result.get('executedAt') or execution_time
        archived[test_title] = result
    return archived


def cleanup_evidence(history, keep_recent_batches=EVIDENCE_RETENTION_BATCHES):
    """Archive current attachments and remove only references to missing files."""
    removed_paths = 0
    archived_paths = 0
    cache = {}
    for entry in history.get('cases', {}).values():
        existing = []
        for path_value in entry.get('evidence', []):
            source = resolve_evidence(path_value)
            if not source.exists():
                removed_paths += 1
                continue
            try:
                source.resolve().relative_to(EVIDENCE_ARCHIVE_ROOT.resolve())
                already_archived = True
            except ValueError:
                already_archived = False
            preserved = archive_paths(
                [path_value],
                entry.get('runId') or entry.get('executedAt') or 'legacy',
                entry.get('testTitle') or 'unknown-test',
                cache,
            )
            existing.extend(preserved)
            archived_paths += int(bool(preserved) and not already_archived)
        entry['evidence'] = existing
    return {'保留批次数': keep_recent_batches, '删除批次数': 0,
            '归档证据路径数': archived_paths, '清理失效路径数': removed_paths}


def merge_batch(history, source_rows, source_headers, mappings, automation=None,
                run_plan=None, case_registry=None):
    if not BATCH_RESULTS.exists():
        raise SystemExit(f'未找到本批 Playwright 结果: {BATCH_RESULTS}')
    with BATCH_RESULTS.open('r', encoding='utf-8') as handle:
        raw_results = json.load(handle)
    validate_batch_results(raw_results, automation or {}, run_plan, case_registry or {})
    batch_results = {item['title']: item for item in raw_results}
    execution_time = now_iso()
    batch_results = archive_batch_results(batch_results, execution_time)
    for test_title, result in batch_results.items():
        entry = (automation or {}).get('tests', {}).get(test_title)
        if entry is not None and result.get('status') != 'skipped':
            entry['lastRun'] = {
                'status': result.get('status', ''),
                'executedAt': result.get('executedAt', execution_time),
            }
    case_to_test = build_case_to_test(source_rows, mappings, batch_results, automation)
    planned_bindings = {
        item.get('caseId'): item for item in (run_plan or {}).get('bindings', [])
    }
    updated_case_ids = []
    for source_row in source_rows:
        case_title = source_row['用例标题']
        test_title = case_to_test.get(source_row.get('用例ID')) or case_to_test.get(case_title)
        result = batch_results.get(test_title)
        if not result or result.get('status') == 'skipped':
            continue
        history['cases'][case_key(source_row)] = {
            'fingerprint': case_fingerprint(source_row, source_headers),
            'status': 'passed' if result.get('status') == 'passed' else 'failed',
            'trusted': True,
            'testTitle': test_title,
            'caseRevision': planned_bindings.get(source_row.get('用例ID'), {}).get(
                'caseRevision', source_row.get('用例Revision', '')),
            'contractHash': planned_bindings.get(source_row.get('用例ID'), {}).get(
                'contractHash', source_row.get('执行契约哈希', '')),
            'implementationHash': planned_bindings.get(source_row.get('用例ID'), {}).get(
                'implementationHash', ''),
            'executedAt': result.get('executedAt', execution_time),
            'runId': result.get('runId', ''),
            'healing': '; '.join(item.get('body', '') for item in result.get('attachments', [])
                                if item.get('name') == 'ai-healing.json' and item.get('body')),
            'failureCategory': result.get('failureCategory', ''),
            'cleanupStatus': result.get('cleanupStatus', 'unknown'),
            'error': result.get('error', ''),
            'evidence': result.get('evidence', []),
        }
        updated_case_ids.append(source_row.get('用例ID') or case_title)
    save_history(history)
    return set(updated_case_ids)


def validate_batch_results(raw_results, automation, run_plan=None, case_registry=None):
    """拒绝任何无法证明为独立、已登记用例的Playwright结果。"""
    seen_case_ids = set()
    invalid = []
    tests = automation.get('tests', {})
    planned_id_values = (run_plan or {}).get('caseIds', [])
    planned_ids = set(planned_id_values)
    if len(planned_id_values) != len(planned_ids):
        raise SystemExit('拒绝合并运行计划：caseIds包含重复CASE-ID')
    binding_values = (run_plan or {}).get('bindings', [])
    binding_ids = [item.get('caseId') for item in binding_values]
    if len(binding_ids) != len(set(binding_ids)):
        raise SystemExit('拒绝合并运行计划：bindings包含重复CASE-ID')
    planned_bindings = {
        item.get('caseId'): item for item in binding_values
    }
    for result in raw_results:
        title = result.get('title', '')
        case_ids = list(dict.fromkeys(result.get('caseIds', [])))
        entry = tests.get(title)
        reason = ''
        if len(case_ids) != 1:
            reason = f'结果关联{len(case_ids)}个CASE-ID'
        elif result.get('status') == 'skipped':
            reason = '计划内用例被跳过，不能视为已执行'
        elif result.get('cleanupStatus') not in VALID_CLEANUP_STATUSES:
            reason = f"清理状态非法或未报告: {result.get('cleanupStatus') or '<空>'}"
        elif (result.get('cleanupStatus') == 'passed'
              and not result.get('cleanupReportedDynamically')):
            reason = '清理成功仅为静态声明，缺少本次运行时附件'
        elif result.get('cleanupStatus') == 'failed' and result.get('failureCategory') != 'CLEANUP_FAILED':
            reason = '清理失败结果必须分类为CLEANUP_FAILED'
        elif result.get('status') != 'passed' and result.get('failureCategory') not in VALID_FAILURE_CATEGORIES:
            reason = f"失败分类未归因或非法: {result.get('failureCategory') or '<空>'}"
        elif entry is None:
            reason = '自动化注册表中不存在同标题测试'
        elif entry.get('status') == 'retired':
            reason = '自动化映射已退役'
        elif entry.get('status') == 'stale':
            reason = '自动化映射已失效，必须修正脚本并重新登记后才能回写结果'
        elif entry.get('caseIds', []) != case_ids:
            reason = '结果CASE-ID与自动化注册表不一致'
        elif entry.get('source') in {
                '聚合脚本机械拆分，等待逐用例实现',
                '测试关联多个用例ID，等待逐用例实现'}:
            reason = '测试尚未按用例步骤独立实现'
        elif case_ids[0] in seen_case_ids:
            reason = '同一批次中CASE-ID被多个结果重复回写'
        elif planned_ids and case_ids[0] not in planned_ids:
            reason = '结果CASE-ID不在本批运行计划中'
        elif planned_ids:
            binding = planned_bindings.get(case_ids[0], {})
            case = (case_registry or {}).get('cases', {}).get(case_ids[0], {})
            if case.get('status') != 'active':
                reason = '运行时用例已不是有效状态'
            elif binding.get('testTitle') != title:
                reason = '测试标题与运行计划绑定不一致'
            elif binding.get('file') != entry.get('file'):
                reason = '脚本文件与自动化注册表绑定不一致'
            elif int(binding.get('caseRevision', 0)) != int(case.get('revision', 0)):
                reason = '用例revision在计划生成后发生变化'
            elif binding.get('contractHash') != case.get('contractHash'):
                reason = '执行契约在计划生成后发生变化'
            elif binding.get('implementationHash') != file_hash(ROOT / binding.get('file', '')):
                reason = '脚本在计划生成后发生变化'
            elif binding.get('implementationHash') != entry.get('implementationHash'):
                reason = '脚本哈希与自动化注册表绑定不一致'
            elif binding.get('auditHash') != entry.get('auditHash'):
                reason = '覆盖审计哈希与自动化注册表绑定不一致'
            elif binding.get('auditHash') != file_hash(ROOT / entry.get('auditFile', '')):
                reason = '覆盖审计在计划生成后发生变化'
        if reason:
            invalid.append(f'{title or "<无标题>"}：{reason}')
        else:
            seen_case_ids.add(case_ids[0])
    if invalid:
        raise SystemExit('拒绝合并不可信Playwright结果：' + '；'.join(invalid[:10]))
    if planned_ids:
        missing = sorted(planned_ids - seen_case_ids)
        if missing:
            raise SystemExit('拒绝合并不完整批次，以下计划用例没有结果：' + ', '.join(missing))


def sync_case_registry(history, registry_path, automation=None):
    if not registry_path.exists():
        return 0
    with registry_path.open('r', encoding='utf-8') as handle:
        registry = json.load(handle)
    updated = 0
    automation = automation or {}
    for case_id, case in registry.get('cases', {}).items():
        result = history.get('cases', {}).get(case_id)
        if result is not None and result.get('trusted', True):
            case['lastResult'] = result
            updated += 1
            continue
        stale_titles = [
            title for title in automation.get('cases', {}).get(case_id, [])
            if automation.get('tests', {}).get(title, {}).get('status') == 'stale'
        ]
        if stale_titles:
            case['lastResult'] = {
                'status': 'needs_rerun',
                'testTitle': stale_titles[0],
                'executedAt': '',
                'healing': '',
                'error': '聚合脚本尚未按本用例步骤独立实现，旧执行结果不可信',
                'evidence': [],
            }
            updated += 1
    registry['updatedAt'] = now_iso()
    registry_path.write_text(json.dumps(registry, ensure_ascii=False, indent=2), encoding='utf-8')
    return updated


def result_fields(entry):
    passed = entry['status'] == 'passed'
    cleanup_status = entry.get('cleanupStatus', 'unknown')
    failure_category = ('CLEANUP_FAILED' if cleanup_status == 'failed'
                        else entry.get('failureCategory', ''))
    error = entry.get('error', '')
    if cleanup_status == 'failed' and not error:
        error = '测试数据清理失败；历史结果未记录具体清理错误。'
    return {
        '自动化状态': '已自动化',
        '执行结果': '通过' if passed else '未通过',
        '失败分类': failure_category,
        '清理状态': cleanup_status,
        'Playwright测试': entry.get('testTitle', ''),
        '执行时间': entry.get('executedAt', ''),
        'AI自愈': entry.get('healing', ''),
        '失败原因': humanize_failure(error, failure_category),
        '证据路径': '; '.join(entry.get('evidence', [])),
    }


def humanize_failure(error, category=''):
    """将Playwright堆栈压缩为可读的业务诊断，原文仍保存在历史JSON和证据中。"""
    text = ANSI_ESCAPE.sub('', error or '').strip()
    if not text:
        return ''
    expected = re.search(
        r'Expected(?: pattern)?:\s*([\s\S]*?)(?:\nReceived(?: string)?:|\n|$)', text)
    received = re.search(r'Received(?: string)?:\s*([\s\S]*?)(?:\n|$)', text)
    if category == 'PRODUCT_DEFECT' and expected and received:
        return (f'产品实际行为不符合用例预期：预期为「{expected.group(1).strip()}」，'
                f'实际为「{received.group(1).strip()}」。')
    if 'element(s) not found' in text or 'Locator:' in text:
        locator = ''
        match = re.search(r'Locator:\s*(.+?)(?:\n|$)', text)
        if match:
            locator = match.group(1).strip()
        detail = f' 目标定位器：{locator}' if locator else ''
        return ('页面未找到脚本要验证的目标元素，可能是测试数据未生成、查询未刷新，或定位条件与当前页面不一致。'
                f'{detail}')
    if 'Test timeout' in text or 'Timeout' in text:
        return '测试在规定时间内未完成，需检查页面加载、网络/登录状态以及测试步骤是否等待了错误的页面状态。'
    if expected and received:
        return f'页面实际值与测试预期不一致：预期为「{expected.group(1).strip()}」，实际为「{received.group(1).strip()}」。请先核对用例规则和控件最终值。'
    if category == 'DATA_PRECONDITION_MISSING' or '前置数据' in text or '缺少用户指派控件' in text:
        return f'测试前置条件未满足：{text.split("Error:", 1)[-1].strip()}'
    return text.replace('Error:', '').strip()[:1000]


def active_test_for_case(automation, case_id, case_registry=None):
    titles = automation.get('cases', {}).get(case_id, [])
    active = [title for title in titles
              if automation.get('tests', {}).get(title, {}).get('status') == 'active']
    if case_registry is not None:
        case = case_registry.get('cases', {}).get(case_id, {})
        active = [title for title in active
                  if automation_binding_valid(automation['tests'][title], case)]
    return active[0] if len(active) == 1 else ''


def automation_binding_valid(entry, case):
    spec_file = entry.get('file', '')
    return bool(
        case
        and case.get('status') == 'active'
        and int(entry.get('caseRevision', 0)) == int(case.get('revision', 0))
        and entry.get('contractHash') == case.get('contractHash')
        and entry.get('implementationHash') == file_hash(ROOT / spec_file)
        and entry.get('auditFile')
        and (ROOT / entry['auditFile']).is_file()
        and entry.get('auditHash') == file_hash(ROOT / entry['auditFile'])
    )


def stale_automation_reason(automation, case_id):
    for title in automation.get('cases', {}).get(case_id, []):
        entry = automation.get('tests', {}).get(title, {})
        if entry.get('status') == 'stale':
            source = entry.get('source', '')
            if source:
                return source
        if entry.get('status') == 'active':
            return '自动化绑定、脚本哈希或覆盖审计已变化，需重新登记并执行。'
    return '自动化映射已失效，当前脚本不可直接复用，需修正并重新执行。'


def render_reports(history, source_rows, source_headers, batch_case_ids, automation=None,
                   case_registry=None):
    cumulative_rows = []
    batch_rows = []
    passed = failed = stale = 0
    for index, source_row in enumerate(source_rows, start=1):
        title = source_row['用例标题']
        base = {**source_row}
        base['用例ID'] = source_row.get('用例ID') or f'TC-{index:04d}'
        # 第一版历史数据只使用标题作为键。优先使用包含模块的键，避免不同模块下
        # 的同名用例互相覆盖，同时兼容已有历史数据。
        entry = history['cases'].get(case_key(source_row)) or history['cases'].get(title)
        case_id = base['用例ID']
        titles = (automation or {}).get('cases', {}).get(case_id, [])
        expected_test = active_test_for_case(
            automation or {}, case_id, case_registry if automation else None)
        if expected_test:
            automation_status = '已自动化'
        elif titles:
            automation_status = '需重新执行'
        else:
            automation_status = '未自动化'
        mapping_changed = expected_test and entry and entry.get('testTitle') != expected_test
        history_matches = bool(
            entry
            and entry.get('trusted', True)
            and entry.get('fingerprint') == case_fingerprint(source_row, source_headers)
        )
        trusted_history = bool(entry and entry.get('trusted', True))
        if trusted_history:
            fields = result_fields(entry)
            if not history_matches or mapping_changed:
                automation_status = '需重新执行'
            fields['自动化状态'] = automation_status
            if automation_status == '需重新执行' and not fields['失败原因']:
                if not history_matches:
                    fields['失败原因'] = '当前用例内容或执行契约已变化；保留最后执行结果，需按当前版本重新执行。'
                elif mapping_changed:
                    fields['失败原因'] = '当前可信脚本与最后执行脚本不同；保留最后执行结果，需重新执行。'
                else:
                    fields['失败原因'] = stale_automation_reason(
                        automation or {}, case_id)
            passed += fields['执行结果'] == '通过'
            failed += fields['执行结果'] == '未通过'
        else:
            fields = {'自动化状态': automation_status, '执行结果': '未执行',
                      'Playwright测试': expected_test or (titles[0] if len(titles) == 1 else ''),
                      '失败分类': '', '清理状态': 'unknown', '执行时间': '',
                      'AI自愈': '',
                      '失败原因': (stale_automation_reason(automation or {}, case_id)
                                   if automation_status == '需重新执行' else ''),
                      '证据路径': ''}
        stale += fields['自动化状态'] == '需重新执行'
        output_row = {**base, **fields}
        cumulative_rows.append(output_row)
        if (source_row.get('用例ID') or title) in batch_case_ids:
            batch_rows.append(output_row)

    headers = ['用例ID', *[header for header in source_headers if header != '用例ID'], *RESULT_HEADERS]
    write_csv(OUTPUT, cumulative_rows, headers)
    summary = {
        'source_case_count': len(source_rows),
        'executed_case_count': passed + failed,
        'passed_case_count': passed,
        'failed_case_count': failed,
        'needs_rerun_case_count': stale,
        'not_executed_case_count': len(source_rows) - passed - failed,
        'cleanup_failed_case_count': sum(
            row['清理状态'] == 'failed' for row in cumulative_rows),
        'cleanup_not_reported_case_count': sum(
            row['清理状态'] == 'not_reported' for row in cumulative_rows),
        'report': str(OUTPUT),
        'history': str(HISTORY),
    }
    SUMMARY.parent.mkdir(parents=True, exist_ok=True)
    SUMMARY.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')
    batch_summary = {
        'batch_case_count': len(batch_rows),
        'passed_case_count': sum(row['执行结果'] == '通过' for row in batch_rows),
        'failed_case_count': sum(row['执行结果'] == '未通过' for row in batch_rows),
        'cleanup_failed_case_count': sum(
            row['清理状态'] == 'failed' for row in batch_rows),
        'cleanup_not_reported_case_count': sum(
            row['清理状态'] == 'not_reported' for row in batch_rows),
    }
    return summary, batch_summary


def main():
    global SOURCE, OUTPUT, SUMMARY, HISTORY
    parser = ChineseArgumentParser(description='将Playwright批次结果合并到累计CSV测试报告。')
    parser.add_argument('--bootstrap-only', action='store_true',
                        help='仅迁移已有累计报告，不读取本次Playwright结果。')
    parser.add_argument('--refresh-only', action='store_true',
                        help='源CSV变化后只刷新累计报告，不读取本次执行结果。')
    parser.add_argument('--source', default=str(SOURCE), help='当前有效用例CSV。')
    parser.add_argument('--report-dir', help='CSV和JSON报告的输出目录。')
    parser.add_argument('--history', help='持久化测试执行历史JSON文件。')
    parser.add_argument('--automation-registry', default=str(AUTOMATION_REGISTRY),
                        help='稳定用例ID与Playwright测试的映射注册表。')
    parser.add_argument('--case-registry', default=str(CASE_REGISTRY),
                        help='需要回写最新执行结果的用例生命周期注册表。')
    parser.add_argument('--run-plan', help='本批精确CASE-ID运行计划。')
    parser.add_argument('--evidence-retention-batches', type=int,
                        default=EVIDENCE_RETENTION_BATCHES,
                        help='保留策略标识；当前批次附件统一保存在reports/latest。')
    args = parser.parse_args()

    SOURCE = Path(args.source).resolve()
    if args.report_dir:
        report_dir = Path(args.report_dir).resolve()
        report_dir.mkdir(parents=True, exist_ok=True)
        OUTPUT = report_dir / 'execution_report.csv'
        SUMMARY = report_dir / 'execution_summary.json'
    if args.history:
        HISTORY = Path(args.history).resolve()

    source_rows, source_headers = read_csv(SOURCE)
    # 新版自动化注册表已经保存稳定 CASE-ID 映射；旧版标题映射文件可能不存在。
    # 缺少旧文件时使用空映射，后续由 automation-registry.json 完成结果关联。
    if MAPPINGS.exists():
        with MAPPINGS.open('r', encoding='utf-8') as handle:
            mappings = json.load(handle)
    else:
        mappings = {}
    automation = {}
    automation_path = Path(args.automation_registry)
    if automation_path.exists():
        with automation_path.open('r', encoding='utf-8') as handle:
            automation = json.load(handle)
    case_registry_path = Path(args.case_registry)
    case_registry = {}
    if case_registry_path.exists():
        with case_registry_path.open('r', encoding='utf-8') as handle:
            case_registry = json.load(handle)
    run_plan = None
    if args.run_plan:
        with Path(args.run_plan).resolve().open('r', encoding='utf-8') as handle:
            run_plan = json.load(handle)
    if not args.bootstrap_only and not args.refresh_only and run_plan is None:
        raise SystemExit('正式结果合并必须提供 --run-plan，禁止绕过精确CASE-ID运行计划。')
    history = load_history()
    migrated = bootstrap_existing_report(history, source_headers)
    batch_titles = set()
    if not args.bootstrap_only and not args.refresh_only:
        batch_titles = merge_batch(history, source_rows, source_headers, mappings, automation,
                                   run_plan, case_registry)
        if automation_path.exists():
            automation['updatedAt'] = now_iso()
            automation_path.write_text(json.dumps(automation, ensure_ascii=False, indent=2), encoding='utf-8')
    cleanup_summary = cleanup_evidence(history, args.evidence_retention_batches)
    if (cleanup_summary['删除批次数'] or cleanup_summary['归档证据路径数']
            or cleanup_summary['清理失效路径数']):
        save_history(history)
    summary, batch_summary = render_reports(history, source_rows, source_headers, batch_titles,
                                            automation, case_registry)
    synced = sync_case_registry(history, case_registry_path, automation)
    summary_text = {
        '源用例数': summary['source_case_count'],
        '已执行用例数': summary['executed_case_count'],
        '通过用例数': summary['passed_case_count'],
        '失败用例数': summary['failed_case_count'],
        '需重新执行用例数': summary['needs_rerun_case_count'],
        '未执行用例数': summary['not_executed_case_count'],
        '清理失败用例数': summary['cleanup_failed_case_count'],
        '未报告清理状态用例数': summary['cleanup_not_reported_case_count'],
        '报告': summary['report'],
        '历史记录': summary['history'],
    }
    batch_text = {
        '本批用例数': batch_summary['batch_case_count'],
        '通过用例数': batch_summary['passed_case_count'],
        '失败用例数': batch_summary['failed_case_count'],
        '清理失败用例数': batch_summary['cleanup_failed_case_count'],
        '未报告清理状态用例数': batch_summary['cleanup_not_reported_case_count'],
        '报告': summary['report'],
    }
    print(json.dumps({'已迁移用例数': migrated, '已同步注册表用例数': synced,
                      '证据清理': cleanup_summary,
                      '累计结果': summary_text, '最新批次': batch_text},
                     ensure_ascii=False))


if __name__ == '__main__':
    main()
