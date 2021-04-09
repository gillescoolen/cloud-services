import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { TargetModule } from '../target/target.module';
import { HintController } from './hint.controller';
import { Hint, hintSchema } from './hint.schema';
import { HintService } from './hint.service';

@Module({
  imports: [AuthModule, MongooseModule.forFeature([{ name: Hint.name, schema: hintSchema }]), TargetModule],
  providers: [HintService],
  controllers: [HintController],
  exports: [HintService]
})
export class HintModule {}
