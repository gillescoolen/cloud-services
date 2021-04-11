import { BadRequestException, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { generateSlug } from 'random-word-slugs';
import { AuthModule } from '../auth/auth.module';
import { TargetModule } from '../target/target.module';
import { UserModule } from '../user/user.module';
import { AttemptController } from './attempt.controller';
import { Attempt, attemptSchema } from './attempt.schema';
import { AttemptService } from './attempt.service';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: Attempt.name,
        schema: attemptSchema
      }
    ]),
    TargetModule,
    MulterModule.register({
      dest: './images',
      storage: diskStorage({
        destination: './images',
        filename: async (req, file, callback) => {
          callback(null, `${generateSlug(6)}${extname(file.originalname)}`);
        }
      }),
      fileFilter: async (req, file, callback) => {
        if (!extname(file.originalname).match(/\.(jpg|jpeg|png)$/))
          return callback(new BadRequestException('Only images are allowed!'), false);

        callback(null, true);
      }
    })
  ],
  providers: [AttemptService],
  controllers: [AttemptController],
  exports: [AttemptService]
})
export class AttemptModule {}
