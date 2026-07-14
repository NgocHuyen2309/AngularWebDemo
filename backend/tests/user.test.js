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

describe('User CRUD API & Authentication', () => {
  test('POST /api/users - success', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'test@gmail.com', password: 'TestPass123!', date_of_birth: '1990-01-01' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe('test@gmail.com');
    expect(res.body).not.toHaveProperty('password');
  });

  test('POST /api/users - invalid email', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'invalid-email', password: 'TestPass123!', date_of_birth: '1990-01-01' });
    expect(res.statusCode).toBe(400);
  });

  test('POST /api/users - short or missing password', async () => {
    let res = await request(app)
      .post('/api/users')
      .send({ email: 'testpass@gmail.com', password: '123', date_of_birth: '1990-01-01' });
    expect(res.statusCode).toBe(400);

    res = await request(app)
      .post('/api/users')
      .send({ email: 'testpass@gmail.com', date_of_birth: '1990-01-01' });
    expect(res.statusCode).toBe(400);
  });

  test('POST /api/users - confirm password mismatch', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'testpass@gmail.com', password: 'TestPass123!', confirm_password: 'DifferentPass!', date_of_birth: '1990-01-01' });
    expect(res.statusCode).toBe(400);
  });

  test('POST /api/users - duplicate email', async () => {
    await request(app)
      .post('/api/users')
      .send({ email: 'test@gmail.com', password: 'TestPass123!', date_of_birth: '1990-01-01' });
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'test@gmail.com', password: 'TestPass123!', date_of_birth: '1995-05-05' });
    expect(res.statusCode).toBe(409);
  });

  test('POST /api/users - future birth date', async () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'future@gmail.com', password: 'TestPass123!', date_of_birth: futureDate.toISOString() });
    expect(res.statusCode).toBe(400);
  });

  test('POST /api/users/login - valid login and invalid credentials', async () => {
    await request(app)
      .post('/api/users')
      .send({ email: 'authuser@gmail.com', password: 'SecurePassword456', date_of_birth: '1990-01-01' });

    // Valid login
    let res = await request(app)
      .post('/api/users/login')
      .send({ email: 'authuser@gmail.com', password: 'SecurePassword456' });
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('authuser@gmail.com');

    // Wrong password
    res = await request(app)
      .post('/api/users/login')
      .send({ email: 'authuser@gmail.com', password: 'WrongPassword' });
    expect(res.statusCode).toBe(401);

    // Missing password
    res = await request(app)
      .post('/api/users/login')
      .send({ email: 'authuser@gmail.com' });
    expect(res.statusCode).toBe(400);

    // Non-existent user
    res = await request(app)
      .post('/api/users/login')
      .send({ email: 'nobody@gmail.com', password: 'SecurePassword456' });
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/users/:id - success', async () => {
    const createRes = await request(app)
      .post('/api/users')
      .send({ email: 'test@gmail.com', password: 'TestPass123!', date_of_birth: '1990-01-01' });
    const userId = createRes.body.id;

    const res = await request(app).get(`/api/users/${userId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('test@gmail.com');
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
  test('PUT /api/users/:id - success including password update', async () => {
    const createRes = await request(app)
      .post('/api/users')
      .send({ email: 'original@gmail.com', password: 'TestPass123!', date_of_birth: '1990-01-01' });
    const userId = createRes.body.id;

    const res = await request(app)
      .put(`/api/users/${userId}`)
      .send({ email: 'updated@gmail.com', password: 'NewSecurePass888!', date_of_birth: '1995-05-05' });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('updated@gmail.com');
    expect(new Date(res.body.date_of_birth).toISOString().split('T')[0]).toBe('1995-05-05');

    // Verify login works with new password
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({ email: 'updated@gmail.com', password: 'NewSecurePass888!' });
    expect(loginRes.statusCode).toBe(200);
  });

  test('PUT /api/users/:id - email conflict', async () => {
    await request(app)
      .post('/api/users')
      .send({ email: 'user1@gmail.com', password: 'TestPass123!', date_of_birth: '1990-01-01' });
    const createRes2 = await request(app)
      .post('/api/users')
      .send({ email: 'user2@gmail.com', password: 'TestPass123!', date_of_birth: '1990-01-01' });
    const user2Id = createRes2.body.id;

    const res = await request(app)
      .put(`/api/users/${user2Id}`)
      .send({ email: 'user1@gmail.com' });
    expect(res.statusCode).toBe(409);
  });

  test('PUT /api/users/:id - invalid validation (email, birth date, ID)', async () => {
    const createRes = await request(app)
      .post('/api/users')
      .send({ email: 'user@gmail.com', password: 'TestPass123!', date_of_birth: '1990-01-01' });
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
      .send({ email: 'valid@gmail.com' });
    expect(res.statusCode).toBe(400);
  });

  test('PUT /api/users/:id - non-existent user', async () => {
    const res = await request(app)
      .put('/api/users/999')
      .send({ email: 'doesnotexist@gmail.com' });
    expect(res.statusCode).toBe(404);
  });

  // DELETE tests
  test('DELETE /api/users/:id - success', async () => {
    const createRes = await request(app)
      .post('/api/users')
      .send({ email: 'delete@gmail.com', password: 'TestPass123!', date_of_birth: '1990-01-01' });
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
