import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('DB_URL'),
        dbName: configService.get('DB_NAME'),
        user: configService.get('DB_USER'),
        pass: configService.get('DB_PASSWORD'),
        ssl: false,
        retryAttempts: 3
      })
    })
  ]
})
export class DatabaseModule {}
