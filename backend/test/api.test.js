const { describe, it, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const path = require('path');
const fs = require('fs');

const TEST_DB = path.join(__dirname, 'radian_key_test.db');
process.env.PORT = '0';

const sqlite3 = require('sqlite3').verbose();
try { fs.unlinkSync(TEST_DB); } catch {}
try { fs.unlinkSync(TEST_DB + '-journal'); } catch {}
try { fs.unlinkSync(TEST_DB + '-wal'); } catch {}

const testDb = new sqlite3.Database(TEST_DB);

testDb.serialize(() => {
  testDb.run(`CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    qr_code TEXT NOT NULL UNIQUE DEFAULT '',
    stamps INTEGER DEFAULT 0,
    voucher_active INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active',
    id_card TEXT DEFAULT ''
  )`);
  testDb.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    stamps_before INTEGER,
    stamps_after INTEGER,
    voucher_used INTEGER DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  )`);
});

const dbModulePath = path.resolve(__dirname, '..', 'database.js');
require.cache[dbModulePath] = {
  exports: testDb,
  id: dbModulePath,
  filename: dbModulePath,
  loaded: true,
  children: [],
  paths: []
};

const app = require('../app');

describe('Radian Key API', () => {
  let customerId;
  let idCard;
  let blankIdCard;

  it('GET /api/health returns OK', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'OK');
  });

  it('POST /api/customers/register creates customer with auto id_card', async () => {
    const res = await request(app)
      .post('/api/customers/register')
      .send({ name: 'Budi', phone: '08111111111' });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.customer.id > 0);
    assert.ok(res.body.customer.id_card.startsWith('RSN-'));
    customerId = res.body.customer.id;
    idCard = res.body.customer.id_card;
  });

  it('POST /api/customers/register rejects duplicate phone', async () => {
    const res = await request(app)
      .post('/api/customers/register')
      .send({ name: 'Budi 2', phone: '08111111111' });
    assert.equal(res.status, 409);
    assert.ok(res.body.error.includes('HP sudah terdaftar'));
  });

  it('POST /api/customers/register with custom id_card', async () => {
    const res = await request(app)
      .post('/api/customers/register')
      .send({ name: 'Siti', phone: '08222222222', id_card: 'VIP-001' });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.customer.id_card, 'VIP-001');
  });

  it('POST /api/customers/register rejects missing name', async () => {
    const res = await request(app)
      .post('/api/customers/register')
      .send({ phone: '08444444444' });
    assert.equal(res.status, 400);
  });

  it('GET /api/customers/id/:card returns customer by ID Card', async () => {
    const res = await request(app).get(`/api/customers/id/${idCard}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.name, 'Budi');
    assert.equal(res.body.phone, '08111111111');
    assert.ok(res.body.qr_image);
    assert.equal(res.body.id_card, idCard);
  });

  it('GET /api/customers/id/:card returns 404 for unknown', async () => {
    const res = await request(app).get('/api/customers/id/RSN-9999');
    assert.equal(res.status, 404);
  });

  it('GET /api/customers/phone/:phone returns customer', async () => {
    const res = await request(app).get('/api/customers/phone/08111111111');
    assert.equal(res.status, 200);
    assert.equal(res.body.name, 'Budi');
  });

  it('POST /api/customers/batch-generate creates N blank ID cards', async () => {
    const res = await request(app)
      .post('/api/customers/batch-generate')
      .send({ count: 3 });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.count, 3);
    assert.equal(res.body.codes.length, 3);
    assert.ok(res.body.codes[0].qr_code.startsWith('RSN-'));
    assert.ok(res.body.codes[0].qr_image);
    blankIdCard = res.body.codes[0].qr_code;
  });

  it('GET /api/customers/id/:card shows blank as printed', async () => {
    const res = await request(app).get(`/api/customers/id/${blankIdCard}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'printed');
    assert.equal(res.body.name, '');
  });

  it('POST /api/customers/claim activates blank ID card', async () => {
    const res = await request(app)
      .post('/api/customers/claim')
      .send({ id_card: blankIdCard, name: 'Asep', phone: '08555555555' });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.customer.name, 'Asep');
  });

  it('POST /api/customers/claim rejects already claimed', async () => {
    const res = await request(app)
      .post('/api/customers/claim')
      .send({ id_card: blankIdCard, name: 'Asep 2', phone: '08666666666' });
    assert.equal(res.status, 409);
  });

  it('POST /api/customers/claim rejects unknown', async () => {
    const res = await request(app)
      .post('/api/customers/claim')
      .send({ id_card: 'RSN-9999', name: 'Test', phone: '08777777777' });
    assert.equal(res.status, 404);
  });

  it('POST /api/customers/claim rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/customers/claim')
      .send({ id_card: blankIdCard });
    assert.equal(res.status, 400);
  });

  it('POST /api/customers/:id/add-stamp increments', async () => {
    const res = await request(app).post(`/api/customers/${customerId}/add-stamp`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.stamps, 1);
  });

  it('Stamp & use voucher full flow', async () => {
    const reg = await request(app)
      .post('/api/customers/register')
      .send({ name: 'Voucher Test', phone: '08888888888' });
    const id = reg.body.customer.id;
    for (let i = 0; i < 8; i++) await request(app).post(`/api/customers/${id}/add-stamp`);
    const useRes = await request(app).post(`/api/customers/${id}/use-voucher`);
    assert.equal(useRes.status, 200);
    assert.equal(useRes.body.stamps, 0);
  });

  it('use-voucher rejects when no voucher', async () => {
    const reg = await request(app)
      .post('/api/customers/register')
      .send({ name: 'No Voucher', phone: '08999999999' });
    const id = reg.body.customer.id;
    const res = await request(app).post(`/api/customers/${id}/use-voucher`);
    assert.equal(res.status, 400);
  });

  it('GET /api/customers/:id/history returns transactions', async () => {
    const res = await request(app).get(`/api/customers/${customerId}/history`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length > 0);
  });

  it('GET /api/customers/id/:card/image returns PNG', async () => {
    const res = await request(app).get(`/api/customers/id/${idCard}/image`);
    assert.equal(res.status, 200);
    assert.ok(res.headers['content-type'].includes('image/png'));
  });

  it('GET /api/admin/stats returns stats', async () => {
    const res = await request(app).get('/api/admin/stats');
    assert.equal(res.status, 200);
    assert.ok(res.body.totalCustomers > 0);
  });

  it('GET /api/admin/customers returns paginated list', async () => {
    const res = await request(app).get('/api/admin/customers');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.customers));
    assert.ok(res.body.customers.length > 0);
  });

  it('GET /api/admin/customers?search=Budi filters', async () => {
    const res = await request(app).get('/api/admin/customers?search=Budi');
    assert.equal(res.status, 200);
    assert.ok(res.body.customers.every(c => c.name.includes('Budi') || c.phone.includes('Budi')));
  });

  it('GET /api/admin/customers/:id returns detail', async () => {
    const res = await request(app).get(`/api/admin/customers/${customerId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.customer.name, 'Budi');
  });

  after(() => {
    testDb.close();
    try { fs.unlinkSync(TEST_DB); } catch {}
    try { fs.unlinkSync(TEST_DB + '-journal'); } catch {}
    try { fs.unlinkSync(TEST_DB + '-wal'); } catch {}
  });
});
