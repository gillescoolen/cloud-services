import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AttemptModule } from './attempt/attempt.module';
import { AuthModule } from './auth/auth.module';
import { JwtGuard } from './auth/guards/jwt-auth.guard';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { RolesGuard } from './common/guards/role.guard';
import { DatabaseModule } from './database/database.module';
import { HintModule } from './hint/hint.module';
import { TargetModule } from './target/target.module';
import { UserModule } from './user/user.module';
import { validate } from './util/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({ validate }),
    DatabaseModule,
    UserModule,
    AuthModule,
    AttemptModule,
    HintModule,
    TargetModule
  ],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtGuard
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ]
})
export class AppModule {}
