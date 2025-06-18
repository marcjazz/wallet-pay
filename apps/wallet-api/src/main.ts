import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { NextFunction, Request, Response } from 'express';

import { AppModule } from './app/app.module';
import path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin:
        process.env.NODE_ENV === 'production'
          ? /^https:\/\/(www\.)?xafpay\.com$/
          : /^http:\/\/localhost(:\d+)?$/,
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

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.url == '/') {
      return res.redirect(`/api`);
    }

    next();
  });

  app.useStaticAssets(path.join(__dirname, './assets'));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // swagger setup
  {
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
