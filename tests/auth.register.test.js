const request = require('supertest');
const app = require('../src/app');
const { User } = require('../src/models');

describe('POST /api/auth/register', () => {
  const testEmail = `testuser_${Date.now()}@example.com`;
  afterAll(async () => {
    // Clean up test user
    await User.destroy({ where: { email: testEmail } });
  });

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: testEmail, password: 'TestPass123!' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', testEmail);
  });

  it('should not allow duplicate email registration', async () => {
    // First registration
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: testEmail, password: 'TestPass123!' });
    // Attempt duplicate registration
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: testEmail, password: 'TestPass123!' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Email already registered');
  });
}); 