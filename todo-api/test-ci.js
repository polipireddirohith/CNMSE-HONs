/**
 * Automated CI/CD Unit & Integration Test Suite for To-Do Microservice
 * Validates REST API CRUD endpoints, health check, Prometheus metrics, and OpenAPI schema.
 */

const http = require('http');
const assert = require('assert');
const app = require('./server');

let server;
let testPort;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: testPort,
      path: path,
      method: method,
      headers: {
        'Accept': 'application/json',
        ...headers,
        ...(body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(JSON.stringify(body)) } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('   CI/CD AUTOMATED TEST RUNNER: TO-DO MICROSERVICE   ');
  console.log('====================================================');

  await new Promise((resolve, reject) => {
    server = app.listen(0, '127.0.0.1', (err) => {
      if (err) return reject(err);
      testPort = server.address().port;
      console.log(`[INIT] Test server bound dynamically to port ${testPort}`);
      resolve();
    });
  });

  try {
    // 1. Health Endpoint Test
    console.log('[STAGE 1] Testing Health Endpoint: GET /health');
    const healthRes = await request('GET', '/health');
    assert.strictEqual(healthRes.statusCode, 200, 'Health endpoint must return 200 OK');
    const healthBody = JSON.parse(healthRes.data);
    assert.strictEqual(healthBody.status, 'UP', 'Health status must be UP');
    assert.strictEqual(healthBody.service, 'todo-api', 'Service name must be todo-api');
    console.log(`  -> PASS: Microservice Health is UP (uptime: ${healthBody.uptime.toFixed(2)}s)`);

    // 2. Metrics Endpoint Test (Prometheus format)
    console.log('\n[STAGE 2] Testing Metrics Endpoint: GET /metrics (Prometheus format)');
    const metricsRes = await request('GET', '/metrics', null, { 'Accept': 'text/plain' });
    assert.strictEqual(metricsRes.statusCode, 200, 'Metrics endpoint must return 200 OK');
    assert(metricsRes.data.includes('process_uptime_seconds'), 'Metrics must export process_uptime_seconds');
    assert(metricsRes.data.includes('http_requests_total'), 'Metrics must export http_requests_total');
    console.log('  -> PASS: Prometheus metrics successfully exposed');

    // 3. Retrieve Initial Tasks: GET /tasks
    console.log('\n[STAGE 3] Testing Retrieve Tasks: GET /tasks');
    const getTasksRes = await request('GET', '/tasks');
    assert.strictEqual(getTasksRes.statusCode, 200);
    const tasks = JSON.parse(getTasksRes.data);
    assert(Array.isArray(tasks) && tasks.length >= 3, 'Must return seeded tasks');
    console.log(`  -> PASS: Retrieved ${tasks.length} tasks successfully`);

    // 4. Create Task: POST /tasks
    console.log('\n[STAGE 4] Testing Create Task: POST /tasks');
    const newTask = {
      title: 'DevOps Module 6 CI/CD Setup',
      description: 'Setup GitHub Actions pipeline with build, test, and health checks',
      completed: false
    };
    const postRes = await request('POST', '/tasks', newTask);
    assert.strictEqual(postRes.statusCode, 201, 'POST /tasks must return 201 Created');
    const createdTask = JSON.parse(postRes.data);
    assert.strictEqual(createdTask.title, newTask.title);
    assert(createdTask.id, 'Created task must have an ID');
    console.log(`  -> PASS: Created task with ID ${createdTask.id}`);

    // 5. Retrieve Specific Task: GET /tasks/:id
    console.log(`\n[STAGE 5] Testing Get Task by ID: GET /tasks/${createdTask.id}`);
    const getSingleRes = await request('GET', `/tasks/${createdTask.id}`);
    assert.strictEqual(getSingleRes.statusCode, 200);
    const fetchedTask = JSON.parse(getSingleRes.data);
    assert.strictEqual(fetchedTask.id, createdTask.id);
    console.log(`  -> PASS: Retrieved single task correctly`);

    // 6. Update Task: PUT /tasks/:id
    console.log(`\n[STAGE 6] Testing Update Task: PUT /tasks/${createdTask.id}`);
    const updateRes = await request('PUT', `/tasks/${createdTask.id}`, {
      title: 'DevOps Module 6 CI/CD Setup (Verified & Done)',
      completed: true
    });
    assert.strictEqual(updateRes.statusCode, 200);
    const updatedTask = JSON.parse(updateRes.data);
    assert.strictEqual(updatedTask.completed, true);
    console.log(`  -> PASS: Updated task completion status`);

    // 7. Delete Task: DELETE /tasks/:id
    console.log(`\n[STAGE 7] Testing Delete Task: DELETE /tasks/${createdTask.id}`);
    const deleteRes = await request('DELETE', `/tasks/${createdTask.id}`);
    assert.strictEqual(deleteRes.statusCode, 200);
    console.log(`  -> PASS: Task ID ${createdTask.id} deleted`);

    // 8. Verify OpenAPI Specification: GET /api-docs.json
    console.log('\n[STAGE 8] Testing OpenAPI Specification: GET /api-docs.json');
    const specRes = await request('GET', '/api-docs.json');
    assert.strictEqual(specRes.statusCode, 200);
    const spec = JSON.parse(specRes.data);
    assert.strictEqual(spec.openapi, '3.0.0');
    assert(spec.paths['/health'], 'OpenAPI spec must document /health');
    assert(spec.paths['/metrics'], 'OpenAPI spec must document /metrics');
    console.log('  -> PASS: OpenAPI 3.0.0 schema verified with monitoring paths');

    console.log('\n====================================================');
    console.log('   ALL 8 CI/CD TESTS PASSED SUCCESSFULLY (100%)    ');
    console.log('====================================================');

    server.close();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST FAILURE:', err.message);
    if (server) server.close();
    process.exit(1);
  }
}

runTests();
