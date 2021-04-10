import { BadRequestException, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { generateSlug } from 'random-word-slugs';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { TargetController } from './target.controller';
import { Target, targetSchema } from './target.schema';
import { TargetService } from './target.service';

@Module({
  imports: [
    AuthModule,
    UserModule,
    MongooseModule.forFeature([{ name: Target.name, schema: targetSchema }]),
    MulterModule.register({
      dest: './public',
      storage: diskStorage({
        destination: './public',
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
  providers: [TargetService],
  controllers: [TargetController],
  exports: [TargetService]
})
export class TargetModule {}
