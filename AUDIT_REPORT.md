# AppVote / PollStraw — Full Audit Report
*Date: 2026-03-28 | Audited: Backend + Mobile*

---

## PART 1 — BACKEND BUGS

### CRITICAL

#### B1. Password Reset Email NOT Implemented
- **File:** `backend/src/services/authService.ts` ~line 259
- **Issue:** `requestPasswordReset()` only `console.log`s the token. Users can never reset forgotten passwords in production.
- **Fix:** Integrate email provider (SendGrid / Nodemailer / AWS SES):
  ```ts
  await emailService.send({
    to: user.email,
    subject: 'Reset your password',
    html: `<a href="${env.FRONTEND_URL}/reset-password?token=${token}">Reset Password</a>`
  });
  ```

#### B2. JWT Refresh Token Expiry Calculation Bug
- **File:** `backend/src/utils/jwt.ts` ~line 73
- **Issue:** `parseInt('7d')` returns `NaN`, always falling back to 7 days. Config value `'14d'` or `'30d'` is silently ignored.
- **Fix:**
  ```ts
  const days = parseInt(env.JWT_REFRESH_EXPIRES_IN.match(/\d+/)?.[0] || '7') || 7;
  ```

#### B3. Redis Vote Cache Key Bug for allowMultiple Polls
- **File:** `backend/src/services/voteService.ts` ~lines 105, 170, 188, 197
- **Issue:** When `allowMultiple=true`, the identifier passed to `redisHelpers` is `${pollId}:${optionId}` but helpers expect a plain identifier. Duplicate prevention silently fails — users can vote multiple times for the same option.
- **Fix:** Use a flat key: `\`${pollId}_${optionId}\`` as the identifier when calling `markVoted`/`hasVoted`.

#### B4. Duplicate Vote Prevention Bypassed for Anonymous Users
- **File:** `backend/src/services/voteService.ts` ~line 168
- **Issue:** If `ipRestriction=true` but `ipAddress` resolves to `'unknown'`, the check `if (poll.ipRestriction && ipAddress)` still runs but matches nothing, allowing unrestricted anonymous voting.
- **Fix:**
  ```ts
  if (poll.ipRestriction && (!ipAddress || ipAddress === 'unknown')) {
    throw new AppError('Cannot verify your identity to prevent duplicate votes', 403);
  }
  ```

#### B5. Rate Limiter Key Bypass via Shared IPs
- **File:** `backend/src/middleware/rateLimiter.ts`
- **Issue:** `voteLimiter` keys on IP only. Multiple users behind NAT/proxy share the limit (unfair) or a single user using a rotating proxy can bypass it.
- **Fix:**
  ```ts
  keyGenerator: (req) => req.body?.sessionId || req.body?.deviceId || getClientIp(req)
  ```

---

### HIGH

#### B6. Cache Not Invalidated After Vote Deletion (Admin)
- **File:** `backend/src/services/voteService.ts` ~line 278
- **Issue:** `deleteVote()` clears results cache but NOT the Redis duplicate-check keys. After admin deletes a vote, the original voter is permanently blocked from voting again.
- **Fix:** After deleting the vote, also delete the Redis duplicate-check keys:
  ```ts
  await redisHelpers.markVoted(pollId, vote.ipAddress, 'ip', -1); // or del
  // repeat for sessionId, deviceId
  ```

#### B7. Voter PII Exposed to Poll Creators (IDOR)
- **File:** `backend/src/routes/pollRoutes.ts` line 22, `backend/src/controllers/voteController.ts`
- **Issue:** `GET /polls/:id/votes` is accessible to the poll creator AND returns raw `ipAddress`, `sessionId`, `deviceId` of voters — a serious privacy/IDOR issue.
- **Fix:** For creator role, redact PII fields. Only `adminOnly` should see raw tracking fields.

#### B8. Redis Pub/Sub Setup Not Awaited
- **File:** `backend/src/socket/socketHandler.ts` ~line 52
- **Issue:** `setupRedisPubSub()` is called but not `await`ed. Silent failure means real-time updates stop working.
- **Fix:** `await setupRedisPubSub();` or add `.catch(err => { throw err; })`.

