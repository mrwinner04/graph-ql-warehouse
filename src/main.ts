import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(
    `🚀 GraphQL Warehouse API is running on: http://localhost:${port}/graphql`,
  );
}
bootstrap().catch((err) => {
  console.error('Application failed to start:', err);
  process.exit(1);
});
