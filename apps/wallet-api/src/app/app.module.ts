import { ClassSerializerInterceptor, Module } from '@nestjs/common';

import { BullModule } from '@nestjs/bull';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from '../exception-filters/all-exception.filter';
import { HttpExceptionFilter } from '../exception-filters/http-exception.filter';
import { PrismaExceptionFilter } from '../exception-filters/prisma-exception.filter';
import { MailerModule } from '../mailer/mailer.module';
import { AccountsModule } from '../modules/accounts/accounts.module';
import { ReceiversModule } from '../modules/receivers/receivers.module';
import { CurrenciesModule } from '../modules/currencies/currencies.module';
import { TransactionsModule } from '../modules/transactions/transactions.module';
import { UsersModule } from '../modules/users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt/jwt-auth.guard';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    PrismaModule,
    MailerModule.forRoot({
      secure: process.env.NODE_ENV === 'production',
      host: process.env.EMAIL_HOST,
      pass: process.env.EMAIL_PASS,
      user: process.env.APP_EMAIL,
    }),
    AuthModule,
    UsersModule,
    AccountsModule,
    TransactionsModule,
    ReceiversModule,
    CurrenciesModule,
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
      useClass: AllExceptionsFilter,
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