#### B9. Race Condition in Poll Results Cache
- **File:** `backend/src/services/pollService.ts` ~lines 303–324
- **Issue:** Multiple concurrent requests can all miss the cache and hit the DB simultaneously (TOCTOU). No locking mechanism.
- **Fix:** Use Redis `SET NX PX` (SET if not exists) as a distributed lock before computing results.

#### B10. Unvalidated Search Input in Admin Users Endpoint
- **File:** `backend/src/controllers/adminController.ts` ~line 256
- **Issue:** `search` query param passed directly to Prisma `contains` with no Zod schema validation.
- **Fix:**
  ```ts
  const searchSchema = z.string().max(100).regex(/^[\w@.\s-]*$/).optional();
  const search = searchSchema.parse(req.query.search);
  ```

---

### MEDIUM

#### B11. Past Deadline Allowed on Poll Creation
- **File:** `backend/src/controllers/pollController.ts` ~line 27
- **Issue:** No validation that `deadline` is in the future. Polls can be created already-closed.
- **Fix:**
  ```ts
  deadline: z.string().datetime()
    .refine(d => new Date(d) > new Date(), { message: 'Deadline must be in the future' })
    .optional()
  ```

#### B12. Account Deletion Doesn't Anonymize Votes (GDPR)
- **File:** `backend/src/controllers/userController.ts` ~line 113
- **Issue:** Soft-delete only sets `isActive=false`. User ID still exists in Vote records. GDPR requires removal of personal data on deletion request.
- **Fix:** Anonymize or delete Vote records linking to the user. Nullify or transfer Poll records.

#### B13. Hardcoded Apple Team ID and Android SHA256 Fingerprint
- **File:** `backend/src/app.ts` ~lines 150, 168
- **Issue:** `TEAMID.com.pollstraw.mobile` and `YOUR_SHA256_FINGERPRINT` are placeholders — iOS and Android deep links are completely broken.
- **Fix:**
  ```ts
  appID: `${process.env.APPLE_TEAM_ID}.com.pollstraw.mobile`
  sha256_cert_fingerprints: [process.env.ANDROID_SHA256_FINGERPRINT]
  ```

#### B14. No Audit Logging for Admin Actions
- **Issue:** Admin actions (delete polls, update users, dismiss reports) leave no audit trail.
- **Fix:** Add a simple `AuditLog` model or structured log middleware for admin routes.

#### B15. Pagination Page Number Unbounded
- **File:** `backend/src/controllers/voteController.ts` ~line 48
- **Issue:** `page=9999999` is accepted; no upper bound validation.
- **Fix:** `const page = Math.max(1, Math.min(Number(req.query.page) || 1, 10000));`

---

### LOW

| # | File | Issue |
|---|------|-------|
| B16 | `app.ts` | Dev stack traces returned to clients in error responses |
| B17 | `socketHandler.ts` | `join-poll` event doesn't validate pollId format — garbage room names possible |
| B18 | `helpers.ts` | `isDeadlinePassed()` does not use `.getTime()` for reliable timestamp comparison |
| B19 | `authService.ts` | `Role` enum values hard-coded as strings instead of importing Prisma `Role` enum |
| B20 | `pollService.ts` | `formatPollWithResults` uses `poll: any` — TypeScript type safety bypassed |

---

## PART 2 — MOBILE UI BUGS

### CRITICAL / HIGH

#### M1. Auth Screens Accessible While Authenticated (Navigation Bug)
- **File:** `mobile/src/navigation/AppNavigator.tsx` ~line 181
- **Issue:** Auth screens (Login, Register) and MainTabs are in the same conditional block, making it possible to navigate to a login screen while already logged in without clearing the auth state.
- **Fix:** Use `navigation.reset()` after login/register to clear the auth stack. Separate auth and app navigators cleanly.

#### M2. `getResults` Method Missing from Poll Store
- **File:** `mobile/src/screens/poll/ResultsScreen.tsx` ~line 32
- **Issue:** Calls `usePollStore.getState().getResults()` which does not exist. **This is a runtime crash.**
- **Fix:** Replace with the correct method name (likely `fetchPoll` or add `getResults` that calls `pollApi.getResults()`).

