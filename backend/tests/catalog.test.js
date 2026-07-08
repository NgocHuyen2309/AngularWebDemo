const request = require('supertest');
const app = require('../app');
const dbHelper = require('./helpers/db.helper');
const Catalog = require('../models/catalog.model');
const fs = require('fs');
const path = require('path');

beforeAll(async () => {
  await dbHelper.connect();
});

afterAll(async () => {
  await dbHelper.close();
});

beforeEach(async () => {
  await dbHelper.clear();
  // Seeding catalog
  const rawData = fs.readFileSync(path.join(__dirname, '../data.json'), 'utf8');
  const seedData = JSON.parse(rawData);
  await Catalog.insertMany(seedData);
});

describe('Catalog API', () => {
  test('GET /api/catalog - returns all items (at least 20)', async () => {
    const res = await request(app).get('/api/catalog');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(20);
    
    const first = res.body[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('category');
    expect(first).toHaveProperty('price');
  });

  test('GET /api/catalog - invalid limit parameter', async () => {
    const res = await request(app).get('/api/catalog?limit=-10');
    expect(res.statusCode).toBe(400);
  });

  test('GET /api/catalog - limits verification', async () => {
    const res = await request(app).get('/api/catalog?limit=5');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(5);
  });

  test('GET /api/catalog - sorting verification', async () => {
    const res = await request(app).get('/api/catalog');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    
    // Verify sorted by id in ascending order
    for (let i = 0; i < res.body.length - 1; i++) {
      expect(res.body[i].id).toBeLessThan(res.body[i + 1].id);
    }
  });
});
