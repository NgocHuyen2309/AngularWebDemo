const assert = require('assert');

module.exports = {
  'TC-T4-03': {
    name: 'Workload 3: User Profile Update and Opt-Out (Delete) lifecycle flow',
    run: async ({ agent }) => {
      const email = 't4-w3-lifecycle@example.com';
      
      // 1. Register user
      const registerRes = await agent
        .post('/api/users')
        .send({ email, date_of_birth: '1988-08-08' });
      assert.strictEqual(registerRes.statusCode, 201);
      const userId = registerRes.body.id;
      
      // 2. Update birth date
      const updatedDob = '1989-09-09';
      const updateRes = await agent
        .put(`/api/users/${userId}`)
        .send({ date_of_birth: updatedDob });
      assert.strictEqual(updateRes.statusCode, 200);
      assert.strictEqual(new Date(updateRes.body.date_of_birth).toISOString().split('T')[0], updatedDob);
      
      // 3. Confirm update persistence via GET
      const getRes = await agent.get(`/api/users/${userId}`);
      assert.strictEqual(getRes.statusCode, 200);
      assert.strictEqual(new Date(getRes.body.date_of_birth).toISOString().split('T')[0], updatedDob);
      
      // 4. Delete user
      const deleteRes = await agent.delete(`/api/users/${userId}`);
      assert.ok(deleteRes.statusCode === 200 || deleteRes.statusCode === 204);
      
      // 5. Verify user is gone
      const verifyRes = await agent.get(`/api/users/${userId}`);
      assert.strictEqual(verifyRes.statusCode, 404);
    }
  }
};