#### M3. Double Vote Submission on Multi-Select
- **File:** `mobile/src/screens/poll/PollDetailScreen.tsx` ~lines 79–89
- **Issue:** No debounce or "submitting" flag on the vote submission loop. Rapid taps submit multiple concurrent vote requests.
- **Fix:**
  ```tsx
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmitVote = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try { /* ... vote loop ... */ } finally { setIsSubmitting(false); }
  };
  ```

#### M4. `isLoading` Never Reset After Successful Poll Creation
- **File:** `mobile/src/screens/poll/CreatePollScreen.tsx` ~line 157
- **Issue:** After `createPoll()` succeeds, the Alert appears but `setIsLoading(false)` is never called if user dismisses the alert and navigates back. Spinner stays forever.
- **Fix:** Call `setIsLoading(false)` inside the `finally` block.

#### M5. Swedish Locale Hardcoded in EditPollScreen
- **File:** `mobile/src/screens/poll/EditPollScreen.tsx` ~line 44
- **Issue:** `toLocaleString('sv-SE')` hardcoded — dates display in Swedish format for all users.
- **Fix:** Use the device locale: `new Date(currentPoll.deadline).toLocaleString(Intl.DateTimeFormat().resolvedOptions().locale, { hour12: false })`

---

### MEDIUM

#### M6. QR Code Generated by External Service (Privacy + Reliability)
- **File:** `mobile/src/components/common/QRCode.tsx` ~line 40
- **Issue:** Poll URLs are sent to `api.qrserver.com` (external). If service is down, QR codes break. Also sends poll link externally.
- **Fix:** Use the `react-native-qrcode-svg` package (already in `package.json`) to generate QR codes locally.

#### M7. QR Share URL Wrong in Dev Mode
- **File:** `mobile/src/screens/poll/ShareScreen.tsx` ~line 46
- **Issue:** Dev share URL is `http://10.0.2.2:3000/poll/xxx` (Android emulator IP) which doesn't work on physical devices or for real sharing.
- **Fix:** Always use the canonical `https://pollstraw.com/poll/${shareUrl}` for sharing, regardless of dev/prod.

#### M8. ResultsScreen / Real-Time Vote Updates: Missing `results-update` Handler
- **File:** `mobile/src/hooks/useRealTimeVotes.ts`
- **Issue:** Hook listens to both `vote-update` AND `results-update`, but the backend only emits `vote-update`. One listener always fires, the other never does. Inconsistency in naming.
- **Fix:** Align event name — use only `vote-update` on both backend and mobile.

#### M9. No Error Boundary Around the App
- **Issue:** A single unhandled throw in any component crashes the entire app with a red screen in dev and a white screen in prod.
- **Fix:** Add React Error Boundary at the root of `App.tsx`.
  ```tsx
  <ErrorBoundary fallback={<AppCrashScreen />}>
    <AppNavigator />
  </ErrorBoundary>
  ```

#### M10. AuthStore Missing Centralized `isLoading` for Login/Register
- **File:** `mobile/src/store/authStore.ts` ~lines 25–71
- **Issue:** Login/register actions don't set `isLoading` in the store. Every screen manages its own `useState(false)` loading flag — inconsistent and error-prone.
- **Fix:** Add `isLoading: boolean` to store state; set `true` at start of login/register, `false` at end.

#### M11. `PollDetailScreen` — Missing `pollId` Guard
- **File:** `mobile/src/screens/poll/PollDetailScreen.tsx` ~line 29
- **Issue:** If navigation params are missing, `fetchPoll(undefined)` is called silently.
- **Fix:**
  ```tsx
  if (!pollId) { navigation.goBack(); return; }
  ```

#### M12. `HomeScreen` — `recentPolls` Never Populated (Incomplete Feature)
- **File:** `mobile/src/screens/home/HomeScreen.tsx` ~line 57
- **Issue:** `recentPolls` is declared as empty array and never fetched. "Recent Polls" section is dead UI.
- **Fix:** Fetch recent polls from API on mount, or remove the section.

---

### LOW

