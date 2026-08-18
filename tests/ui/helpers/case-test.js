const { test } = require('@playwright/test');

async function runWithCleanupStatus(body, fixtures, testInfo, declaredStatus = 'passed') {
  let completed = false;
  try {
    await body(fixtures, testInfo);
    completed = true;
  } finally {
    const alreadyReported = testInfo.attachments.some(
      (attachment) => attachment.name === 'cleanup-status.json',
    );
    if (!alreadyReported) {
      const status = declaredStatus === 'passed' && !completed
        ? 'not_reported'
        : declaredStatus;
      await testInfo.attach('cleanup-status.json', {
        body: JSON.stringify({
          status,
          error: status === 'not_reported'
            ? '用例失败后尚未独立确认测试数据清理结果。'
            : '',
        }),
        contentType: 'application/json',
      });
    }
  }
}

async function reportCleanupStatus(testInfo, status, error = '') {
  const allowed = new Set(['passed', 'not-applicable', 'retained-by-design', 'failed']);
  if (!allowed.has(status)) throw new Error(`非法清理状态: ${status}`);
  await testInfo.attach('cleanup-status.json', {
    body: JSON.stringify({ status, error }),
    contentType: 'application/json',
  });
}

function withCleanupStatus(body, declaredStatus = 'passed') {
  return async ({ page, browser }, testInfo) => runWithCleanupStatus(
    body, { page, browser }, testInfo, declaredStatus,
  );
}

function caseTest(caseId, title, body, declaredStatus = 'passed') {
  if (!/^CASE-\d{6}$/.test(caseId)) throw new Error(`非法CASE-ID: ${caseId}`);
  if (!title.includes(caseId)) throw new Error('正式测试标题必须包含CASE-ID');
  test(
    title,
    { annotation: { type: 'case', description: caseId } },
    withCleanupStatus(body, declaredStatus),
  );
}

module.exports = {
  caseTest,
  reportCleanupStatus,
  runWithCleanupStatus,
  withCleanupStatus,
};
