import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { parseTrustedOrigins } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });
  const trustedOrigins = parseTrustedOrigins(
    process.env.AUTH_TRUSTED_ORIGINS ?? 'http://localhost:3001',
  );
  app.enableCors({
    origin: trustedOrigins,
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
