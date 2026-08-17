const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');
const CaseResultReporter = require('../../scripts/case-result-reporter');

function fakeTest() {
  return {
    id: 'stable-test-id',
    titlePath: () => ['users.spec.js', '创建用户'],
    annotations: [
      { type: 'case', description: 'CASE-000001' },
      { type: 'cleanup', description: 'passed' },
    ],
  };
}

function fakeResult(status, message = '') {
  return {
    status,
    duration: 1,
    error: message ? { message } : undefined,
    attachments: [],
  };
}

test('only the final retry result is written', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'case-reporter-'));
  const outputFile = path.join(root, 'results.json');
  try {
    const reporter = new CaseResultReporter({ outputFile });
    reporter.onTestEnd(fakeTest(), fakeResult('failed', 'Expected: true\nReceived: false'));
    reporter.onTestEnd(fakeTest(), fakeResult('passed'));
    reporter.onEnd();

    const results = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    assert.equal(results.length, 1);
    assert.equal(results[0].status, 'passed');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('generic assertion failures remain unclassified for later analysis', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'case-reporter-'));
  const outputFile = path.join(root, 'results.json');
  try {
    const reporter = new CaseResultReporter({ outputFile });
    reporter.onTestEnd(fakeTest(), fakeResult('failed', 'Expected: true\nReceived: false'));
    reporter.onEnd();

    const results = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    assert.equal(results[0].failureCategory, 'UNCLASSIFIED');
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('cleanup attachment overrides annotations and fails a formal batch', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'case-reporter-'));
  const outputFile = path.join(root, 'results.json');
  const previousFormal = process.env.FORMAL_UI_RUN;
  try {
    process.env.FORMAL_UI_RUN = 'true';
    const reporter = new CaseResultReporter({ outputFile });
    const result = fakeResult('passed');
    result.attachments = [{
      name: 'cleanup-status.json',
      body: Buffer.from(JSON.stringify({ status: 'failed', error: '残留用户无法删除' })),
    }];
    reporter.onTestEnd(fakeTest(), result);
    assert.throws(() => reporter.onEnd(), /清理失败/);

    const results = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    assert.equal(results[0].status, 'passed');
    assert.equal(results[0].cleanupStatus, 'failed');
    assert.equal(results[0].failureCategory, 'CLEANUP_FAILED');
    assert.equal(results[0].error, '残留用户无法删除');
  } finally {
    if (previousFormal === undefined) delete process.env.FORMAL_UI_RUN;
    else process.env.FORMAL_UI_RUN = previousFormal;
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('formal batches accept unclassified failures for script cleanup', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'case-reporter-'));
  const outputFile = path.join(root, 'results.json');
  const previousFormal = process.env.FORMAL_UI_RUN;
  try {
    process.env.FORMAL_UI_RUN = 'true';
    const reporter = new CaseResultReporter({ outputFile });
    const testCase = fakeTest();
    testCase.annotations = [
      { type: 'case', description: 'CASE-000001' },
      { type: 'cleanup', description: 'not-applicable' },
    ];
    reporter.onTestEnd(testCase, fakeResult('failed', 'Expected: true\nReceived: false'));
    reporter.onEnd();
    const results = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    assert.equal(results[0].failureCategory, 'UNCLASSIFIED');
  } finally {
    if (previousFormal === undefined) delete process.env.FORMAL_UI_RUN;
    else process.env.FORMAL_UI_RUN = previousFormal;
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('formal batches reject static cleanup success', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'case-reporter-'));
  const outputFile = path.join(root, 'results.json');
  const previousFormal = process.env.FORMAL_UI_RUN;
  try {
    process.env.FORMAL_UI_RUN = 'true';
    const reporter = new CaseResultReporter({ outputFile });
    reporter.onTestEnd(fakeTest(), fakeResult('passed'));
    assert.throws(() => reporter.onEnd(), /仅静态声明清理成功/);
  } finally {
    if (previousFormal === undefined) delete process.env.FORMAL_UI_RUN;
    else process.env.FORMAL_UI_RUN = previousFormal;
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('formal batches reject invalid cleanup status values', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'case-reporter-'));
  const outputFile = path.join(root, 'results.json');
  const previousFormal = process.env.FORMAL_UI_RUN;
  try {
    process.env.FORMAL_UI_RUN = 'true';
    const reporter = new CaseResultReporter({ outputFile });
    const result = fakeResult('passed');
    result.attachments = [{
      name: 'cleanup-status.json',
      body: Buffer.from(JSON.stringify({ status: 'maybe' })),
    }];
    reporter.onTestEnd(fakeTest(), result);
    assert.throws(() => reporter.onEnd(), /非法清理状态/);
  } finally {
    if (previousFormal === undefined) delete process.env.FORMAL_UI_RUN;
    else process.env.FORMAL_UI_RUN = previousFormal;
    fs.rmSync(root, { recursive: true, force: true });
  }
});
