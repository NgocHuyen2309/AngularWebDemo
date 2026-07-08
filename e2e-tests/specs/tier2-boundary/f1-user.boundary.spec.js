const assert = require('assert');

module.exports = {
  'TC-T2-F1-01': {
    name: 'Register User - Invalid Email Format (400 Bad Request)',
    run: async ({ agent }) => {
      const res = await agent
        .post('/api/users')
        .send({ email: 'invalidemail.com', date_of_birth: '1990-01-01' });
      
      assert.strictEqual(res.statusCode, 400);
      assert.ok(res.body.error);
    }
  },
  'TC-T2-F1-02': {
    name: 'Register User - Duplicate Email (409 Conflict)',
    run: async ({ agent }) => {
      const email = 'duplicate-boundary@example.com';
      // First registration
      const res1 = await agent
        .post('/api/users')
        .send({ email, date_of_birth: '1990-01-01' });
      assert.strictEqual(res1.statusCode, 201);
      
      // Second registration with same email
      const res2 = await agent
        .post('/api/users')
        .send({ email, date_of_birth: '1995-05-05' });
      
      assert.strictEqual(res2.statusCode, 409);
      assert.ok(res2.body.error);
    }
  },
  'TC-T2-F1-03': {
    name: 'Register User - Invalid Date of Birth Format (400 Bad Request)',
    run: async ({ agent }) => {
      const res = await agent
        .post('/api/users')
        .send({ email: 'valid-email@example.com', date_of_birth: 'not-a-date' });
      
      assert.strictEqual(res.statusCode, 400);
      assert.ok(res.body.error);
    }
  },
  'TC-T2-F1-04': {
    name: 'CRUD Actions on Non-existent Sequential ID (404 Not Found)',
    run: async ({ agent }) => {
      const getRes = await agent.get('/api/users/99999');
      assert.strictEqual(getRes.statusCode, 404);
      
      const putRes = await agent.put('/api/users/99999').send({ email: 'update-none@example.com' });
      assert.strictEqual(putRes.statusCode, 404);
      
      const deleteRes = await agent.delete('/api/users/99999');
      assert.strictEqual(deleteRes.statusCode, 404);
    }
  },
  'TC-T2-F1-05': {
    name: 'Register User - Missing Required Fields (400 Bad Request)',
    run: async ({ agent }) => {
      const res = await agent
        .post('/api/users')
        .send({ email: 'missing-dob@example.com' });
      
      assert.strictEqual(res.statusCode, 400);
      assert.ok(res.body.error);
    }
  }
};
