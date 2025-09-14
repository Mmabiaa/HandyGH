import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export const setupSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('HandyGH API')
    .setDescription('API documentation for HandyGH, a local services marketplace for Ghana.')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('providers')
    .addTag('bookings')
    .addTag('payments')
    .addTag('reviews')
    .addTag('messages')
    .addTag('admin')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
};