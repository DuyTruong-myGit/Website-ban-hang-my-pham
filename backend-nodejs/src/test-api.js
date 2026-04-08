/**
 * Script test nhanh các API của TV5
 * Chạy: node src/test-api.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

const BASE = 'http://localhost:5000';

async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  try {
    const res = await fetch(`${BASE}${path}`, opts);
    const data = await res.json();
    const status = res.status;
    return { status, data };
  } catch (err) {
    return { status: 0, data: { error: err.message } };
  }
}

async function run() {
  // Kết nối DB để tạo admin tạm
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to DB');

  // Tạo hoặc tìm admin user
  let admin = await User.findOne({ email: 'tv5-test-admin@test.com' });
  if (!admin) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Admin123', salt);
    admin = await User.create({
      name: 'TV5 Test Admin',
      email: 'tv5-test-admin@test.com',
      password_hash: hash,
      role: 'admin',
    });
    console.log('✅ Created test admin user');
  }

  // Login
  const loginRes = await request('POST', '/api/auth/login', {
    email: 'tv5-test-admin@test.com',
    password: 'Admin123',
  });
  if (!loginRes.data.success) {
    console.log('❌ Login failed:', loginRes.data.message);
    await mongoose.disconnect();
    return;
  }
  const token = loginRes.data.data.token;
  console.log('✅ Admin logged in, token received');

  console.log('\n========== TEST TV5 API ENDPOINTS ==========\n');

  // 1. Reports Overview
  const r1 = await request('GET', '/api/admin/reports/overview', null, token);
  console.log(`[${r1.status}] GET /api/admin/reports/overview`);
  console.log('  Data:', JSON.stringify(r1.data.data));

  // 2. Reports Revenue
  const r2 = await request('GET', '/api/admin/reports/revenue?from=2025-01-01&to=2026-12-31', null, token);
  console.log(`[${r2.status}] GET /api/admin/reports/revenue`);
  console.log('  Records:', Array.isArray(r2.data.data) ? r2.data.data.length : 'N/A');

  // 3. Top Products
  const r3 = await request('GET', '/api/admin/reports/top-products', null, token);
  console.log(`[${r3.status}] GET /api/admin/reports/top-products`);
  console.log('  Products:', Array.isArray(r3.data.data) ? r3.data.data.length : 'N/A');

  // 4. Recent Orders
  const r4 = await request('GET', '/api/admin/reports/recent-orders', null, token);
  console.log(`[${r4.status}] GET /api/admin/reports/recent-orders`);
  console.log('  Orders:', Array.isArray(r4.data.data) ? r4.data.data.length : 'N/A');

  // 5. Low Stock (report)
  const r5 = await request('GET', '/api/admin/reports/low-stock', null, token);
  console.log(`[${r5.status}] GET /api/admin/reports/low-stock`);
  console.log('  Items:', Array.isArray(r5.data.data) ? r5.data.data.length : 'N/A');

  // 6. Admin Logs
  const r6 = await request('GET', '/api/admin/logs', null, token);
  console.log(`[${r6.status}] GET /api/admin/logs`);
  console.log('  Logs:', Array.isArray(r6.data.data) ? r6.data.data.length : 'N/A');
  console.log('  Pagination:', JSON.stringify(r6.data.pagination));

  // 7. Inventory List
  const r7 = await request('GET', '/api/admin/inventory', null, token);
  console.log(`[${r7.status}] GET /api/admin/inventory`);
  console.log('  Products:', Array.isArray(r7.data.data) ? r7.data.data.length : 'N/A');
  console.log('  Pagination:', JSON.stringify(r7.data.pagination));

  // 8. Inventory Low Stock
  const r8 = await request('GET', '/api/admin/inventory/low-stock', null, token);
  console.log(`[${r8.status}] GET /api/admin/inventory/low-stock`);
  console.log('  Items:', Array.isArray(r8.data.data) ? r8.data.data.length : 'N/A');

  // 9. Page Content CRUD
  // Create
  const r9 = await request('POST', '/api/admin/pages', {
    slug: 'test-page-tv5',
    title: 'Trang test TV5',
    content: '<p>Nội dung test từ TV5</p>',
  }, token);
  console.log(`[${r9.status}] POST /api/admin/pages`);
  console.log('  Created:', r9.data.success ? r9.data.data?.slug : r9.data.message);
  const pageId = r9.data.data?._id;

  // Read public
  const r10 = await request('GET', '/api/pages/test-page-tv5');
  console.log(`[${r10.status}] GET /api/pages/test-page-tv5 (Public)`);
  console.log('  Found:', r10.data.success ? r10.data.data?.title : 'NOT FOUND');

  // Update
  if (pageId) {
    const r11 = await request('PUT', `/api/admin/pages/${pageId}`, {
      title: 'Trang test TV5 (updated)',
    }, token);
    console.log(`[${r11.status}] PUT /api/admin/pages/${pageId}`);
    console.log('  Updated:', r11.data.success ? r11.data.data?.title : r11.data.message);

    // Delete
    const r12 = await request('DELETE', `/api/admin/pages/${pageId}`, null, token);
    console.log(`[${r12.status}] DELETE /api/admin/pages/${pageId}`);
    console.log('  Deleted:', r12.data.success);
  }

  // 10. Verify Logs were created
  const r13 = await request('GET', '/api/admin/logs?action=CREATE_PAGE', null, token);
  console.log(`[${r13.status}] GET /api/admin/logs?action=CREATE_PAGE`);
  console.log('  Page logs:', Array.isArray(r13.data.data) ? r13.data.data.length : 'N/A');

  // 11. Auth guard test — customer token should get 403
  const custLogin = await request('POST', '/api/auth/login', {
    email: 'admin@test.com',
    password: 'Admin123',
  });
  if (custLogin.data.success) {
    const custToken = custLogin.data.data.token;
    const r14 = await request('GET', '/api/admin/reports/overview', null, custToken);
    console.log(`\n[${r14.status}] GET /api/admin/reports/overview (customer token)`);
    console.log('  Expected 403:', r14.status === 403 ? '✅ PASS' : '❌ FAIL');
  }

  console.log('\n========== TEST COMPLETE ==========');

  // Cleanup: remove test admin
  await User.deleteOne({ email: 'tv5-test-admin@test.com' });
  console.log('🧹 Cleaned up test admin user');

  await mongoose.disconnect();
}

run().catch(console.error);
