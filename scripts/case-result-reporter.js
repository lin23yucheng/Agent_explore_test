const fs = require('fs');
const path = require('path');

const VALID_CLEANUP_STATUSES = new Set(['passed', 'failed', 'not-applicable', 'retained-by-design']);
const VALID_FAILURE_CATEGORIES = new Set([
  'DATA_PRECONDITION_MISSING',
  'DATA_SETUP_FAILED',
  'ENVIRONMENT_BLOCKED',
  'PRODUCT_DEFECT',
  'TEST_IMPLEMENTATION_DEFECT',
  'CASE_DESCRIPTION_AMBIGUOUS',
  'REQUIREMENT_CONFLICT',
  'CLEANUP_FAILED',
  'UNCLASSIFIED',
]);

class CaseResultReporter {
  constructor(options) {
    this.outputFile = options.outputFile;
    this.results = new Map();
    const now = new Date();
    this.executedAt = now.toISOString();
    this.runId = process.env.TEST_RUN_ID || now.toISOString().replace(/[:.]/g, '-');
    this.allowedCaseIds = new Set(
      (process.env.ALLOWED_CASE_IDS || '').split(',').map((value) => value.trim()).filter(Boolean),
    );
    this.expectedBindings = parseBindings(
      process.env.EXPECTED_CASE_BINDINGS,
      process.env.EXPECTED_CASE_BINDINGS_FILE,
    );
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
    const attachedCleanup = readCleanupStatus(result.attachments);
    const cleanupStatus = attachedCleanup.status || cleanupAnnotation?.description || 'not_reported';
    const failureCategory = cleanupStatus === 'failed'
      ? 'CLEANUP_FAILED'
      : categoryAnnotation?.description || classifyFailure(errorMessage);
    const title = test.titlePath().filter(Boolean).slice(1).join(' › ');
    const caseIds = test.annotations
      .filter((annotation) => annotation.type === 'case')
      .map((annotation) => annotation.description)
      .filter(Boolean);
    const payload = {
      title,
      caseIds,
      status: result.status,
      failureCategory: cleanupStatus === 'failed'
        ? 'CLEANUP_FAILED'
        : result.status === 'passed' ? '' : failureCategory,
      cleanupStatus,
      cleanupReportedDynamically: Boolean(attachedCleanup.status),
      durationMs: result.duration,
      executedAt: this.executedAt,
      runId: this.runId,
      error: cleanupStatus === 'failed'
        ? attachedCleanup.error || errorMessage || '测试数据清理失败，未提供具体错误。'
        : errorMessage,
      attachments: result.attachments.map((attachment) => ({
        name: attachment.name,
        path: attachment.path || '',
        body: attachment.body ? attachment.body.toString('utf8') : ''
      }))
    };
    const resultKey = test.id || `${title}\u0000${caseIds.join(',')}`;
    this.results.set(resultKey, payload);
  }

