import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { BullModule } from '@nestjs/bull';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt/jwt-auth.guard';
import { UsersModule } from '../modules/users/users.module';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [
    BullModule.forRoot({}),
    PrismaModule,
    MailerModule.forRoot({
      secure: true,
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
  ],
})
export class AppModule {}
