# AppVote (PollStraw) Backend – Test Report

**Generated:** 2025-03-01  
**Environment:** `.env.test` (test database + Redis)  
**Command:** `npm test -- --verbose`

---

## Summary

| Metric | Value |
|--------|--------|
| **Test suites** | 6 passed, 6 total |
| **Tests** | **55 passed**, 55 total |
| **Status** | All tests passing |
| **Total time** | ~66 s |

---

## Suite Results

### 1. User API (`src/__tests__/api/user.test.ts`)

| Test | Status | Notes |
|------|--------|--------|
| GET /api/user/profile – returns 401 without token | Pass | |
| GET /api/user/profile – returns profile with token | Pass | |
| PUT /api/user/profile – returns 401 without token | Pass | |
| PUT /api/user/profile – updates name | Pass | |
| GET /api/user/polls – returns 401 without token | Pass | |
| GET /api/user/polls – returns paginated creator polls | Pass | |

**Total:** 6/6 passed.

---

### 2. Smoke / Health (`src/__tests__/api/smoke.test.ts`)

| Test | Status | Notes |
|------|--------|--------|
| GET /api/health returns healthy | Pass | |
| Registers and gets token | Pass | |
| Creates a poll | Pass | |
| Gets poll by id | Pass | |
| Casts a vote | Pass | |
| Gets results | Pass | |

**Total:** 6/6 passed. Full flow: register → create poll → get poll → vote → results.

---

### 3. Auth API (`src/__tests__/api/auth.test.ts`)

| Test | Status | Notes |
|------|--------|--------|
| POST /register – registers with valid email, password, optional name | Pass | |
| POST /register – returns 400 for invalid email | Pass | |
| POST /register – returns 400 for password shorter than 8 | Pass | |
| POST /register – returns 409 for duplicate email | Pass | |
| POST /login – returns tokens for valid credentials | Pass | |
| POST /login – returns 401 for invalid password | Pass | |
| POST /login – returns 400 for missing password | Pass | |
| POST /refresh – returns new tokens for valid refresh token | Pass | |
| POST /refresh – returns 401 for invalid refresh token | Pass | |
| POST /refresh – returns 401 when reusing same refresh token after refresh | Pass | |
| POST /logout – returns 200 with or without body | Pass | |
| GET /me – returns 401 without token | Pass | |
| GET /me – returns user when valid token provided | Pass | |
| POST /change-password – returns 401 without token | Pass | |
| POST /change-password – returns 200 and changes password with valid token | Pass | |

**Total:** 15/15 passed.

---

### 4. Socket real-time events (`src/__tests__/socket/vote-update.test.ts`)

| Test | Status | Notes |
|------|--------|--------|
| Emits vote-update to clients in poll room when vote is cast | Pass | Two clients join room; POST vote; both receive `vote-update`. |
| Emits poll-closed to clients in poll room when poll is closed | Pass | Client joins room; POST close; client receives `poll-closed`. |

**Total:** 2/2 passed.  
**Note:** `broadcastPollClosed`

 was wired in the close-poll controller so `poll-closed` is emitted when a poll is closed.

---

### 5. Polls API (`src/__tests__/api/polls.test.ts`)

| Test | Status | Notes |
|------|--------|--------|
| POST /api/polls – creates poll with valid payload (authenticated) | Pass | |
| POST /api/polls – creates poll without auth (optionalAuth) | Pass | |
| POST /api/polls – returns 400 for title too short | Pass | |
| POST /api/polls – returns 400 for single option | Pass | |
| GET /api/polls/:id – returns poll by id | Pass | |
| GET /api/polls/:id – returns poll by shareUrl in :id | Pass | |
| GET /api/polls/:id – returns 404 for invalid id | Pass | |
| GET /api/polls/share/:shareUrl – returns poll by shareUrl | Pass | |
| GET /api/polls/:id/results – returns results for poll | Pass | |
| PUT /api/polls/:id – returns 401 without token | Pass | |
| PUT /api/polls/:id – updates poll when no votes exist | Pass | |
| PUT /api/polls/:id – returns 400 when poll has votes | Pass | |
| POST /api/polls/:id/close – returns 401 without token | Pass | |
| POST /api/polls/:id/close – closes poll as creator | Pass | |
| DELETE /api/polls/:id – returns 401 without token | Pass | |
| DELETE /api/polls/:id – deletes own poll | Pass | |

**Total:** 16/16 passed.

---

### 6. Vote API (`src/__tests__/api/vote.test.ts`)

| Test | Status | Notes |
|------|--------|--------|
| POST /api/polls/:id/vote – casts vote with optionId and sessionId | Pass | |
| POST /api/polls/:id/vote – returns 400 for duplicate vote (same sessionId) | Pass | Dedicated poll with `ipRestriction: false`. |
| POST /api/polls/:id/vote – returns 400 for invalid optionId | Pass | |
| POST /api/polls/:id/vote – returns 404 for invalid poll id | Pass | |
| POST /api/polls/:id/vote – returns 400 when optionId missing | Pass | |
| allowMultiple – allows voting for multiple options with same session | Pass | |
| allowMultiple – returns 400 when voting same option again | Pass | |
| requireAuth poll – returns 401 when unauthenticated | Pass | |
| requireAuth poll – returns 201 when authenticated | Pass | |
| closed poll – returns 400 when voting on closed poll | Pass | |

**Total:** 10/10 passed.

---

## Fixes Applied This Run

1. **Auth tests** – Each test that registers a user now uses a unique email (e.g. `dup-${Date.now()}@example.com`, `login-${Date.now()}@example.com`) so duplicate-email, login, refresh, me, and change-password tests do not conflict.
2. **Vote tests**  
   - **Duplicate vote** – Uses a dedicated poll with `ipRestriction: false` so the first vote returns 201 and the second (same sessionId) returns 400.  
   - **requireAuth / closed poll** – Create payloads use at least two options so poll creation returns 201.
3. **Socket**  
   - **poll-closed** – `broadcastPollClosed(id)` is now called from the close-poll controller after `closePoll`, so clients in the poll room receive `poll-closed`.  
   - Test waits for client to connect and join the room before closing the poll (with a short delay), and uses a single `connect` handler.

---

## Post-run Warning

- **Worker exit:** Jest may report “A worker process has failed to exit gracefully and has been force exited” due to open handles (e.g. server/sockets). Tests still complete with exit code 0. To investigate: `npm test -- --detectOpenHandles`.

---

## How to Run

```bash
cd backend
# Ensure .env.test (or .env) has DATABASE_URL and REDIS_URL for test DB/Redis
npm run db:push:test   # one-time: push Prisma schema to test DB
npm test               # run all tests
npm test -- --verbose  # verbose output
```

Load test (k6): see `backend/load/README.md`. Run `npm run load-test` to generate **`load/LOAD_REPORT.md`**.
