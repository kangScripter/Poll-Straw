/**
 * Socket tests: vote-update and poll-closed events.
 * Server must be listening; this file starts httpServer.listen(0) so socket.io-client can connect.
 */
import request from 'supertest';
import { io as ioClient } from 'socket.io-client';
import { app, httpServer } from '../../app';
import { globalSetup, globalTeardown } from '../globalSetup';

beforeAll(async () => {
  await globalSetup();
  await new Promise<void>((resolve) => {
    httpServer.listen(0, () => resolve());
  });
}, 15000);

afterAll(async () => {
  await new Promise<void>((resolve) => {
    const done = () => { resolve(); };
    httpServer.close(done);
    setTimeout(done, 8000);
  });
  await globalTeardown();
}, 15000);

describe('Socket real-time events', () => {
  let accessToken: string;
  let pollId: string;
  let optionId: string;
  let port: number;

  beforeAll(async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({
        email: `socket-test-${Date.now()}@example.com`,
        password: 'password123',
        name: 'Socket Test',
      })
      .expect(201);
    accessToken = reg.body.data.tokens.accessToken;

    const createRes = await request(app)
      .post('/api/polls')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Socket Poll ' + Date.now(),
        options: [{ text: 'A' }, { text: 'B' }],
      })
      .expect(201);
    pollId = createRes.body.data.poll.id;
    optionId = createRes.body.data.poll.options[0].id;

    const addr = httpServer.address();
    port = typeof addr === 'object' && addr !== null ? addr.port : 3000;
  });

  it('emits vote-update to clients in poll room when vote is cast', (done) => {
    const url = `http://127.0.0.1:${port}`;
    const client1 = ioClient(url, { transports: ['websocket', 'polling'], forceNew: true });
    const client2 = ioClient(url, { transports: ['websocket', 'polling'], forceNew: true });

    let received = 0;
    const onVoteUpdate = (payload: { totalVotes?: number }) => {
      expect(payload).toHaveProperty('totalVotes');
      expect(payload.totalVotes).toBe(1);
      received++;
      if (received === 2) {
        client1.close();
        client2.close();
        done();
      }
    };

    client1.on('vote-update', onVoteUpdate);
    client2.on('vote-update', onVoteUpdate);

    client1.on('connect', () => client1.emit('join-poll', { pollId }));
    client2.on('connect', () => client2.emit('join-poll', { pollId }));

    Promise.all([
      new Promise<void>((r) => { client1.on('connect', () => r()); }),
      new Promise<void>((r) => { client2.on('connect', () => r()); }),
    ]).then(() => {
      request(app)
        .post(`/api/polls/${pollId}/vote`)
        .send({ optionId, sessionId: 'socket-test-sess' })
        .expect(201)
        .end(() => {});
    });
  }, 10000);

  it('emits poll-closed to clients in poll room when poll is closed', (done) => {
    request(app)
      .post('/api/polls')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'To Close Socket ' + Date.now(),
        options: [{ text: 'X' }, { text: 'Y' }],
      })
      .expect(201)
      .then((createRes) => {
        const id = createRes.body.data.poll.id;
        const url = `http://127.0.0.1:${port}`;
        const client = ioClient(url, { transports: ['websocket', 'polling'], forceNew: true });

        client.on('poll-closed', (payload: { pollId: string }) => {
          expect(payload.pollId).toBe(id);
          client.close();
          done();
        });

        client.on('connect', () => {
          client.emit('join-poll', { pollId: id });
          // Allow server time to add client to room before closing poll
          setTimeout(() => {
            request(app)
              .post(`/api/polls/${id}/close`)
              .set('Authorization', `Bearer ${accessToken}`)
              .expect(200)
              .end(() => {});
          }, 150);
        });
      });
  }, 15000);
});
