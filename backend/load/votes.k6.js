/**
 * k6 load test: concurrent votes on a single poll.
 * Usage: k6 run backend/load/votes.k6.js
 * Or: k6 run --env API_URL=https://apis.pollstraw.com --env VUS=50 backend/load/votes.k6.js
 * Optional: set POLL_ID and OPTION_IDS (comma-separated) to hit an existing poll; otherwise script creates one per VU.
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

const API_URL = __ENV.API_URL || 'http://localhost:3000/api';
const VUS = __ENV.VUS || 50;
const POLL_ID = __ENV.POLL_ID || '';
const OPTION_IDS = __ENV.OPTION_IDS ? __ENV.OPTION_IDS.split(',') : [];

export const options = {
  vus: VUS,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<3000'],
  },
};

function login() {
  const email = `load-${Date.now()}-${__VU}@example.com`;
  const res = http.post(`${API_URL}/auth/register`, JSON.stringify({
    email,
    password: 'password123',
    name: 'Load User',
  }), { headers: { 'Content-Type': 'application/json' } });
  if (res.status !== 201) return null;
  return res.json('data.tokens.accessToken');
}

function createPoll(token) {
  const res = http.post(`${API_URL}/polls`, JSON.stringify({
    title: `Load poll ${Date.now()}`,
    options: [{ text: 'A' }, { text: 'B' }],
  }), { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } });
  if (res.status !== 201) return null;
  const body = res.json();
  const pollId = body.data.poll.id;
  const optionIds = body.data.poll.options.map(o => o.id);
  return { pollId, optionIds };
}

function vote(pollId, optionId, sessionId) {
  const res = http.post(`${API_URL}/polls/${pollId}/vote`, JSON.stringify({
    optionId,
    sessionId,
  }), { headers: { 'Content-Type': 'application/json' } });
  return res;
}

export default function () {
  let pollId = POLL_ID;
  let optionIds = OPTION_IDS.length ? OPTION_IDS : [];

  if (!pollId || !optionIds.length) {
    const token = login();
    if (!token) return;
    const created = createPoll(token);
    if (!created) return;
    pollId = created.pollId;
    optionIds = created.optionIds;
  }

  const optionId = optionIds[__VU % optionIds.length];
  const sessionId = `load-sess-${__VU}-${Date.now()}`;
  const res = vote(pollId, optionId, sessionId);

  check(res, { 'vote status 201 or 400': r => r.status === 201 || r.status === 400 });
  sleep(0.5);
}

/**
 * Export summary to load/summary.txt for report generation.
 * See: https://k6.io/docs/results-output/end-of-test/custom-summary/
 */
export function handleSummary(data) {
  const text = textSummary(data, { indent: ' ', enableColors: false });
  return {
    'load/summary.txt': text,
    stdout: text,
  };
}
