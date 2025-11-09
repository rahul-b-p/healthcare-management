import request from 'supertest';
import app from '../../src/test-app';

describe('Auth API Endpoints', () => {
  
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    password: 'Password@123',
    confirmPassword: 'Password@123',
    role: 'patient',
  };

  describe('POST /api/auth/sign-up', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/sign-up')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.name).toBe(testUser.name);
    });
  });

  describe('POST /api/auth/sign-in', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/sign-up').send(testUser);
    });

    it('should sign in with email and password', async () => {
      const response = await request(app)
        .post('/api/auth/sign-in')
        .send({
          email: testUser.email,
          phone: testUser.phone,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refershToken');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      await request(app).post('/api/auth/sign-up').send(testUser);
      
      const signInResponse = await request(app)
        .post('/api/auth/sign-in')
        .send({
          email: testUser.email,
          phone: testUser.phone,
          password: testUser.password,
        });

      refreshToken = signInResponse.body.data.refershToken;
    });

    it('should refresh access token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('x-refresh-token', refreshToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refershToken');
    });
  });
});