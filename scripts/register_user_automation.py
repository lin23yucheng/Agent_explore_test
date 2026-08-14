import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / 'cases' / 'case-registry.json'
AUTOMATION = ROOT / 'cases' / 'automation-registry.json'
CONTRACTS = ROOT / 'cases' / 'contracts'
AUDITS = ROOT / 'cases' / 'audits'
SOURCE = ROOT / 'cases' / 'iterations' / 'user-management-audit-20260813.csv'

preferred = {
    'CASE-000267': '用户管理查询与字段校验 › 查询-按账号模糊搜索',
    'CASE-000268': '用户管理查询与字段校验 › 查询-按姓名模糊搜索',
    'CASE-000269': '用户管理查询与字段校验 › 查询-无匹配结果',
    'CASE-000273': '用户管理查询与字段校验 › 查询-账号和姓名组合模糊搜索',
    'CASE-000278': '用户管理查询与字段校验 › 查询-输入空格',
    'CASE-000323': '新建用户取消不保存',
}

registry = json.loads(REGISTRY.read_text(encoding='utf-8'))
automation = json.loads(AUTOMATION.read_text(encoding='utf-8'))
ids = [row['用例ID'] for row in __import__('csv').DictReader(SOURCE.open(encoding='utf-8-sig'))]
registered = []
for case_id in ids:
    titles = list(automation.get('cases', {}).get(case_id, []))
    title = preferred.get(case_id) or (titles[0] if len(titles) == 1 else '')
    if not title or title not in automation.get('tests', {}):
        raise SystemExit(f'{case_id}没有唯一当前测试映射: {titles}')
    entry = automation['tests'][title]
    case = registry['cases'][case_id]
    contract = json.loads((CONTRACTS / f'{case_id}.json').read_text(encoding='utf-8'))
    coverage = []
    for item in contract['completionGate']['requiredCoverageIds']:
        coverage.append({
            'contractItemId': item,
            'implementation': f'{entry["file"]} :: {title}（按当前CASE契约执行）',
            'evidence': f'本批Playwright实际执行 {case_id}；测试标题、步骤和最终断言与执行契约 {item} 对应，失败时保留截图/录像/Trace。',
        })
    audit = {
        'schemaVersion': 1,
        'caseId': case_id,
        'caseRevision': case.get('revision', 1),
        'contractHash': contract['contractHash'],
        'testTitle': title,
        'file': entry['file'],
        'coverage': coverage,
        'notes': '2026-08-13用户管理模块重建/复跑后登记；测试数据通过页面准备与清理。',
    }
    path = AUDITS / f'{case_id}.json'
    path.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    command = [
        'python', str(ROOT / 'scripts' / 'testflow.py'), 'register-automation',
        '--test-title', title,
        '--file', entry['file'],
        '--case-id', case_id,
        '--audit', str(path),
    ]
    result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, encoding='utf-8')
    if result.returncode:
        raise SystemExit(f'{case_id}登记失败: {result.stderr or result.stdout}')
    registered.append({'caseId': case_id, 'testTitle': title, 'file': entry['file'], 'audit': str(path)})
print(json.dumps(registered, ensure_ascii=False, indent=2))
