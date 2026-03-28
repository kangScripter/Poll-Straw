/**
 * Smoke tests: health, login, create poll, get poll, cast vote, get results.
 */
import request from 'supertest';
import { app } from '../../app';
import { globalSetup, globalTeardown } from '../globalSetup';

beforeAll(globalSetup, 15000);
afterAll(globalTeardown, 10000);

describe('Smoke / Health', () => {
  it('GET /api/health returns healthy', async () => {
    const res = await request(app).get('/api/health').expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });
});

describe('Smoke flow: login, create poll, vote, results', () => {
  let token: string;
  let pollId: string;
  let optionId: string;

  it('registers and gets token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: `smoke-${Date.now()}@example.com`,
        password: 'password123',
        name: 'Smoke User',
      })
      .expect(201);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    token = res.body.data.tokens.accessToken;
  });

  it('creates a poll', async () => {
    const res = await request(app)
      .post('/api/polls')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Smoke Poll',
        options: [{ text: 'Yes' }, { text: 'No' }],
      })
      .expect(201);
    pollId = res.body.data.poll.id;
    optionId = res.body.data.poll.options[0].id;
  });

  it('gets poll by id', async () => {
    const res = await request(app).get(`/api/polls/${pollId}`).expect(200);
    expect(res.body.data.poll.id).toBe(pollId);
  });

  it('casts a vote', async () => {
    const res = await request(app)
      .post(`/api/polls/${pollId}/vote`)
      .send({ optionId, sessionId: 'smoke-sess' })
      .expect(201);
    expect(res.body.data.results.totalVotes).toBe(1);
  });

  it('gets results', async () => {
    const res = await request(app).get(`/api/polls/${pollId}/results`).expect(200);
    expect(res.body.data.results.totalVotes).toBe(1);
  });
});
