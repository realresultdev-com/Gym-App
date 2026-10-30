import type { Env } from '../types/env';

export async function runCleanupJobs(env: Env): Promise<{ tokensCleaned: number; auditLogsCleaned: number }> {
  // 1. Purge expired refresh tokens
  const tokenResult = await env.DB.prepare(
    `DELETE FROM refresh_tokens WHERE expires_at < datetime('now')`
  ).run();

  // 2. Archive or delete audit logs older than 90 days to conserve free-tier D1 quota
  const auditResult = await env.DB.prepare(
    `DELETE FROM audit_logs WHERE created_at < datetime('now', '-90 days')`
  ).run();

  return {
    tokensCleaned: tokenResult.meta?.changes || 0,
    auditLogsCleaned: auditResult.meta?.changes || 0,
  };
}

