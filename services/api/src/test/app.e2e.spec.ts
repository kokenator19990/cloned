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

  describe('POST /auth/guest (Guest Trial)', () => {
    let guestToken: string;

    it('should create a guest session with 30m token', () => {
      return request(app.getHttpServer())
        .post('/auth/guest')
        .expect(201)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.user.isGuest).toBe(true);
          expect(res.body.user.displayName).toBe('Invitado');
          expect(res.body.guestExpiresAt).toBeDefined();
          guestToken = res.body.accessToken;
        });
    });

    it('guest should be able to create a profile', async () => {
      const guestRes = await request(app.getHttpServer())
        .post('/auth/guest')
        .expect(201);
      guestToken = guestRes.body.accessToken;

      return request(app.getHttpServer())
        .post('/profiles')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({ name: 'Mi Clon Invitado' })
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe('Mi Clon Invitado');
          expect(res.body.minInteractions).toBe(20);
        });
    });

    it('guest should be able to access /auth/me', async () => {
      const guestRes = await request(app.getHttpServer())
        .post('/auth/guest')
        .expect(201);

      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${guestRes.body.accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.displayName).toBe('Invitado');
        });
    });
  });

  describe('POST /auth/cleanup-guests', () => {
    it('should run cleanup without errors', () => {
      return request(app.getHttpServer())
        .post('/auth/cleanup-guests')
        .expect(201)
        .expect((res) => {
          expect(res.body.deleted).toBeDefined();
          expect(typeof res.body.deleted).toBe('number');
        });
    });
  });
});
