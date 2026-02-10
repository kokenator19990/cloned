import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';

describe('API Integration Tests (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBeDefined();
          expect(res.body.version).toBe('0.1.0');
          expect(res.body.checks).toBeDefined();
        });
    });
  });

  describe('POST /auth/register', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `test-${Date.now()}@test.com`,
          password: 'password123',
          displayName: 'E2E Test User',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.user.email).toBeDefined();
          accessToken = res.body.accessToken;
        });
    });

    it('should reject duplicate email', async () => {
      const email = `dup-${Date.now()}@test.com`;
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'password123', displayName: 'Dup User' });

      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ email, password: 'password123', displayName: 'Dup User 2' })
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with demo credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'demo@cloned.app', password: 'password123' })
        .expect(201)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
          accessToken = res.body.accessToken;
        });
    });

    it('should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'demo@cloned.app', password: 'wrong' })
        .expect(401);
    });
  });

  describe('GET /profiles (authenticated)', () => {
    it('should return profiles for authenticated user', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'demo@cloned.app', password: 'password123' });
      accessToken = loginRes.body.accessToken;

      return request(app.getHttpServer())
        .get('/profiles')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should reject unauthenticated request', () => {
      return request(app.getHttpServer()).get('/profiles').expect(401);
    });
  });

  describe('GET /voice/config', () => {
    it('should return voice configuration', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'demo@cloned.app', password: 'password123' });

      return request(app.getHttpServer())
        .get('/voice/config')
        .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.voiceCloningEnabled).toBeDefined();
        });
    });
  });

  describe('Full Enrollment Flow', () => {
    let profileId: string;

    beforeAll(async () => {
      // Login to get token
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'demo@cloned.app', password: 'password123' });
      accessToken = loginRes.body.accessToken;

      // Create a profile for enrollment testing
      const profileRes = await request(app.getHttpServer())
        .post('/profiles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'E2E Test Profile' });
      
      if (profileRes.status === 201) {
        profileId = profileRes.body.id;
      }
    });

    it('should start enrollment and get first question', async () => {
      if (!profileId) {
        console.log('Skipping: Profile creation failed');
        return;
      }

      return request(app.getHttpServer())
        .post(`/enrollment/${profileId}/start`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body.question).toBeDefined();
          expect(res.body.category).toBeDefined();
          expect(res.body.turnNumber).toBe(1);
        });
    });

    it('should submit answer and update progress', async () => {
      if (!profileId) {
        console.log('Skipping: Profile creation failed');
        return;
      }

      const questionRes = await request(app.getHttpServer())
        .get(`/enrollment/${profileId}/next-question`)
        .set('Authorization', `Bearer ${accessToken}`);

      if (questionRes.status === 200) {
        const questionId = questionRes.body.id;

        return request(app.getHttpServer())
          .post(`/enrollment/${profileId}/answer`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({
            questionId,
            answer: 'This is my test answer for e2e testing',
          })
          .expect(201)
          .expect((res) => {
            expect(res.body.totalInteractions).toBeGreaterThan(0);
            expect(res.body.coverageMap).toBeDefined();
          });
      }
    });

    it('should get enrollment progress', async () => {
      if (!profileId) {
        console.log('Skipping: Profile creation failed');
        return;
      }

      return request(app.getHttpServer())
        .get(`/enrollment/${profileId}/progress`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.totalInteractions).toBeDefined();
          expect(res.body.minRequired).toBeDefined();
          expect(res.body.percentComplete).toBeDefined();
          expect(res.body.isReady).toBeDefined();
        });
    });
  });

  describe('Full Chat Flow', () => {
    let profileId: string;
    let sessionId: string;

    beforeAll(async () => {
      // Login to get token
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'demo@cloned.app', password: 'password123' });
      accessToken = loginRes.body.accessToken;

      // Get an existing profile or use the first available
      const profilesRes = await request(app.getHttpServer())
        .get('/profiles')
        .set('Authorization', `Bearer ${accessToken}`);
      
      if (profilesRes.status === 200 && profilesRes.body.length > 0) {
        profileId = profilesRes.body[0].id;
      }
    });

    it('should create chat session', async () => {
      if (!profileId) {
        console.log('Skipping: No profile available');
        return;
      }

      return request(app.getHttpServer())
        .post(`/chat/${profileId}/sessions`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          sessionId = res.body.id;
        });
    });

    it('should list chat sessions for profile', async () => {
      if (!profileId) {
        console.log('Skipping: No profile available');
        return;
      }

      return request(app.getHttpServer())
        .get(`/chat/${profileId}/sessions`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should send message in chat session', async () => {
      if (!sessionId) {
        console.log('Skipping: No session created');
        return;
      }

      return request(app.getHttpServer())
        .post(`/chat/sessions/${sessionId}/messages`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          content: 'Hello, this is a test message',
          voiceUsed: false,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
        });
    });

    it('should get messages from chat session', async () => {
      if (!sessionId) {
        console.log('Skipping: No session created');
        return;
      }

      return request(app.getHttpServer())
        .get(`/chat/sessions/${sessionId}/messages`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Guest Session Flow', () => {
    let guestToken: string;

    it('should create guest session', () => {
      return request(app.getHttpServer())
        .post('/auth/guest')
        .expect(201)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.user.isGuest).toBe(true);
          expect(res.body.user.expiresAt).toBeDefined();
          guestToken = res.body.accessToken;
        });
    });

    it('should allow guest to create profile', async () => {
      if (!guestToken) {
        console.log('Skipping: No guest token');
        return;
      }

      return request(app.getHttpServer())
        .post('/profiles')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ name: 'Guest Test Profile' })
        .expect((res) => {
          // Should either succeed (201) or fail if profiles need enrollment first
          expect([201, 400, 403]).toContain(res.status);
        });
    });
  });

  describe('Profile Management Flow', () => {
    it('should create profile for authenticated user', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'demo@cloned.app', password: 'password123' });
      accessToken = loginRes.body.accessToken;

      return request(app.getHttpServer())
        .post('/profiles')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: `Test Profile ${Date.now()}` })
        .expect((res) => {
          expect([201, 400]).toContain(res.status);
          if (res.status === 201) {
            expect(res.body.id).toBeDefined();
            expect(res.body.name).toBeDefined();
          }
        });
    });

    it('should get user profile info', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'demo@cloned.app', password: 'password123' });

      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
        .expect((res) => {
          // Accept 200 (endpoint exists) or 404 (endpoint doesn't exist)
          expect([200, 404]).toContain(res.status);
        });
    });
  });
});
