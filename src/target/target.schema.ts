import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { generateSlug } from 'random-word-slugs';
import { AttemptDocument, attemptSchema } from '../attempt/attempt.schema';
import { Unit } from '../common/enums/unit.enum';
import { HintDocument, hintSchema } from '../hint/hint.schema';
import { UserDocument } from '../user/user.schema';

export type TargetDocument = Target & Document;

@Schema()
export class Target {
  @Prop({ required: true })
  slug: string;

  @Prop({ required: true, unique: false, trim: true, minlength: 3, maxlength: 64 })
  title: string;

  @Prop({ required: true, trim: true, minlength: 1, maxlength: 128 })
  location: string;

  @Prop({ required: true, trim: true, minlength: 1, maxlength: 5000 })
  radius: number;

  @Prop({ required: true, enum: Object.values(Unit) })
  unit: Unit;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'UserDocument', required: true })
  owner: UserDocument;

  @Prop({ required: true, unique: true })
  image: string;

  @Prop([{ type: String, default: [] }])
  likes: string[];

  @Prop([{ type: String, default: [] }])
  dislikes: string[];

  @Prop({ type: Number, default: 0, min: -1000, max: 1000 })
  score: number;

  @Prop([{ type: hintSchema, default: [] }])
  hints: mongoose.Types.DocumentArray<HintDocument>;

  @Prop([{ type: attemptSchema, default: [] }])
  attempts: mongoose.Types.DocumentArray<AttemptDocument>;
}

export const targetSchema = SchemaFactory.createForClass(Target);

targetSchema.pre('save', async function (this: TargetDocument, next) {
  this.slug = generateSlug(4);

  next();
});