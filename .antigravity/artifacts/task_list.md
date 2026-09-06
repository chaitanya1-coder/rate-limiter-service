# Antigravity Task List - Rate Limiter Service

- [x] Create TokenBucketRateLimiter core implementation (`src/limiter.ts`)
- [/] Debug failing unit tests in `src/__tests__/limiter.test.ts`
  - [x] Test client isolation
  - [ ] Fix bucket capacity exhaustion boundary condition
- [ ] Add rate limit header middleware in `src/server.ts`
