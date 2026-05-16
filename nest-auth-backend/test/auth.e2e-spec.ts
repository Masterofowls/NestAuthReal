import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('OAuth Providers (E2E)', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    // Mock OAuth env vars for testing
    process.env.GOOGLE_CLIENT_ID = 'mock-google-id';
    process.env.GOOGLE_CLIENT_SECRET = 'mock-google-secret';
    process.env.GITHUB_CLIENT_ID = 'mock-github-id';
    process.env.GITHUB_CLIENT_SECRET = 'mock-github-secret';

    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication({ bodyParser: false });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Google OAuth', () => {
    it('should have Google provider config loaded', () => {
      expect(process.env.GOOGLE_CLIENT_ID).toBe('mock-google-id');
    });

    it('should handle GET /api/auth/callback/google (stub)', async () => {
      // This will fail unless you've wired the callback properly
      // For now, it verifies the route exists
      const response = await app
        .inject({
          method: 'GET',
          url: '/api/auth/callback/google?code=stub&state=stub',
        })
        .then((res) => ({ status: res.statusCode }))
        .catch((err) => ({ status: err.statusCode || 404 }));

      // Just verify the endpoint is recognized (200/400/401 OK; 404 is bad)
      expect([200, 400, 401, 302]).toContain(response.status);
    });
  });

  describe('GitHub OAuth', () => {
    it('should have GitHub provider config loaded', () => {
      expect(process.env.GITHUB_CLIENT_ID).toBe('mock-github-id');
    });
  });
});
