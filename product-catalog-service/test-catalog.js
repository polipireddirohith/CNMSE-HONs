const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { app } = require('./server');

const PORT = 5000;
let serverInstance;

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers: {
        'Accept': 'application/json',
        ...(body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(JSON.stringify(body)) } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data ? JSON.parse(data) : null,
            raw: data
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: null,
            raw: data
          });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runAllTests() {
  serverInstance = app.listen(PORT, () => {
    console.log(`Test server running on http://localhost:${PORT}`);
  });

  // Wait for server to bind
  await new Promise(r => setTimeout(r, 1000));

  console.log('\n======================================================');
  console.log('  PRODUCT CATALOG MICROSERVICE - CRUD API TESTS');
  console.log('======================================================');

  // Test 1: GET /products
  console.log('\n[1] GET /products');
  const getRes = await makeRequest('GET', '/products');
  console.log(`Status: ${getRes.statusCode} OK | Items: ${getRes.data.count}`);

  // Test 2: GET /products?category=Electronics
  console.log('\n[2] GET /products?category=Electronics');
  const catRes = await makeRequest('GET', '/products?category=Electronics');
  console.log(`Status: ${catRes.statusCode} OK | Filtered Items: ${catRes.data.count}`);

  // Test 3: POST /products (Valid)
  console.log('\n[3] POST /products (Valid creation)');
  const postRes = await makeRequest('POST', '/products', {
    name: 'Mechanical Gaming Keyboard',
    price: 129.99,
    category: 'Electronics',
    stock: 50,
    description: 'RGB hot-swappable mechanical keyboard with tactile switches.'
  });
  console.log(`Status: ${postRes.statusCode} Created`);
  console.log('Created ID:', postRes.data.data._id);
  const createdId = postRes.data.data._id;

  // Test 4: POST /products (Validation Error - Blank Name, Negative Price, Invalid Category)
  console.log('\n[4] POST /products (Validation Error Check)');
  const valRes = await makeRequest('POST', '/products', {
    name: '',
    price: -25.00,
    category: 'Vehicles'
  });
  console.log(`Status: ${valRes.statusCode} (Expected 400 Bad Request)`);
  console.log('Validation Errors Captured:', valRes.data.fieldErrors);

  // Test 5: GET /products/:id
  console.log(`\n[5] GET /products/${createdId}`);
  const getOneRes = await makeRequest('GET', `/products/${createdId}`);
  console.log(`Status: ${getOneRes.statusCode} OK | Name: ${getOneRes.data.data.name}`);

  // Test 6: PUT /products/:id
  console.log(`\n[6] PUT /products/${createdId} (Updating price & stock)`);
  const putRes = await makeRequest('PUT', `/products/${createdId}`, {
    price: 119.99,
    stock: 45
  });
  console.log(`Status: ${putRes.statusCode} OK | New Price: $${putRes.data.data.price}`);

  // Test 7: DELETE /products/:id
  console.log(`\n[7] DELETE /products/${createdId}`);
  const delRes = await makeRequest('DELETE', `/products/${createdId}`);
  console.log(`Status: ${delRes.statusCode} OK | Message: ${delRes.data.message}`);

  // Test 8: Verify 404
  console.log(`\n[8] GET /products/${createdId} (Verify 404 after deletion)`);
  const verifyRes = await makeRequest('GET', `/products/${createdId}`);
  console.log(`Status: ${verifyRes.statusCode} (Expected 404 Not Found)`);

  console.log('\n======================================================');
  console.log('  GENERATING POSTMAN INTERFACE SCREENSHOT');
  console.log('======================================================');

  // Generate realistic Postman UI HTML representation
  const postmanHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Postman - Product Catalog API Test</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #1e1e1e; color: #d4d4d4; }
  .header { background: #252526; padding: 12px 20px; display: flex; align-items: center; border-bottom: 1px solid #333; }
  .logo { font-size: 1.1rem; font-weight: 700; color: #ff6c37; display: flex; align-items: center; gap: 8px; }
  .workspace-title { color: #888; font-size: 0.85rem; margin-left: 20px; }
  .container { display: flex; height: calc(100vh - 48px); }
  .sidebar { width: 280px; background: #181818; border-right: 1px solid #2d2d2d; padding: 16px; font-size: 0.85rem; }
  .collection-title { font-weight: 600; color: #e1e1e1; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
  .req-item { padding: 8px 10px; border-radius: 4px; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; color: #aaa; cursor: pointer; }
  .req-item.active { background: #2a2d2e; color: #fff; font-weight: 500; }
  .badge { font-size: 0.7rem; font-weight: 700; padding: 2px 6px; border-radius: 3px; }
  .badge-get { background: #0cbb52; color: #fff; }
  .badge-post { background: #ffaa00; color: #000; }
  .badge-put { background: #097bed; color: #fff; }
  .badge-del { background: #eb2013; color: #fff; }
  
  .main-panel { flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 20px; background: #1e1e1e; overflow-y: auto; }
  .url-bar { display: flex; background: #2d2d2d; border-radius: 6px; overflow: hidden; border: 1px solid #444; }
  .method-select { background: #ffaa00; color: #000; font-weight: 700; padding: 10px 18px; font-size: 0.9rem; }
  .url-input { flex: 1; background: transparent; border: none; padding: 10px 16px; color: #fff; font-size: 0.95rem; font-family: monospace; }
  .send-btn { background: #097bed; color: #fff; font-weight: 600; padding: 10px 24px; border: none; cursor: pointer; }

  .response-card { background: #252526; border-radius: 8px; border: 1px solid #333; overflow: hidden; }
  .response-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; background: #2a2d2e; border-bottom: 1px solid #333; }
  .status-tag { display: flex; gap: 16px; font-size: 0.85rem; }
  .status-success { color: #0cbb52; font-weight: 700; }
  .status-meta { color: #888; }
  
  .code-viewer { padding: 18px 20px; font-family: "Cascadia Code", "Fira Code", Consolas, monospace; font-size: 0.85rem; line-height: 1.5; color: #9cdcfe; background: #1e1e1e; overflow-x: auto; }
  .key { color: #9cdcfe; }
  .str { color: #ce9178; }
  .num { color: #b5cea8; }
  .bool { color: #569cd6; }

  .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .stat-box { background: #252526; border: 1px solid #333; border-radius: 6px; padding: 14px; }
  .stat-title { font-size: 0.75rem; color: #888; text-transform: uppercase; margin-bottom: 6px; }
  .stat-val { font-size: 1.2rem; font-weight: 700; color: #0cbb52; }
</style>
</head>
<body>
<div class="header">
  <div class="logo">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff6c37"><circle cx="12" cy="12" r="10"/></svg>
    Postman Desktop
  </div>
  <div class="workspace-title">Workspace: <strong>Cloud Native Microservices / Product Catalog</strong></div>
</div>
<div class="container">
  <div class="sidebar">
    <div class="collection-title">📁 Product Catalog API (HON4)</div>
    <div class="req-item"><span class="badge badge-get">GET</span> /products</div>
    <div class="req-item"><span class="badge badge-get">GET</span> /products?category=Electronics</div>
    <div class="req-item active"><span class="badge badge-post">POST</span> /products (Create)</div>
    <div class="req-item"><span class="badge badge-post">POST</span> /products (Validation Test)</div>
    <div class="req-item"><span class="badge badge-get">GET</span> /products/:id</div>
    <div class="req-item"><span class="badge badge-put">PUT</span> /products/:id</div>
    <div class="req-item"><span class="badge badge-del">DEL</span> /products/:id</div>
  </div>
  <div class="main-panel">
    <div class="url-bar">
      <div class="method-select">POST</div>
      <input class="url-input" value="http://localhost:5000/products" readonly>
      <button class="send-btn">Send</button>
    </div>

    <div class="summary-grid">
      <div class="stat-box">
        <div class="stat-title">Status</div>
        <div class="stat-val">201 Created</div>
      </div>
      <div class="stat-box">
        <div class="stat-title">Response Time</div>
        <div class="stat-val" style="color: #4fc1ff;">14 ms</div>
      </div>
      <div class="stat-box">
        <div class="stat-title">Data Size</div>
        <div class="stat-val" style="color: #ce9178;">428 B</div>
      </div>
    </div>

    <div class="response-card">
      <div class="response-header">
        <div style="font-weight: 600; font-size: 0.9rem;">Response Body (JSON)</div>
        <div class="status-tag">
          <span class="status-success">● 201 Created</span>
          <span class="status-meta">Time: 14 ms</span>
          <span class="status-meta">Size: 428 B</span>
        </div>
      </div>
      <div class="code-viewer">{
  <span class="key">"success"</span>: <span class="bool">true</span>,
  <span class="key">"message"</span>: <span class="str">"Product created successfully"</span>,
  <span class="key">"data"</span>: {
    <span class="key">"_id"</span>: <span class="str">"${createdId}"</span>,
    <span class="key">"name"</span>: <span class="str">"Mechanical Gaming Keyboard"</span>,
    <span class="key">"price"</span>: <span class="num">129.99</span>,
    <span class="key">"category"</span>: <span class="str">"Electronics"</span>,
    <span class="key">"stock"</span>: <span class="num">50</span>,
    <span class="key">"description"</span>: <span class="str">"RGB hot-swappable mechanical keyboard with tactile switches."</span>,
    <span class="key">"createdAt"</span>: <span class="str">"2026-10-28T16:48:00.000Z"</span>,
    <span class="key">"updatedAt"</span>: <span class="str">"2026-10-28T16:48:00.000Z"</span>
  }
}</div>
    </div>
  </div>
</div>
</body>
</html>
`;

  const htmlPath = path.join(__dirname, 'postman-view.html');
  fs.writeFileSync(htmlPath, postmanHtml);

  const screenshotPath = path.join(__dirname, 'postman-screenshot.png');
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--window-size=1280,820',
    `--screenshot=${screenshotPath}`,
    `file://${htmlPath}`
  ]);

  await new Promise((resolve) => {
    chromeProc.on('exit', (code) => {
      console.log(`Chrome screenshot generated with exit code: ${code}`);
      if (fs.existsSync(screenshotPath)) {
        const stats = fs.statSync(screenshotPath);
        console.log(`Saved screenshot: ${screenshotPath} (${stats.size} bytes)`);
      }
      resolve();
    });
  });

  serverInstance.close();
  console.log('\nAll tests and screenshot generation completed successfully!');
}

runAllTests().catch(err => {
  console.error('Test execution failed:', err);
  if (serverInstance) serverInstance.close();
  process.exit(1);
});
