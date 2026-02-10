# Release Checklist - Cloned Project

## Overview
This checklist ensures a smooth, safe, and complete release process for the Cloned (Deadbot) project.

**Current Version:** 0.1.0  
**Release Type:** [ ] Patch [ ] Minor [ ] Major  
**Release Date:** __________

---

## Pre-Release Checks

### 1. Code Quality

- [ ] All TypeScript compilation passes without errors
  ```bash
  pnpm typecheck
  ```

- [ ] All linting passes without errors
  ```bash
  pnpm lint
  ```

- [ ] No console.log or debug statements in production code
  ```bash
  grep -r "console\.log" services/api/src --exclude-dir=test
  grep -r "console\.log" apps/web/app --exclude-dir=__tests__
  ```

- [ ] No TODO/FIXME comments for critical functionality
  ```bash
  grep -r "TODO\|FIXME" services/api/src apps/web/app | grep -v "node_modules"
  ```

---

### 2. Build Verification

- [ ] API builds successfully
  ```bash
  cd services/api && pnpm build
  # Verify: dist/ folder contains 31+ JS files
  ```

- [ ] Web builds successfully
  ```bash
  cd apps/web && pnpm build
  # Verify: .next/ folder created, no errors
  ```

- [ ] No build warnings that need addressing
  - Review all warnings and document acceptable ones

- [ ] Bundle size is reasonable (Web)
  ```bash
  cd apps/web && pnpm build
  # Check output: First Load JS should be < 250KB for main pages
  ```

---

### 3. Testing

- [ ] All unit tests pass (API)
  ```bash
  cd services/api && pnpm test
  # Expected: 29 unit tests passing
  ```

- [ ] All E2E tests pass (API)
  ```bash
  cd services/api && pnpm test app.e2e.spec.ts
  # Expected: 18 integration tests passing
  ```

- [ ] Manual smoke test of critical flows:
  - [ ] User registration works
  - [ ] User login works
  - [ ] Profile creation works
  - [ ] Enrollment can be started
  - [ ] Questions are generated
  - [ ] Answers are saved
  - [ ] Profile activates after 50 interactions
  - [ ] Chat session can be created
  - [ ] Messages can be sent
  - [ ] Document upload works (if enabled)
  - [ ] Health endpoint returns "ok"

- [ ] Test coverage meets threshold (>70%)
  ```bash
  cd services/api && pnpm test --coverage
  ```

---

### 4. Database & Migrations

- [ ] All Prisma migrations are applied
  ```bash
  cd services/api && npx prisma migrate status
  # Should show: Database is up to date
  ```

- [ ] Database migrations tested on fresh database
  ```bash
  # Test from scratch
  pnpm docker:reset
  cd services/api
  npx prisma migrate dev
  npx prisma db seed
  ```

- [ ] Seed data works correctly
  - [ ] Demo user created: demo@deadbot.app
  - [ ] Demo profile exists
  - [ ] No errors in seed script

- [ ] Database rollback plan documented (if needed)
  - Document migration number for rollback
  - Backup strategy documented

- [ ] pgvector extension is enabled
  ```bash
  curl http://localhost:3001/health
  # Verify: database check includes pgvector support
  ```

---

### 5. Environment Variables

- [ ] All required environment variables documented in `.env.example`
  - [ ] DATABASE_URL
  - [ ] REDIS_URL
  - [ ] JWT_SECRET
  - [ ] JWT_EXPIRY
  - [ ] MINIO_* variables
  - [ ] LLM_* variables
  - [ ] VOICE_* variables (optional)
  - [ ] EMBEDDING_* variables (optional)

- [ ] Production `.env` file prepared (not in repo)
  - [ ] Strong JWT_SECRET generated
  - [ ] Secure database credentials
  - [ ] Secure MinIO credentials
  - [ ] Production URLs configured

- [ ] No secrets committed to repository
  ```bash
  git log -p | grep -i "password\|secret\|key" | grep -v ".env.example"
  ```

- [ ] Environment variable validation works
  - Start API without .env and verify it fails gracefully

---

## Feature Verification

### 6. Core Features

- [ ] **Authentication**
  - [ ] Registration with valid email
  - [ ] Registration rejects duplicate emails
  - [ ] Login with correct credentials
  - [ ] Login rejects wrong credentials
  - [ ] JWT tokens are generated
  - [ ] Protected routes require authentication