  onEnd() {
    const results = [...this.results.values()];
    fs.mkdirSync(path.dirname(this.outputFile), { recursive: true });
    fs.writeFileSync(this.outputFile, JSON.stringify(results, null, 2), 'utf8');
    if (process.env.FORMAL_UI_RUN === 'true') {
      const skipped = results.filter((result) => result.status === 'skipped');
      if (skipped.length > 0) {
        throw new Error(`正式批次存在${skipped.length}条跳过用例：${skipped.slice(0, 10).map((item) => item.title).join('；')}`);
      }
      const cleanupFailed = results.filter((result) => result.cleanupStatus === 'failed');
      if (cleanupFailed.length > 0) {
        throw new Error(`正式批次存在${cleanupFailed.length}条清理失败用例：${cleanupFailed.slice(0, 10).map((item) => item.title).join('；')}`);
      }
      const cleanupMissing = results.filter((result) => result.cleanupStatus === 'not_reported');
      if (cleanupMissing.length > 0) {
        throw new Error(`正式批次存在${cleanupMissing.length}条未报告清理状态的用例：${cleanupMissing.slice(0, 10).map((item) => item.title).join('；')}`);
      }
      const cleanupInvalid = results.filter(
        (result) => !VALID_CLEANUP_STATUSES.has(result.cleanupStatus),
      );
      if (cleanupInvalid.length > 0) {
        throw new Error(`正式批次存在${cleanupInvalid.length}条非法清理状态：${cleanupInvalid.slice(0, 10).map((item) => `${item.title}=${item.cleanupStatus || '<空>'}`).join('；')}`);
      }
      const cleanupUnverified = results.filter(
        (result) => result.cleanupStatus === 'passed' && !result.cleanupReportedDynamically,
      );
      if (cleanupUnverified.length > 0) {
        throw new Error(`正式批次存在${cleanupUnverified.length}条仅静态声明清理成功的用例：${cleanupUnverified.slice(0, 10).map((item) => item.title).join('；')}`);
      }
      const unresolved = results.filter(
        (result) => result.status !== 'passed'
          && !VALID_FAILURE_CATEGORIES.has(result.failureCategory),
      );
      if (unresolved.length > 0) {
        throw new Error(`正式批次存在${unresolved.length}条尚未完成归因的失败：${unresolved.slice(0, 10).map((item) => item.title).join('；')}`);
      }
    }
    if (this.allowedCaseIds.size > 0) {
      const seen = new Set(results.flatMap((result) => result.caseIds));
      const missing = [...this.allowedCaseIds].filter((caseId) => !seen.has(caseId));
      const unexpected = [...seen].filter((caseId) => !this.allowedCaseIds.has(caseId));
      if (missing.length > 0 || unexpected.length > 0) {
        throw new Error(
          `运行计划结果不完整：未执行=${missing.join(',') || '无'}；计划外=${unexpected.join(',') || '无'}`,
        );
      }
      const bindingErrors = results.flatMap((result) => result.caseIds.map((caseId) => {
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

function parseBindings(value, filePath) {
  if (!value && filePath) {
    try {
      value = fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      throw new Error(`EXPECTED_CASE_BINDINGS_FILE无法读取: ${error.message}`);
    }
  }
  if (!value) return new Map();
  try {
    const bindings = JSON.parse(value.replace(/^\uFEFF/, ''));
    if (!Array.isArray(bindings)) throw new Error('绑定内容必须是数组');
    const caseIds = bindings.map((binding) => binding.caseId);
    if (caseIds.length !== new Set(caseIds).size) {
      throw new Error('绑定内容包含重复CASE-ID');
    }
    return new Map(bindings.map((binding) => [binding.caseId, binding]));
  } catch (_error) {
    throw new Error('EXPECTED_CASE_BINDINGS不是有效JSON');
  }
}

function readCleanupStatus(attachments) {
  const attachment = attachments.find((item) => item.name === 'cleanup-status.json');
  if (!attachment?.body) return { status: '', error: '' };
  try {
    const payload = JSON.parse(attachment.body.toString('utf8'));
    return { status: payload.status || '', error: payload.error || '' };
  } catch (_error) {
    return { status: '', error: '' };
  }
}

function classifyFailure(message) {
  if (!message) return 'UNCLASSIFIED';
  if (/element\(s\) not found|locator\(.+\).*toBeVisible|等待.*元素|找不到.*元素/i.test(message)) {
    return 'UNCLASSIFIED';
  }
  if (/当前.*(?:页面|弹窗).*(?:没有|缺少).*(?:控件|字段)|无法建立.*前置数据/i.test(message)) {
    return 'DATA_PRECONDITION_MISSING';
  }
  if (/Expected:|Received:|expect\(.+\) failed/i.test(message) && !/ENOTFOUND|ECONNREFUSED/i.test(message)) {
    return 'UNCLASSIFIED';
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
  return 'UNCLASSIFIED';
}

module.exports = CaseResultReporter;
