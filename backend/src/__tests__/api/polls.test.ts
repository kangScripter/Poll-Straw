/**
 * API tests: Polls CRUD, get by id/shareUrl, results, update, delete, close.
 */
import request from 'supertest';
import { app } from '../../app';
import { globalSetup, globalTeardown } from '../globalSetup';

const BASE = '/api/polls';

beforeAll(globalSetup, 15000);
afterAll(globalTeardown, 10000);

const createPollPayload = (overrides = {}) => ({
  title: 'Test Poll ' + Date.now(),
  description: 'Test description',
  options: [
    { text: 'Option A' },
    { text: 'Option B', emoji: '👍' },
  ],
  settings: { allowMultiple: false, ipRestriction: true },
  ...overrides,
});

describe('Polls API', () => {
  let accessToken: string;
  let pollId: string;
  let shareUrl: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: `poll-test-${Date.now()}@example.com`,
        password: 'password123',
        name: 'Poll Test User',
      })
      .expect(201);
    accessToken = res.body.data.tokens.accessToken;
  });

  describe('POST /api/polls', () => {
    it('creates poll with valid payload (authenticated)', async () => {
      const payload = createPollPayload();
      const res = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.poll).toMatchObject({
        title: payload.title,
        description: payload.description,
        allowMultiple: payload.settings.allowMultiple,
      });
      expect(res.body.data.poll).toHaveProperty('id');
      expect(res.body.data.poll).toHaveProperty('shareUrl');
      expect(res.body.data.poll.options).toHaveLength(2);
      pollId = res.body.data.poll.id;
      shareUrl = res.body.data.poll.shareUrl;
    });

    it('creates poll without auth (optionalAuth)', async () => {
      const payload = createPollPayload({ title: 'Anon Poll ' + Date.now() });
      const res = await request(app)
        .post(BASE)
        .send(payload)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.poll.creatorId).toBeNull();
    });

    it('returns 400 for title too short', async () => {
      const res = await request(app)
        .post(BASE)
        .send(createPollPayload({ title: 'ab' }))
        .expect(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 for single option', async () => {
      const res = await request(app)
        .post(BASE)
        .send({
          title: 'Single',
          options: [{ text: 'Only one' }],
        })
        .expect(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/polls/:id', () => {
    it('returns poll by id', async () => {
      const res = await request(app).get(`${BASE}/${pollId}`).expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.poll.id).toBe(pollId);
      expect(res.body.data.poll.options).toHaveLength(2);
      expect(res.body.data.poll).toHaveProperty('totalVotes');
      expect(res.body.data.poll).toHaveProperty('viewCount');
    });

    it('returns poll by shareUrl in :id', async () => {
      const res = await request(app).get(`${BASE}/${shareUrl}`).expect(200);
      expect(res.body.data.poll.shareUrl).toBe(shareUrl);
    });

    it('returns 404 for invalid id', async () => {
      const res = await request(app).get(`${BASE}/nonexistent-id-12345`).expect(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Poll not found');
    });
  });

  describe('GET /api/polls/share/:shareUrl', () => {
    it('returns poll by shareUrl', async () => {
      const res = await request(app).get(`${BASE}/share/${shareUrl}`).expect(200);
      expect(res.body.data.poll.shareUrl).toBe(shareUrl);
    });
  });

  describe('GET /api/polls/:id/results', () => {
    it('returns results for poll', async () => {
      const res = await request(app).get(`${BASE}/${pollId}/results`).expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.results).toHaveProperty('options');
      expect(res.body.data.results).toHaveProperty('totalVotes');
    });
  });

  describe('PUT /api/polls/:id', () => {
    it('returns 401 without token', async () => {
      await request(app)
        .put(`${BASE}/${pollId}`)
        .send({ title: 'Updated' })
        .expect(401);
    });

    it('updates poll when no votes exist', async () => {
      const payload = createPollPayload({ title: 'Fresh Poll ' + Date.now() });
      const createRes = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload)
        .expect(201);
      const id = createRes.body.data.poll.id;

      const res = await request(app)
        .put(`${BASE}/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(res.body.data.poll.title).toBe('Updated Title');
    });

    it('returns 400 when poll has votes', async () => {
      const payload = createPollPayload({ title: 'Voted Poll ' + Date.now() });
      const createRes = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload)
        .expect(201);
      const id = createRes.body.data.poll.id;
      const optionId = createRes.body.data.poll.options[0].id;

      await request(app)
        .post(`${BASE}/${id}/vote`)
        .send({ optionId, sessionId: 'sess-put-test' })
        .expect(201);

      const res = await request(app)
        .put(`${BASE}/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ title: 'Should Fail' })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Cannot modify poll with existing votes');
    });
  });

  describe('POST /api/polls/:id/close', () => {
    it('returns 401 without token', async () => {
      await request(app).post(`${BASE}/${pollId}/close`).expect(401);
    });

    it('closes poll as creator', async () => {
      const payload = createPollPayload({ title: 'To Close ' + Date.now() });
      const createRes = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload)
        .expect(201);
      const id = createRes.body.data.poll.id;

      const res = await request(app)
        .post(`${BASE}/${id}/close`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.poll.isActive).toBe(false);
    });
  });

  describe('DELETE /api/polls/:id', () => {
    it('returns 401 without token', async () => {
      await request(app).delete(`${BASE}/${pollId}`).expect(401);
    });

    it('deletes own poll', async () => {
      const payload = createPollPayload({ title: 'To Delete ' + Date.now() });
      const createRes = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(payload)
        .expect(201);
      const id = createRes.body.data.poll.id;

      await request(app)
        .delete(`${BASE}/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const getRes = await request(app).get(`${BASE}/${id}`).expect(404);
      expect(getRes.body.error).toBe('Poll not found');
    });
  });
});
