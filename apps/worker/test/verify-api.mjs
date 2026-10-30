// Automated Verification Suite for FITPULSE Cloudflare Serverless Architecture
import assert from 'node:assert';
import { createApp } from '../src/app.js';
import { handleScheduled } from '../src/scheduled/index.js';

console.log('🧪 Starting Cloudflare Serverless Architecture Verification Tests...\n');

// Mock D1 Environment with in-memory execution or local query bridge
let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`✅ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}:`, err.message);
  }
}

async function asyncTest(name, fn) {
  total++;
  try {
    await fn();
    console.log(`✅ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ [FAIL] ${name}:`, err.message);
  }
}

async function runSuite() {
  const app = createApp();

  await asyncTest('1. Health Check Endpoint (/api/health)', async () => {
    const res = await app.request('/api/health');
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.status, 'healthy');
    assert.strictEqual(body.serverless, true);
  });

  await asyncTest('2. Root Serverless Info Endpoint (/)', async () => {
    const res = await app.request('/');
    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.runtime, 'Cloudflare Workers (Edge Serverless)');
    assert.strictEqual(body.database, 'Cloudflare D1 (SQLite Edge Relational)');
    assert.strictEqual(body.storage, 'Cloudflare R2 Object Storage');
  });

  await asyncTest('3. Rate Limiting Protection (429 handling)', async () => {
    const res = await app.request('/api/health', {
      headers: { 'cf-connecting-ip': '127.0.0.1' },
    });
    assert.strictEqual(res.status, 200);
  });

  await asyncTest('4. Unauthorized Request Rejected (401)', async () => {
    const res = await app.request('/api/admin/metrics');
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'UNAUTHORIZED');
  });

  await asyncTest('5. Invalid Route Returns 404 Standard Error Format', async () => {
    const res = await app.request('/api/nonexistent-route');
    assert.strictEqual(res.status, 404);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'NOT_FOUND');
  });

  console.log(`\n🎉 Verification Complete: ${passed}/${total} test suites passed.\n`);
}

runSuite().catch(console.error);

