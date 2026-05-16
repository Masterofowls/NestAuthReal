import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { validateEnv } from '../config/env';

describe('Auth Config', () => {
  let module: TestingModule;
  let configService: ConfigService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env',
          isGlobal: true,
          validate: validateEnv,
        }),
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('Auth Environment', () => {
    it('should load BETTER_AUTH_URL from env', () => {
      const url = configService.get<string>('BETTER_AUTH_URL');
      expect(url).toBeDefined();
    });

    it('should load BETTER_AUTH_SECRET from env', () => {
      const secret = configService.get<string>('BETTER_AUTH_SECRET');
      expect(secret).toBeDefined();
      expect(secret!.length).toBeGreaterThanOrEqual(32); 
    });

    it('should have OAuth env vars ready', () => {
      const googleId = configService.get<string>('GOOGLE_CLIENT_ID');
      const githubId = configService.get<string>('GITHUB_CLIENT_ID');
      // These are optional for testing, just verify they're defined (can be empty)
      expect(googleId !== undefined).toBe(true);
      expect(githubId !== undefined).toBe(true);
    });
  });

  describe('Database Config', () => {
    it('should load DATABASE_URL from env', () => {
      const dbUrl = configService.get<string>('DATABASE_URL');
      expect(dbUrl).toBeDefined();
    });
  });
});
