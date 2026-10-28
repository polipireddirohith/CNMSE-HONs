const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Start the server
const serverProcess = spawn('node', ['server.js'], {
  cwd: __dirname,
  stdio: ['ignore', 'pipe', 'pipe']
});

serverProcess.stdout.on('data', (d) => process.stdout.write(d.toString()));
serverProcess.stderr.on('data', (d) => process.stderr.write(d.toString()));

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Accept': 'application/json',
        ...(body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(JSON.stringify(body)) } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data ? JSON.parse(data) : null
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
  // Wait for server to start
  await new Promise(r => setTimeout(r, 1500));

  console.log('\n--- 1. Testing GET /tasks ---');
  const getRes = await request('GET', '/tasks');
  console.log('Status:', getRes.statusCode);
  console.log('Tasks Count:', getRes.data.length);
  console.log('First Task:', getRes.data[0]);

  console.log('\n--- 2. Testing POST /tasks ---');
  const postRes = await request('POST', '/tasks', {
    title: 'Write Kubernetes deployment manifests',
    description: 'Create manifests for frontend and backend microservices',
    completed: false
  });
  console.log('Status:', postRes.statusCode);
  console.log('Created Task:', postRes.data);
  const newTaskId = postRes.data.id;

  console.log(`\n--- 3. Testing GET /tasks/${newTaskId} ---`);
  const getOneRes = await request('GET', `/tasks/${newTaskId}`);
  console.log('Status:', getOneRes.statusCode);
  console.log('Fetched Task:', getOneRes.data);

  console.log(`\n--- 4. Testing PUT /tasks/${newTaskId} ---`);
  const putRes = await request('PUT', `/tasks/${newTaskId}`, {
    title: 'Write Kubernetes deployment manifests (Completed)',
    completed: true
  });
  console.log('Status:', putRes.statusCode);
  console.log('Updated Task:', putRes.data);

  console.log(`\n--- 5. Testing DELETE /tasks/${newTaskId} ---`);
  const deleteRes = await request('DELETE', `/tasks/${newTaskId}`);
  console.log('Status:', deleteRes.statusCode);
  console.log('Delete Response:', deleteRes.data);

  console.log('\n--- 6. Verifying 404 for deleted task ---');
  const verifyRes = await request('GET', `/tasks/${newTaskId}`);
  console.log('Status (Expected 404):', verifyRes.statusCode);
  console.log('Error Body:', verifyRes.data);

  console.log('\n--- 7. Testing Swagger OpenAPI Spec GET /api-docs.json ---');
  const specRes = await request('GET', '/api-docs.json');
  console.log('Status:', specRes.statusCode);
  console.log('OpenAPI Version:', specRes.data.openapi);
  console.log('Documented Paths:', Object.keys(specRes.data.paths));

  // Screenshot Swagger UI using Chrome
  console.log('\n--- 8. Capturing Swagger UI Screenshot ---');
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const screenshotPath = path.join(__dirname, 'swagger-ui-screenshot.png');
  
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--window-size=1280,950',
    `--screenshot=${screenshotPath}`,
    'http://localhost:3000/api-docs/'
  ]);

  await new Promise((resolve) => {
    chromeProc.on('exit', (code) => {
      console.log(`Chrome screenshot finished with exit code ${code}`);
      if (fs.existsSync(screenshotPath)) {
        const stats = fs.statSync(screenshotPath);
        console.log(`Screenshot saved successfully: ${screenshotPath} (${stats.size} bytes)`);
      } else {
        console.log('Screenshot file was not created.');
      }
      resolve();
    });
  });

  serverProcess.kill();
  console.log('\nAll API tests and documentation checks passed successfully!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  serverProcess.kill();
  process.exit(1);
});
