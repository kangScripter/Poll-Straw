# Backend tests

## API tests (Jest + Supertest)

- **Prerequisites:** Copy `.env.test.example` to `.env.test` and set `DATABASE_URL` and `REDIS_URL` to a **test** database and Redis instance. Ensure `JWT_SECRET` and `JWT_REFRESH_SECRET` are at least 32 characters. If `.env.test` is missing, `.env` is used (use a test DB to avoid touching production).
- **Run:** `npm test`
- **Scope:** Smoke, Auth, Polls, Vote, User API tests. Socket tests start the HTTP server and require the same env.

## Load test (k6)

- **Prerequisites:** Install [k6](https://k6.io/docs/getting-started/installation/). Server must be running (e.g. `npm run dev` or deployed API).
- **Run (automated, generates report):**  
  `npm run load-test`  
  This runs k6 and writes **`load/LOAD_REPORT.md`** with summary and full output.
- **Run (manual):**  
  - Local: `k6 run load/votes.k6.js`  
  - Remote: `k6 run --env API_URL=https://apis.pollstraw.com --env VUS=50 load/votes.k6.js`
- **Optional env:** `API_URL`, `VUS`, `POLL_ID`, `OPTION_IDS` (comma-separated) to target an existing poll.

## Regression suite order

Smoke -> Auth -> Polls -> Vote -> User -> Socket. Concurrency/load run separately via k6.
