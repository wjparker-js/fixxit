const request = require('supertest');
const app = require('../src/app');
const { User } = require('../src/models');

describe('POST /api/auth/login', () => {
  const testEmail = `testlogin_${Date.now()}@example.com`;
  const testPassword = 'TestPass123!';

  beforeAll(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Login User', email: testEmail, password: testPassword });
  });

  afterAll(async () => {
    await User.destroy({ where: { email: testEmail } });
  });

  it('should login successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', testEmail);
  });

  it('should fail login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'WrongPassword!' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('should fail login with non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'AnyPassword!' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });
}); 