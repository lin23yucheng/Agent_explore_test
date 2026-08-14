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

function withCleanupStatus(body, declaredStatus = 'passed') {
  return async ({ page, browser }, testInfo) => runWithCleanupStatus(
    body, { page, browser }, testInfo, declaredStatus,
  );
}

module.exports = { runWithCleanupStatus, withCleanupStatus };
