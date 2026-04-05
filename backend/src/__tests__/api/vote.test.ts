/**
 * API tests: Vote (cast, duplicate prevention, requireAuth, closed).
 */
import request from 'supertest';
import { app } from '../../app.js';
import { globalSetup, globalTeardown } from '../globalSetup.js';

const BASE = '/api/polls';

beforeAll(globalSetup, 15000);
afterAll(globalTeardown, 10000);

describe('Vote API', () => {
  let accessToken: string;
  let pollId: string;
  let optionIds: string[];

  beforeAll(async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({
        email: `vote-test-${Date.now()}@example.com`,
        password: 'password123',
        name: 'Vote Test User',
      })
      .expect(201);
    accessToken = reg.body.data.tokens.accessToken;

    const pollPayload = {
      title: 'Vote Test Poll ' + Date.now(),
      options: [{ text: 'A' }, { text: 'B' }],
      settings: { allowMultiple: false, ipRestriction: true },
    };
    const createRes = await request(app)
      .post(BASE)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(pollPayload)
      .expect(201);
    pollId = createRes.body.data.poll.id;
    optionIds = createRes.body.data.poll.options.map((o: { id: string }) => o.id);
  });

  describe('POST /api/polls/:id/vote', () => {
    it('casts vote with optionId and sessionId', async () => {
      const sessionId = 'sess-' + Date.now();
      const res = await request(app)
        .post(`${BASE}/${pollId}/vote`)
        .send({ optionId: optionIds[0], sessionId })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.vote).toMatchObject({ pollId, optionId: optionIds[0] });
      expect(res.body.data.results.totalVotes).toBe(1);
    });

    it('returns 400 for duplicate vote (same sessionId)', async () => {
      const dupPollRes = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Dup Test Poll ' + Date.now(),
          options: [{ text: 'A' }, { text: 'B' }],
          settings: { ipRestriction: false },
        })
        .expect(201);
      const dupPollId = dupPollRes.body.data.poll.id;
      const dupOptionIds = dupPollRes.body.data.poll.options.map((o: { id: string }) => o.id);
      const sessionId = 'sess-dup-' + Date.now();
      await request(app)
        .post(`${BASE}/${dupPollId}/vote`)
        .send({ optionId: dupOptionIds[0], sessionId })
        .expect(201);

      const res = await request(app)
        .post(`${BASE}/${dupPollId}/vote`)
        .send({ optionId: dupOptionIds[1], sessionId })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/already voted/i);
    });

    it('returns 400 for invalid optionId', async () => {
      const res = await request(app)
        .post(`${BASE}/${pollId}/vote`)
        .send({ optionId: 'invalid-option-id', sessionId: 'sess-x' })
        .expect(400);
      expect(res.body.error).toBe('Invalid option');
    });

    it('returns 404 for invalid poll id', async () => {
      const res = await request(app)
        .post(`${BASE}/nonexistent-poll-id/vote`)
        .send({ optionId: optionIds[0], sessionId: 'sess-y' })
        .expect(404);
      expect(res.body.error).toBe('Poll not found');
    });

    it('returns 400 when optionId missing', async () => {
      const res = await request(app)
        .post(`${BASE}/${pollId}/vote`)
        .send({ sessionId: 'sess-z' })
        .expect(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('allowMultiple poll', () => {
    let multiPollId: string;
    let multiOptionIds: string[];

    beforeAll(async () => {
      const createRes = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Multi Vote Poll ' + Date.now(),
          options: [{ text: 'X' }, { text: 'Y' }],
          settings: { allowMultiple: true, ipRestriction: false },
        })
        .expect(201);
      multiPollId = createRes.body.data.poll.id;
      multiOptionIds = createRes.body.data.poll.options.map((o: { id: string }) => o.id);
    });

    it('allows voting for multiple options with same session', async () => {
      const sessionId = 'sess-multi-' + Date.now();
      await request(app)
        .post(`${BASE}/${multiPollId}/vote`)
        .send({ optionId: multiOptionIds[0], sessionId })
        .expect(201);
      const res = await request(app)
        .post(`${BASE}/${multiPollId}/vote`)
        .send({ optionId: multiOptionIds[1], sessionId })
        .expect(201);
      expect(res.body.data.results.totalVotes).toBe(2);
    });

    it('returns 400 when voting same option again', async () => {
      const sessionId = 'sess-multi-dup-' + Date.now();
      await request(app)
        .post(`${BASE}/${multiPollId}/vote`)
        .send({ optionId: multiOptionIds[0], sessionId })
        .expect(201);
      const res = await request(app)
        .post(`${BASE}/${multiPollId}/vote`)
        .send({ optionId: multiOptionIds[0], sessionId })
        .expect(400);
      expect(res.body.error).toMatch(/already voted/i);
    });
  });

  describe('requireAuth poll', () => {
    let requireAuthPollId: string;
    let requireAuthOptionId: string;

    beforeAll(async () => {
      const createRes = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Require Auth Poll ' + Date.now(),
          options: [{ text: 'Only A' }, { text: 'Only B' }],
          settings: { requireAuth: true },
        })
        .expect(201);
      requireAuthPollId = createRes.body.data.poll.id;
      requireAuthOptionId = createRes.body.data.poll.options[0].id;
    });

    it('returns 401 when unauthenticated', async () => {
      const res = await request(app)
        .post(`${BASE}/${requireAuthPollId}/vote`)
        .send({ optionId: requireAuthOptionId, sessionId: 'sess-unauth' })
        .expect(401);
      expect(res.body.error).toBe('Authentication required to vote');
    });

    it('returns 201 when authenticated', async () => {
      const res = await request(app)
        .post(`${BASE}/${requireAuthPollId}/vote`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ optionId: requireAuthOptionId, sessionId: 'sess-auth-' + Date.now() })
        .expect(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('closed poll', () => {
    let closedPollId: string;
    let closedOptionId: string;

    beforeAll(async () => {
      const createRes = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Closed Poll ' + Date.now(),
          options: [{ text: 'C' }, { text: 'D' }],
        })
        .expect(201);
      closedPollId = createRes.body.data.poll.id;
      closedOptionId = createRes.body.data.poll.options[0].id;
      await request(app)
        .post(`${BASE}/${closedPollId}/close`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('returns 400 when voting on closed poll', async () => {
      const res = await request(app)
        .post(`${BASE}/${closedPollId}/vote`)
        .send({ optionId: closedOptionId, sessionId: 'sess-closed' })
        .expect(400);
      expect(res.body.error).toBe('Poll is closed');
    });
  });
});
