const assert = require('assert');

module.exports = {
  'TC-T1-F1-01': {
    name: 'User Registration - Success (201 Created & numeric ID)',
    run: async ({ agent }) => {
      const res = await agent
        .post('/api/users')
        .send({ email: 't1-f1-01@example.com', date_of_birth: '1990-01-01' });
      
      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(typeof res.body.id, 'number');
      assert.strictEqual(res.body.email, 't1-f1-01@example.com');
      assert.ok(res.body.date_of_birth);
      
      // Store ID for subsequent test cases in the session/runner context
      global.t1User1Id = res.body.id;
    }
  },
  'TC-T1-F1-02': {
    name: 'Retrieve User by ID - Success (200 OK)',
    run: async ({ agent }) => {
      assert.ok(global.t1User1Id, 'Previous user ID is required');
      const res = await agent.get(`/api/users/${global.t1User1Id}`);
      
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.id, global.t1User1Id);
      assert.strictEqual(res.body.email, 't1-f1-01@example.com');
    }
  },
  'TC-T1-F1-03': {
    name: 'Update User Profile - Success (200 OK & persisted)',
    run: async ({ agent }) => {
      assert.ok(global.t1User1Id, 'Previous user ID is required');
      const res = await agent
        .put(`/api/users/${global.t1User1Id}`)
        .send({ email: 't1-f1-03-updated@example.com', date_of_birth: '1991-02-02' });
      
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.email, 't1-f1-03-updated@example.com');
      
      // Confirm persistence
      const getRes = await agent.get(`/api/users/${global.t1User1Id}`);
      assert.strictEqual(getRes.statusCode, 200);
      assert.strictEqual(getRes.body.email, 't1-f1-03-updated@example.com');
    }
  },
  'TC-T1-F1-04': {
    name: 'Delete User Profile - Success (200 OK / 204 No Content)',
    run: async ({ agent }) => {
      assert.ok(global.t1User1Id, 'Previous user ID is required');
      const res = await agent.delete(`/api/users/${global.t1User1Id}`);
      
      assert.ok(res.statusCode === 200 || res.statusCode === 204);
    }
  },
  'TC-T1-F1-05': {
    name: 'Retrieve Deleted User - Error (404 Not Found)',
    run: async ({ agent }) => {
      assert.ok(global.t1User1Id, 'Previous user ID is required');
      const res = await agent.get(`/api/users/${global.t1User1Id}`);
      
      assert.strictEqual(res.statusCode, 404);
    }
  }
};
