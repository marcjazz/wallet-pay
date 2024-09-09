import { ClassSerializerInterceptor, Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { BullModule } from '@nestjs/bull';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt/jwt-auth.guard';
import { UsersModule } from '../modules/users/users.module';
import { MailerModule } from '../mailer/mailer.module';
import { HttpExceptionFilter } from '../exception-filters/http-exception.filter';
import { PrismaExceptionFilter } from '../exception-filters/prisma-exception.filter';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    PrismaModule,
    MailerModule.forRoot({
      secure: process.env.NODE_ENV === 'production',
      host: process.env.EMAIL_HOST as string,
      pass: process.env.EMAIL_PASS as string,
      user: process.env.APP_EMAIL as string,
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
