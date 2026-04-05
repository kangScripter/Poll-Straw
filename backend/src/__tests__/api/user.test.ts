/**
 * API tests: User profile (GET/PUT), GET /api/user/polls.
 */
import request from 'supertest';
import { app } from '../../app.js';
import { globalSetup, globalTeardown } from '../globalSetup.js';

const AUTH_BASE = '/api/auth';
const USER_BASE = '/api/user';

beforeAll(globalSetup, 15000);
afterAll(globalTeardown, 10000);

describe('User API', () => {
  let accessToken: string;
  const testUser = {
    email: `user-test-${Date.now()}@example.com`,
    password: 'password123',
    name: 'User Test',
  };

  beforeAll(async () => {
    const res = await request(app)
      .post(`${AUTH_BASE}/register`)
      .send(testUser)
      .expect(201);
    accessToken = res.body.data.tokens.accessToken;
  });

  describe('GET /api/user/profile', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get(`${USER_BASE}/profile`).expect(401);
      expect(res.body.error).toBe('Access token required');
    });

    it('returns profile with token', async () => {
      const res = await request(app)
        .get(`${USER_BASE}/profile`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toMatchObject({ email: testUser.email, name: testUser.name });
      expect(res.body.data.user).toHaveProperty('pollsCount');
      expect(res.body.data.user).toHaveProperty('votesCount');
    });
  });

  describe('PUT /api/user/profile', () => {
    it('returns 401 without token', async () => {
      await request(app)
        .put(`${USER_BASE}/profile`)
        .send({ name: 'New Name' })
        .expect(401);
    });

    it('updates name', async () => {
      const res = await request(app)
        .put(`${USER_BASE}/profile`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(res.body.data.user.name).toBe('Updated Name');
    });
  });

  describe('GET /api/user/polls', () => {
    it('returns 401 without token', async () => {
      await request(app).get(`${USER_BASE}/polls`).expect(401);
    });

    it('returns paginated creator polls', async () => {
      const res = await request(app)
        .get(`${USER_BASE}/polls`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('pagination');
      expect(Array.isArray(res.body.data.data)).toBe(true);
      expect(res.body.data.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: expect.any(Number),
        totalPages: expect.any(Number),
      });
    });
  });
});
