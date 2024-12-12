import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  app.useLogger(logger);

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://frontend-e2e:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('URL Shortener API')
    .setDescription('API documentation for URL Shortener service')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;

  await app.listen(port).then(() => {
    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(`API documentation available at: http://localhost:${port}/api`);
  });
}
bootstrap();
