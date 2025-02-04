/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

import * as shell from 'shelljs';
import { AppModule } from './app/app.module';

if (process.env.NODE_ENV === 'production') {
  shell.exec(`npx prisma migrate deploy`);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin:
        process.env.NODE_ENV === 'production'
          ? /^(?:[a-zA-Z0-9-]+\.)*xafpay\.com$/
          : /^http:\/\/localhost/,
      credentials: true,
    },
    rawBody: true,
  });
  app.use(cookieParser());
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.enableShutdownHooks();

  // global configurations
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // swagger setup
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('XAFPAY APIs')
      .setDescription('Detailed description of XAFPAY internal APIs.')
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth('refresh_token')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
      customSiteTitle: 'XafPay APIs docs',
    });
  }

  const port = process.env.PORT || 5000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix} (${process.env.NODE_ENV})`
  );
}

global.XMLHttpRequest = require('xhr2');

bootstrap();
