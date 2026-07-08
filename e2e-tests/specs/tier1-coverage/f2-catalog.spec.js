const assert = require('assert');

module.exports = {
  'TC-T1-F2-01': {
    name: 'Fetch Catalog List - Success (200 OK & 20+ items)',
    run: async ({ agent }) => {
      const res = await agent.get('/api/catalog');
      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.body));
      assert.ok(res.body.length >= 20, `Expected at least 20 items, got ${res.body.length}`);
    }
  },
  'TC-T1-F2-02': {
    name: 'Verify Catalog Schema - Valid properties',
    run: async ({ agent }) => {
      const res = await agent.get('/api/catalog');
      const item = res.body[0];
      assert.strictEqual(typeof item.id, 'number');
      assert.strictEqual(typeof item.name, 'string');
      assert.strictEqual(typeof item.category, 'string');
      assert.strictEqual(typeof item.description, 'string');
      assert.strictEqual(typeof item.price, 'number');
      assert.strictEqual(typeof item.imageUrl, 'string');
    }
  },
  'TC-T1-F2-03': {
    name: 'Database Pre-seeded on Startup',
    run: async ({ agent }) => {
      const res = await agent.get('/api/catalog');
      assert.ok(res.body.length >= 20);
    }
  },
  'TC-T1-F2-04': {
    name: 'Catalog Seed Integrity - No empty fields',
    run: async ({ agent }) => {
      const res = await agent.get('/api/catalog');
      for (const item of res.body) {
        assert.ok(item.id);
        assert.ok(item.name.trim() !== '');
        assert.ok(item.category.trim() !== '');
        assert.ok(item.price > 0);
      }
    }
  },
  'TC-T1-F2-05': {
    name: 'Content-Type JSON Verification',
    run: async ({ agent }) => {
      const res = await agent.get('/api/catalog');
      assert.match(res.headers['content-type'], /application\/json/);
    }
  }
};
