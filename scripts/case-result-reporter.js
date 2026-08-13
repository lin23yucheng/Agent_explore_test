const fs = require('fs');
const path = require('path');

class CaseResultReporter {
  constructor(options) {
    this.outputFile = options.outputFile;
    this.results = [];
    const now = new Date();
    this.executedAt = now.toISOString();
    this.runId = process.env.TEST_RUN_ID || now.toISOString().replace(/[:.]/g, '-');
    this.allowedCaseIds = new Set(
      (process.env.ALLOWED_CASE_IDS || '').split(',').map((value) => value.trim()).filter(Boolean),
    );
    this.expectedBindings = parseBindings(process.env.EXPECTED_CASE_BINDINGS);
  }

  onBegin(_config, suite) {
    const invalid = suite.allTests().filter((test) => {
      const caseIds = test.annotations
        .filter((annotation) => annotation.type === 'case' && annotation.description);
      return caseIds.length !== 1;
    });
    if (invalid.length > 0 && process.env.FORMAL_UI_RUN === 'true') {
      const titles = invalid.slice(0, 10).map((test) => test.titlePath().filter(Boolean).join(' › '));
      throw new Error(`正式测试必须且只能关联一个CASE-ID，发现${invalid.length}个不合规测试：${titles.join('；')}`);
    }
    const sharedDerived = suite.allTests().filter((test) => test.annotations.some(
      (annotation) => annotation.type === 'implementation'
        && annotation.description === 'shared-derived'
    ));
    if (sharedDerived.length > 0 && process.env.FORMAL_UI_RUN === 'true') {
      const titles = sharedDerived.slice(0, 10)
        .map((test) => test.titlePath().filter(Boolean).join(' › '));
      throw new Error(`发现${sharedDerived.length}个由聚合脚本机械拆分、尚未逐用例实现的测试，禁止生成正式结果：${titles.join('；')}`);
    }
    if (this.allowedCaseIds.size > 0 && process.env.FORMAL_UI_RUN === 'true') {
      const outsidePlan = suite.allTests().filter((test) => {
        const caseId = test.annotations.find(
          (annotation) => annotation.type === 'case' && annotation.description,
        )?.description;
        return !caseId || !this.allowedCaseIds.has(caseId);
      });
      if (outsidePlan.length > 0) {
        const titles = outsidePlan.slice(0, 10)
          .map((test) => test.titlePath().filter(Boolean).join(' › '));
        throw new Error(`正式批次包含运行计划外测试：${titles.join('；')}`);
      }
    }
  }

  onTestEnd(test, result) {
    const errorMessage = result.error?.message || '';
    const categoryAnnotation = test.annotations.find(
      (annotation) => annotation.type === 'failure-category' && annotation.description,
    );
    const cleanupAnnotation = test.annotations.find(
      (annotation) => annotation.type === 'cleanup' && annotation.description,
    );
    const cleanupStatus = cleanupAnnotation?.description || readCleanupStatus(result.attachments);
    const failureCategory = cleanupStatus === 'failed'
      ? 'CLEANUP_FAILED'
      : categoryAnnotation?.description || classifyFailure(errorMessage);
    this.results.push({
      title: test.titlePath().filter(Boolean).slice(1).join(' › '),
      caseIds: test.annotations
        .filter((annotation) => annotation.type === 'case')
        .map((annotation) => annotation.description)
        .filter(Boolean),
      status: result.status,
      failureCategory: result.status === 'passed'
        ? ''
        : failureCategory,
      cleanupStatus,
      durationMs: result.duration,
      executedAt: this.executedAt,
      runId: this.runId,
      error: errorMessage,
      attachments: result.attachments.map((attachment) => ({
        name: attachment.name,
        path: attachment.path || '',
        body: attachment.body ? attachment.body.toString('utf8') : ''
      }))
    });
  }

  onEnd() {
    fs.mkdirSync(path.dirname(this.outputFile), { recursive: true });
    fs.writeFileSync(this.outputFile, JSON.stringify(this.results, null, 2), 'utf8');
    if (this.allowedCaseIds.size > 0) {
      const seen = new Set(this.results.flatMap((result) => result.caseIds));
      const missing = [...this.allowedCaseIds].filter((caseId) => !seen.has(caseId));
      const unexpected = [...seen].filter((caseId) => !this.allowedCaseIds.has(caseId));
      if (missing.length > 0 || unexpected.length > 0) {
        throw new Error(
          `运行计划结果不完整：未执行=${missing.join(',') || '无'}；计划外=${unexpected.join(',') || '无'}`,
        );
      }
      const bindingErrors = this.results.flatMap((result) => result.caseIds.map((caseId) => {
        const expected = this.expectedBindings.get(caseId);
        if (!expected) return `${caseId}缺少预期绑定`;
        if (expected.testTitle !== result.title) {
          return `${caseId}实际测试标题与运行计划不一致`;
        }
        return '';
      })).filter(Boolean);
      if (bindingErrors.length > 0) {
        throw new Error(`运行计划绑定校验失败：${bindingErrors.join('；')}`);
      }
    }
  }
}

function parseBindings(value) {
  if (!value) return new Map();
  try {
    const bindings = JSON.parse(value);
    return new Map(bindings.map((binding) => [binding.caseId, binding]));
  } catch (_error) {
    throw new Error('EXPECTED_CASE_BINDINGS不是有效JSON');
  }
}

function readCleanupStatus(attachments) {
  const attachment = attachments.find((item) => item.name === 'cleanup-status.json');
  if (!attachment?.body) return 'not_reported';
  try {
    return JSON.parse(attachment.body.toString('utf8')).status || 'not_reported';
  } catch (_error) {
    return 'not_reported';
  }
}

function classifyFailure(message) {
  if (!message) return 'UNKNOWN';
  if (/element\(s\) not found|locator\(.+\).*toBeVisible|等待.*元素|找不到.*元素/i.test(message)) {
    return 'TEST_IMPLEMENTATION_DEFECT';
  }
  if (/当前.*(?:页面|弹窗).*(?:没有|缺少).*(?:控件|字段)|无法建立.*前置数据/i.test(message)) {
    return 'DATA_PRECONDITION_MISSING';
  }
  if (/Expected:|Received:|expect\(.+\) failed/i.test(message) && !/ENOTFOUND|ECONNREFUSED/i.test(message)) {
    return 'TEST_IMPLEMENTATION_DEFECT';
  }
  if (/需求冲突|需求与用例|需求矛盾/.test(message)) return 'REQUIREMENT_CONFLICT';
  if (/描述不明确|无法判断预期|用例歧义/.test(message)) return 'CASE_DESCRIPTION_AMBIGUOUS';
  if (/清理失败|未清理|孤儿数据/.test(message)) return 'CLEANUP_FAILED';
  if (/造数据失败|准备数据失败|创建测试数据失败/.test(message)) return 'DATA_SETUP_FAILED';
  if (/前置条件|不存在|无可用|造数据|创建.*失败|没有.*数据/.test(message)) {
    return 'DATA_PRECONDITION_MISSING';
  }
  if (/ENOTFOUND|ECONNREFUSED|超时|timeout|登录|连接|证书|browser/i.test(message)) {
    return 'ENVIRONMENT_BLOCKED';
  }
  if (/产品缺陷|不符合预期|实际.*生效|业务结果/.test(message)) {
    return 'PRODUCT_DEFECT';
  }
  if (/用例|CASE-ID|断言|未覆盖|空跑|测试脚本/.test(message)) {
    return 'TEST_IMPLEMENTATION_DEFECT';
  }
  return 'UNKNOWN';
}

module.exports = CaseResultReporter;