| # | File | Issue |
|---|------|-------|
| M13 | `PollCard.tsx` | Deadline timezone display may be wrong if server/client in different TZs |
| M14 | `ForgotPasswordScreen.tsx` | Email validated with weak `includes('@')` check |
| M15 | `DashboardScreen.tsx` | No loading indicator on tab refocus |
| M16 | `AdminUsersScreen.tsx` | No footer loading indicator during pagination |
| M17 | `RegisterScreen.tsx` | Two back buttons visible (header + custom) |
| M18 | `EditProfileScreen.tsx` | Name not validated for min/max length |
| M19 | `Button.tsx` | `leftIcon` prop used in some screens but not defined in Button's interface |

---

## PART 3 — UNIMPLEMENTED SERVICES

| Feature | Status | Location | Notes |
|---------|--------|----------|-------|
| **Email Sending** | ❌ NOT IMPLEMENTED | `authService.ts:259` | Password reset is console.log only. Critical for production. |
| **iOS Universal Links** | ❌ BROKEN | `app.ts:150` | Placeholder `TEAMID` in Apple App Site Association file |
| **Android App Links** | ❌ BROKEN | `app.ts:168` | Placeholder `YOUR_SHA256_FINGERPRINT` |
| **CAPTCHA Verification** | ❌ NOT IMPLEMENTED | `schema.prisma` has `captchaRequired` field, but no server-side CAPTCHA validation exists anywhere |
| **Poll Reports (Mobile)** | ❌ MISSING | Mobile has no UI for users to report a poll despite backend support (`POST /polls/:id/report` may be missing from routes too) |
| **Poll Report Route** | ❌ MISSING | `pollRoutes.ts` — no `POST /polls/:id/report` endpoint exists in routes, but Report model is in DB |
| **Recent Polls (Home)** | ❌ INCOMPLETE | `HomeScreen.tsx:57` — `recentPolls` state never populated |
| **QR Code (local)** | ⚠️ PARTIAL | `QRCode.tsx` — delegates to external API despite `react-native-qrcode-svg` being installed |
| **Embed Code** | ⚠️ UNUSED | `schema.prisma` has `embedCode` field on Poll, but it's never set or used |
| **Email Verification** | ❌ MISSING | No email verification on registration; any email can be used |
| **Poll Analytics per Poll** | ⚠️ PARTIAL | `viewCount` and `totalVotes` tracked, but no per-option analytics over time |

---

## PART 4 — PRODUCTION READINESS ASSESSMENT (1,000 CONCURRENT USERS)

### Verdict: ⚠️ NOT PRODUCTION READY — 6–8 weeks of work needed

---

### Capacity Analysis

| Layer | Current State | Can Handle 1K Users? |
|-------|--------------|----------------------|
| **Express + Node.js** | Single process, no cluster | ⚠️ Marginal (needs PM2 cluster or horizontal scale) |
| **PostgreSQL** | Prisma ORM, no connection pool configured | ❌ Will exhaust connections at ~100 concurrent |
| **Redis** | Used for caching + pub/sub | ✅ Can handle 1K easily |
| **Socket.io** | Single instance, Redis pub/sub | ⚠️ Works for 1K but needs sticky sessions in load balancer |
| **Rate Limiter** | In-memory (express-rate-limit) | ❌ State lost on restart; breaks behind load balancer |

---

### Critical Blockers for Production (Must Fix First)

#### 1. Database Connection Pooling
**Current:** Prisma defaults (connection limit not configured).
**Problem:** PostgreSQL has a default max of 100 connections. At 1K users, concurrent requests will exhaust the pool and return errors.
**Fix:** Configure Prisma connection pool in `DATABASE_URL` or add PgBouncer:
```
DATABASE_URL="postgresql://...?connection_limit=20&pool_timeout=10"
```
And add PgBouncer in front of PostgreSQL for pooling.

#### 2. Rate Limiter Not Distributed
**Current:** `express-rate-limit` stores state in memory.
**Problem:** Behind a load balancer with multiple Node instances, each instance has its own counter — limits are effectively multiplied by number of instances.
**Fix:** Use Redis-backed rate limiting:
```ts
import RedisStore from 'rate-limit-redis';
const limiter = rateLimit({ store: new RedisStore({ client: redis }) });
```

#### 3. No Process Clustering
**Current:** Single Node.js process.
**Problem:** One CPU core used; single process failure takes down the server.
**Fix:** Use PM2 cluster mode or deploy as multiple containers:
```json
// ecosystem.config.js
{ instances: "max", exec_mode: "cluster" }
```

