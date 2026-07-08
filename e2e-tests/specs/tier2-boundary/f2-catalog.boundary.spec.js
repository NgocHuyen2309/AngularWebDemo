const assert = require('assert');
const Catalog = require('../../../backend/models/catalog.model');
const { connectDB } = require('../../../backend/config/db');

module.exports = {
  'TC-T2-F2-01': {
    name: 'Startup DB Seeding - No duplication when re-connecting',
    run: async ({ agent }) => {
      // Connect again and verify seeding doesn't duplicate
      await connectDB();
      const res = await agent.get('/api/catalog');
      assert.ok(res.body.length >= 20);
      assert.ok(res.body.length < 40, 'Should not duplicate items in catalog DB');
    }
  },
  'TC-T2-F2-02': {
    name: 'Handle Invalid Parameters - Negative Limit (400 Bad Request)',
    run: async ({ agent }) => {
      const res = await agent.get('/api/catalog?limit=-5');
      assert.strictEqual(res.statusCode, 400);
      assert.ok(res.body.error);
    }
  },
  'TC-T2-F2-03': {
    name: 'Catalog Database Record holds valid boundary prices',
    run: async ({ agent }) => {
      const res = await agent.get('/api/catalog');
      for (const item of res.body) {
        assert.ok(item.price >= 0.01, 'Prices should be positive boundary values');
      }
    }
  },
  'TC-T2-F2-04': {
    name: 'Empty Catalog DB - Graceful empty response (200 OK & empty array)',
    run: async ({ agent }) => {
      // Temporarily clear catalog documents
      await Catalog.deleteMany({});
      
      const res = await agent.get('/api/catalog');
      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.body));
      assert.strictEqual(res.body.length, 0);
      
      // Restore seeding
      await connectDB();
    }
  },
  'TC-T2-F2-05': {
    name: 'Catalog Database contains no items with negative price or empty titles',
    run: async ({ agent }) => {
      const res = await agent.get('/api/catalog');
      for (const item of res.body) {
        assert.ok(item.price >= 0, 'No negative prices allowed');
        assert.ok(item.name && item.name.trim().length > 0, 'No empty names allowed');
      }
    }
  }
};
