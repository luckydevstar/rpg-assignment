import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
      : ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  });
  const port = process.env.PORT ?? 3200;
  await app.listen(port);
  console.log(`Graphql Endpoint: http://localhost:${port}/graphql`);
}
void bootstrap();
