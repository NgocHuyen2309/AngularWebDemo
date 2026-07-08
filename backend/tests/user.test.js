const request = require('supertest');
const app = require('../app');
const dbHelper = require('./helpers/db.helper');
const { User } = require('../models/user.model');

beforeAll(async () => {
  await dbHelper.connect();
});

afterAll(async () => {
  await dbHelper.close();
});

beforeEach(async () => {
  await dbHelper.clear();
});

describe('User CRUD API', () => {
  test('POST /api/users - success', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', date_of_birth: '1990-01-01' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe('test@example.com');
  });

  test('POST /api/users - invalid email', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'invalid-email', date_of_birth: '1990-01-01' });
    expect(res.statusCode).toBe(400);
  });

  test('POST /api/users - duplicate email', async () => {
    await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', date_of_birth: '1990-01-01' });
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', date_of_birth: '1995-05-05' });
    expect(res.statusCode).toBe(409);
  });

  test('POST /api/users - future birth date', async () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'future@example.com', date_of_birth: futureDate.toISOString() });
    expect(res.statusCode).toBe(400);
  });

  test('GET /api/users/:id - success', async () => {
    const createRes = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', date_of_birth: '1990-01-01' });
    const userId = createRes.body.id;

    const res = await request(app).get(`/api/users/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('test@example.com');
  });

  test('GET /api/users/:id - not found', async () => {
    const res = await request(app).get('/api/users/999');
    expect(res.statusCode).toBe(404);
  });

  test('GET /api/users/:id - invalid ID parameter', async () => {
    // string
    let res = await request(app).get('/api/users/abc');
    expect(res.statusCode).toBe(400);
    // float
    res = await request(app).get('/api/users/1.5');
    expect(res.statusCode).toBe(400);
    // negative
    res = await request(app).get('/api/users/-5');
    expect(res.statusCode).toBe(400);
  });

  // PUT tests
  test('PUT /api/users/:id - success', async () => {
    const createRes = await request(app)
      .post('/api/users')
      .send({ email: 'original@example.com', date_of_birth: '1990-01-01' });
    const userId = createRes.body.id;

    const res = await request(app)
      .put(`/api/users/${userId}`)
      .send({ email: 'updated@example.com', date_of_birth: '1995-05-05' });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('updated@example.com');
    expect(new Date(res.body.date_of_birth).toISOString().split('T')[0]).toBe('1995-05-05');
  });

  test('PUT /api/users/:id - email conflict', async () => {
    await request(app)
      .post('/api/users')
      .send({ email: 'user1@example.com', date_of_birth: '1990-01-01' });
    const createRes2 = await request(app)
      .post('/api/users')
      .send({ email: 'user2@example.com', date_of_birth: '1990-01-01' });
    const user2Id = createRes2.body.id;

    const res = await request(app)
      .put(`/api/users/${user2Id}`)
      .send({ email: 'user1@example.com' });
    expect(res.statusCode).toBe(409);
  });

  test('PUT /api/users/:id - invalid validation (email, birth date, ID)', async () => {
    const createRes = await request(app)
      .post('/api/users')
      .send({ email: 'user@example.com', date_of_birth: '1990-01-01' });
    const userId = createRes.body.id;

    // Invalid email
    let res = await request(app)
      .put(`/api/users/${userId}`)
      .send({ email: 'bad-email' });
    expect(res.statusCode).toBe(400);

    // Future birth date
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    res = await request(app)
      .put(`/api/users/${userId}`)
      .send({ date_of_birth: futureDate.toISOString() });
    expect(res.statusCode).toBe(400);

    // Invalid user ID
    res = await request(app)
      .put('/api/users/abc')
      .send({ email: 'valid@example.com' });
    expect(res.statusCode).toBe(400);
  });

  test('PUT /api/users/:id - non-existent user', async () => {
    const res = await request(app)
      .put('/api/users/999')
      .send({ email: 'doesnotexist@example.com' });
    expect(res.statusCode).toBe(404);
  });

  // DELETE tests
  test('DELETE /api/users/:id - success', async () => {
    const createRes = await request(app)
      .post('/api/users')
      .send({ email: 'delete@example.com', date_of_birth: '1990-01-01' });
    const userId = createRes.body.id;

    const deleteRes = await request(app).delete(`/api/users/${userId}`);
    expect(deleteRes.statusCode).toBe(200);

    const getRes = await request(app).get(`/api/users/${userId}`);
    expect(getRes.statusCode).toBe(404);
  });

  test('DELETE /api/users/:id - non-existent user', async () => {
    const res = await request(app).delete('/api/users/999');
    expect(res.statusCode).toBe(404);
  });

  test('DELETE /api/users/:id - invalid ID parameter', async () => {
    const res = await request(app).delete('/api/users/abc');
    expect(res.statusCode).toBe(400);
  });
});
