const assert = require('assert');

module.exports = {
  'TC-T4-02': {
    name: 'Workload 2: Double Registration and Catalog Validation workflow',
    run: async ({ agent }) => {
      const duplicateEmail = 't4-w2-dup@example.com';
      
      // 1. Register first time
      const res1 = await agent
        .post('/api/users')
        .send({ email: duplicateEmail, date_of_birth: '1990-01-01' });
      assert.strictEqual(res1.statusCode, 201);
      
      // 2. Attempt to register again with same email -> assert 409
      const res2 = await agent
        .post('/api/users')
        .send({ email: duplicateEmail, date_of_birth: '1995-02-02' });
      assert.strictEqual(res2.statusCode, 409);
      
      // 3. Register with different email -> assert 201
      const res3 = await agent
        .post('/api/users')
        .send({ email: 't4-w2-unique@example.com', date_of_birth: '1990-01-01' });
      assert.strictEqual(res3.statusCode, 201);
      
      // 4. Fetch catalog and verify 20+ items
      const catalogRes = await agent.get('/api/catalog');
      assert.strictEqual(catalogRes.statusCode, 200);
      assert.ok(catalogRes.body.length >= 20);
    }
  }
};
