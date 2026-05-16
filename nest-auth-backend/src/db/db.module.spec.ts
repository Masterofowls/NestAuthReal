import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './db.module';
import { DB } from './db.module'; // ← FIX: Import from db.module, not db.provider
import { drizzle } from 'drizzle-orm/node-postgres';

describe('DbModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env',
          isGlobal: true,
        }),
        DbModule,
      ],
    }).compile();
  });

  afterAll(async () => {
    await module.close();
  });

  it('should provide database instance', () => {
    const dbInstance = module.get(DB);
    expect(dbInstance).toBeDefined();
  });

  it('should be a drizzle instance', () => {
    const dbInstance = module.get(DB);
    expect(dbInstance).toHaveProperty('query');
    expect(dbInstance).toHaveProperty('execute');
  });
});