- [ ] **Profile Management**
  - [ ] Create profile
  - [ ] List profiles (only user's own)
  - [ ] Get profile details
  - [ ] Delete profile (hard delete cascades)
  - [ ] Profile status transitions correctly

- [ ] **Enrollment**
  - [ ] Start enrollment
  - [ ] Get next question
  - [ ] Submit answer
  - [ ] Coverage map updates
  - [ ] Progress tracking works
  - [ ] Auto-activation at 50+ interactions
  - [ ] Consistency score calculation

- [ ] **Chat**
  - [ ] Create chat session
  - [ ] List sessions
  - [ ] Send message
  - [ ] Receive response
  - [ ] WebSocket streaming works (if enabled)
  - [ ] Chat history persists

- [ ] **Memory System**
  - [ ] Memories are stored
  - [ ] Relevant memories retrieved
  - [ ] Embeddings work (if enabled)
  - [ ] Keyword fallback works

---

### 7. Advanced Features

- [ ] **RAG Document Upload** (if enabled)
  - [ ] Upload PDF works
  - [ ] Upload TXT works
  - [ ] Upload DOCX works (if supported)
  - [ ] Text chunking works
  - [ ] Embeddings generated
  - [ ] Document search works
  - [ ] Documents listed correctly
  - [ ] Document deletion works

- [ ] **Voice System** (if enabled)
  - [ ] Voice sample upload works
  - [ ] Consent recording works
  - [ ] Voice config endpoint returns capabilities
  - [ ] STT/TTS gracefully degrades when unavailable

- [ ] **Avatar System**
  - [ ] Photo upload works
  - [ ] Avatar config updates
  - [ ] Skins apply correctly
  - [ ] Moods apply correctly
  - [ ] Accessories apply correctly

---

## Infrastructure & DevOps

### 8. Docker & Services

- [ ] Docker Compose file is valid
  ```bash
  docker compose -f infra/docker-compose.yml config
  ```

- [ ] All services start successfully
  ```bash
  pnpm docker:up
  docker ps
  # Should show: postgres, redis, minio all running
  ```

- [ ] Services are healthy
  ```bash
  curl http://localhost:3001/health
  # All checks should be "ok"
  ```

- [ ] Volumes are configured correctly
  - [ ] postgres-data persists across restarts
  - [ ] minio-data persists across restarts
  - [ ] redis data is ephemeral (no volume) ✓

- [ ] Network connectivity between services works
  - API can reach PostgreSQL
  - API can reach Redis
  - API can reach MinIO

---

### 9. Performance

- [ ] API response times are acceptable
  - [ ] Health check: < 100ms
  - [ ] Login: < 500ms
  - [ ] Create profile: < 200ms
  - [ ] Get next question: < 1000ms (with LLM)
  - [ ] Submit answer: < 300ms

- [ ] Database queries are optimized
  - [ ] No N+1 queries
  - [ ] Appropriate indexes exist
  - [ ] Query performance reviewed in Prisma Studio

- [ ] Memory usage is reasonable
  ```bash
  docker stats deadbot-postgres deadbot-redis deadbot-minio
  # Should be under 500MB each for dev
  ```

- [ ] No memory leaks detected
  - Run API for 5 minutes, check memory doesn't grow unbounded

---

### 10. Security

- [ ] Dependencies have no critical vulnerabilities
  ```bash
  cd services/api && pnpm audit --production
  cd apps/web && pnpm audit --production
  ```

- [ ] Passwords are hashed with bcrypt
  - [ ] Min 10 rounds (check bcrypt config)

- [ ] JWT secrets are strong
  - [ ] At least 32 characters
  - [ ] Random, not default

- [ ] CORS is configured correctly
  - [ ] Only expected origins allowed in production

- [ ] Rate limiting configured (if applicable)
  - Document limits
  - Test that limits work

- [ ] Input validation works
  - [ ] Email validation
  - [ ] Password requirements enforced
  - [ ] File upload size limits
  - [ ] File type validation

- [ ] SQL injection protection (Prisma ORM)
  - Review all raw queries

- [ ] XSS protection (Next.js)
  - No dangerouslySetInnerHTML without sanitization

---

## Documentation

### 11. Documentation Completeness

- [ ] README.md is up to date
  - [ ] Features list accurate
  - [ ] Environment variables documented
  - [ ] API endpoints listed
  - [ ] Prerequisites correct
  - [ ] Quick start works

- [ ] QUICKSTART.md tested end-to-end
  - [ ] Commands work as written
  - [ ] No missing steps
  - [ ] Troubleshooting covers common issues

- [ ] INSTALL.md is comprehensive
  - [ ] All installation methods documented
  - [ ] Platform-specific notes included

- [ ] BUGFIX_REPORT.md updated
  - [ ] All bugs fixed documented
  - [ ] All features added listed
  - [ ] Verification steps included

- [ ] TEST_COVERAGE_SUMMARY.md is current
  - [ ] Test counts match reality
  - [ ] Coverage metrics updated

- [ ] API documentation (Swagger) is complete
  - [ ] All endpoints documented
  - [ ] Request/response schemas correct
  - [ ] Authentication requirements clear

- [ ] Code comments for complex logic
  - [ ] EnrollmentService logic explained
  - [ ] LLM integration documented
  - [ ] RAG implementation commented

---

## Deployment

### 12. Deployment Preparation

- [ ] Deployment environment ready
  - [ ] Server/cloud instance provisioned
  - [ ] Domain name configured (if applicable)
  - [ ] SSL certificates ready

- [ ] Production database created
  - [ ] PostgreSQL 16 with pgvector
  - [ ] Secure credentials set
  - [ ] Backup strategy configured

- [ ] Production Redis configured
  - [ ] Persistent or ephemeral (choose based on needs)
  - [ ] Password protected

- [ ] Production S3/MinIO configured
  - [ ] Buckets created
  - [ ] Access policies set
  - [ ] Secure credentials

- [ ] Environment variables set in production
  - Use secrets manager (not .env file in production)

- [ ] Monitoring configured
  - [ ] Health check endpoint monitored
  - [ ] Error logging (Sentry, etc.)
  - [ ] Performance monitoring (optional)

---

### 13. Deployment Steps

- [ ] Tag release in git
  ```bash
  git tag -a v0.1.0 -m "Release v0.1.0"
  git push origin v0.1.0
  ```

- [ ] Build production artifacts
  ```bash
  pnpm build
  ```

- [ ] Deploy database migrations
  ```bash
  # On production server
  cd services/api
  npx prisma migrate deploy
  ```

- [ ] Start API server
  ```bash
  # Production start command
  pnpm start:api
  # OR use PM2, systemd, Docker, etc.
  ```

- [ ] Start Web server
  ```bash
  # Production start command
  cd apps/web && pnpm start
  # OR use PM2, Vercel, Netlify, etc.
  ```

- [ ] Verify production health
  ```bash
  curl https://your-domain.com/health
  ```

---

## Post-Release

### 14. Post-Release Verification

- [ ] Production health check passes
  - All services showing "ok"

- [ ] Can create new account
  - Registration flow works in production

- [ ] Can login
  - Authentication works in production

- [ ] Can create profile
  - Profile creation works

- [ ] Can complete enrollment flow
  - Questions generate
  - Answers save
  - Profile activates

- [ ] Can chat with profile
  - Chat works end-to-end

- [ ] Document upload works (if enabled)
  - File upload successful
  - Embeddings generated

- [ ] Performance is acceptable
  - API response times under thresholds
  - No 500 errors

- [ ] Monitoring is receiving data
  - Health checks logged
  - Errors reported

---

### 15. Communication

- [ ] Release notes published
  - [ ] New features listed
  - [ ] Bug fixes listed
  - [ ] Breaking changes noted
  - [ ] Migration guide (if needed)

- [ ] Team/stakeholders notified
  - Email sent
  - Slack/Discord message posted

- [ ] Documentation site updated (if applicable)

- [ ] Demo video updated (if applicable)

---

### 16. Rollback Plan

If issues arise, document rollback steps:

- [ ] Database rollback command ready
  ```bash
  # Example:
  npx prisma migrate resolve --rolled-back 20260209200647_add_documents
  ```

- [ ] Previous version tagged in git
  ```bash
  git checkout v0.0.9  # Previous stable version
  ```

- [ ] Rollback tested in staging
  - Verify rollback process works

---

## Sign-Off

### Release Manager

- [ ] All checklist items completed or documented as N/A
- [ ] All critical issues resolved
- [ ] All stakeholders notified
- [ ] Rollback plan documented

**Name:** _____________________  
**Date:** _____________________  
**Signature:** _____________________

---

## Notes

Use this section to document:
- Items skipped and why
- Known issues accepted for this release
- Future improvements planned
- Special considerations for this release

---

*This checklist should be reviewed and updated for each release to reflect current best practices and project needs.*
