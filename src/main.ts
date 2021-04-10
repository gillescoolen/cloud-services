import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as rateLimit from 'express-rate-limit';
import * as helmet from 'helmet';
import { AppModule } from './app.module';
import { MongoExceptionFilter } from './common/filters/mongo-exception.filter';
import { XMLInterceptor } from './common/interceptors/xml.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Cloud Services')
    .setDescription('Documentation for the Cloud Services API.')
    .addBearerAuth({ in: 'header', type: 'http' })
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.use(helmet());

  app.useGlobalFilters(new MongoExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      transform: true
    })
  );

  app.enableCors({
    origin: process.env.HOST
  });

  app.use(
    rateLimit({
      windowMs: 1 * 60 * 1000,
      max: 20
    })
  );

  app.useGlobalInterceptors(new XMLInterceptor());

  await app.listen(process.env.PORT);

  console.log(`\nApplication running on ${process.env.HOST}:${process.env.PORT}`);
}

bootstrap();
