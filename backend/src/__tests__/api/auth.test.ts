/**
 * API tests: Auth (register, login, refresh, logout, me, change-password).
 * Uses Supertest against the app exported from app.ts (no listen).
 */
import request from 'supertest';
import { app } from '../../app.js';
import { globalSetup, globalTeardown } from '../globalSetup.js';

const BASE = '/api/auth';

beforeAll(globalSetup, 15000);
afterAll(globalTeardown, 10000);

describe('Auth API', () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    name: 'Test User',
  };

  describe('POST /register', () => {
    it('registers with valid email, password, optional name', async () => {
      const res = await request(app)
        .post(`${BASE}/register`)
        .send(testUser)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Registration successful');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user).toMatchObject({ email: testUser.email, name: testUser.name });
      expect(res.body.data.user).not.toHaveProperty('password');
      expect(res.body.data).toHaveProperty('tokens');
      expect(res.body.data.tokens).toHaveProperty('accessToken');
      expect(res.body.data.tokens).toHaveProperty('refreshToken');
    });

    it('returns 400 for invalid email', async () => {
      const res = await request(app)
        .post(`${BASE}/register`)
        .send({ email: 'not-an-email', password: 'password123' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details).toBeDefined();
    });

    it('returns 400 for password shorter than 8', async () => {
      const res = await request(app)
        .post(`${BASE}/register`)
        .send({ email: 'a@b.com', password: 'short' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Validation failed');
    });

    it('returns 409 for duplicate email', async () => {
      const duplicateUser = { ...testUser, email: `dup-${Date.now()}@example.com` };
      await request(app).post(`${BASE}/register`).send(duplicateUser).expect(201);
      const res = await request(app)
        .post(`${BASE}/register`)
        .send(duplicateUser)
        .expect(409);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Email already registered');
    });
  });

  describe('POST /login', () => {
    it('returns tokens for valid credentials', async () => {
      const loginUser = { ...testUser, email: `login-${Date.now()}@example.com` };
      await request(app).post(`${BASE}/register`).send(loginUser).expect(201);

      const res = await request(app)
        .post(`${BASE}/login`)
        .send({ email: loginUser.email, password: loginUser.password })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('tokens');
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.tokens.refreshToken).toBeDefined();
    });

    it('returns 401 for invalid password', async () => {
      const invUser = { ...testUser, email: `inv-${Date.now()}@example.com` };
      await request(app).post(`${BASE}/register`).send(invUser).expect(201);

      const res = await request(app)
        .post(`${BASE}/login`)
        .send({ email: invUser.email, password: 'wrongpassword' })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Invalid email or password');
    });

    it('returns 400 for missing password', async () => {
      const res = await request(app)
        .post(`${BASE}/login`)
        .send({ email: testUser.email })
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /refresh', () => {
    it('returns new tokens for valid refresh token', async () => {
      const refUser = { ...testUser, email: `ref-${Date.now()}@example.com` };
      const reg = await request(app).post(`${BASE}/register`).send(refUser).expect(201);
      const refreshToken = reg.body.data.tokens.refreshToken;

      const res = await request(app)
        .post(`${BASE}/refresh`)
        .send({ refreshToken })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.tokens).toHaveProperty('accessToken');
      expect(res.body.data.tokens).toHaveProperty('refreshToken');
      expect(res.body.data.tokens.accessToken).not.toBe(reg.body.data.tokens.accessToken);
    });

    it('returns 401 for invalid refresh token', async () => {
      const res = await request(app)
        .post(`${BASE}/refresh`)
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/refresh token|invalid/i);
    });

    it('returns 401 when reusing same refresh token after refresh', async () => {
      const reuseUser = { ...testUser, email: `reuse-${Date.now()}@example.com` };
      const reg = await request(app).post(`${BASE}/register`).send(reuseUser).expect(201);
      const refreshToken = reg.body.data.tokens.refreshToken;

      await request(app).post(`${BASE}/refresh`).send({ refreshToken }).expect(200);
      const res = await request(app)
        .post(`${BASE}/refresh`)
        .send({ refreshToken })
        .expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /logout', () => {
    it('returns 200 with or without body', async () => {
      const res = await request(app).post(`${BASE}/logout`).send({}).expect(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /me', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get(`${BASE}/me`).expect(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Access token required');
    });

    it('returns user when valid token provided', async () => {
      const meUser = { ...testUser, email: `me-${Date.now()}@example.com` };
      const reg = await request(app).post(`${BASE}/register`).send(meUser).expect(201);
      const token = reg.body.data.tokens.accessToken;

      const res = await request(app)
        .get(`${BASE}/me`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toMatchObject({ email: meUser.email });
      expect(res.body.data.user).toHaveProperty('userId');
    });
  });

  describe('POST /change-password', () => {
    it('returns 401 without token', async () => {
      await request(app)
        .post(`${BASE}/change-password`)
        .send({ currentPassword: 'old', newPassword: 'newpassword123' })
        .expect(401);
    });

    it('returns 200 and changes password with valid token', async () => {
      const chpUser = { ...testUser, email: `chp-${Date.now()}@example.com` };
      const reg = await request(app).post(`${BASE}/register`).send(chpUser).expect(201);
      const token = reg.body.data.tokens.accessToken;

      await request(app)
        .post(`${BASE}/change-password`)
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: chpUser.password, newPassword: 'newpassword123' })
        .expect(200);

      const loginRes = await request(app)
        .post(`${BASE}/login`)
        .send({ email: chpUser.email, password: 'newpassword123' })
        .expect(200);
      expect(loginRes.body.success).toBe(true);
    });
  });
});