#### 4. Password Reset Email (Feature Broken)
As noted in B1 — completely non-functional without email integration.

#### 5. Socket.io Sticky Sessions Required
**Current:** Socket.io with Redis pub/sub.
**Problem:** With multiple Node instances behind a load balancer, WebSocket connections must always route to the same instance (sticky sessions), otherwise Socket.io handshake fails.
**Fix:** Configure sticky sessions in NGINX/load balancer using `ip_hash`.

---

### Performance Gaps

| Issue | Impact | Fix |
|-------|--------|-----|
| N+1 query risk in `formatPollWithResults` (called per poll in lists) | Slow list pages under load | Batch fetch, use Prisma `include` |
| Results cache race condition (B9) | DB overload on viral polls | Redis distributed lock (SET NX PX) |
| No HTTP response compression | Higher bandwidth, slower mobile | Add `compression` middleware |
| No CDN for static assets | High latency for global users | Serve `public/` via CDN (Cloudflare) |
| No query timeout | Slow queries block Node event loop | Set `statement_timeout` in PostgreSQL |
| Redis optional but core features depend on it | Silent feature failures | Make Redis mandatory in production |

---

### Security Gaps (Production Blockers)

| Issue | Severity | Fix |
|-------|----------|-----|
| Voter PII (IP, sessionId, deviceId) exposed to poll creators | HIGH | Redact PII for non-admin roles |
| Password reset token in query string | MEDIUM | Move to POST body |
| No email verification on registration | MEDIUM | Add verification flow |
| CAPTCHA field exists but never validated | MEDIUM | Implement reCAPTCHA or Turnstile |
| No audit logging for admin actions | MEDIUM | Add `AuditLog` table/middleware |
| Dev stack traces exposed in error responses | LOW | Ensure `NODE_ENV=production` is set |

---

### Infrastructure Requirements for 1K Users

```
Minimum production setup:
├── Load Balancer (NGINX) — sticky sessions for Socket.io
├── Node.js App × 2 instances (PM2 cluster or Docker)
├── PostgreSQL (managed: RDS / Supabase / Railway)
│   └── PgBouncer for connection pooling
├── Redis (managed: Upstash / Redis Cloud)
│   └── Both cache + pub/sub channels
├── Email Provider (SendGrid / Postmark / SES)
└── CDN (Cloudflare) — static assets + DDoS protection
```

**Estimated monthly cost:** $50–$150/month (Railway / Render stack)

---

### What's Already Production-Quality

✅ JWT dual-token auth with rotation
✅ Prisma transactions for vote integrity
✅ Multi-level anti-fraud (IP + session + device)
✅ Redis pub/sub for real-time scaling
✅ Zod validation on all inputs
✅ Role-based access control (GUEST/USER/ADMIN)
✅ Graceful shutdown handling
✅ 55 passing integration tests
✅ Rate limiting (needs Redis store upgrade)
✅ Helmet security headers

---

## PRIORITY ACTION PLAN

### Week 1 — Critical Fixes (Blockers)
1. ✅ Fix `getResults` crash in ResultsScreen (M2)
2. ✅ Implement email sending for password reset (B1)
3. ✅ Fix JWT refresh expiry bug (B2)
4. ✅ Fix Redis key bug for `allowMultiple` polls (B3)
5. ✅ Fix `isLoading` never reset after poll creation (M4)

### Week 2 — Security & Data Integrity
6. Redact PII from creator vote endpoint (B7)
7. Implement anonymous vote prevention for unknown IPs (B4)
8. Add distributed Redis rate limiting (B5 / production)
9. Set hardcoded placeholder env vars (B13 — Apple/Android links)
10. Fix vote cache invalidation on admin delete (B6)

### Week 3 — Performance & Scale
11. Configure DB connection pooling (production blocker)
12. Add Redis distributed lock for results cache (B9)
13. Add compression middleware
14. Upgrade rate limiter to Redis store
15. Fix QR code to use local library (M6)

### Week 4+ — Missing Features
16. Report a poll endpoint + mobile UI
17. Email verification on registration
18. CAPTCHA implementation
19. Error boundary in mobile app (M9)
20. Fix Recent Polls on HomeScreen (M12)
