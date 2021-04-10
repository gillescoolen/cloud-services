import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { generateSlug } from 'random-word-slugs';
import { AttemptDocument, attemptSchema } from '../attempt/attempt.schema';
import { Unit } from '../common/enums/unit.enum';
import { UserDocument } from '../user/user.schema';

export type TargetDocument = Target & Document;

@Schema()
export class Target {
  @Prop({ required: false })
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
  user: UserDocument;

  @Prop({ required: true, unique: true })
  image: string;

  @Prop([{ type: String, default: [] }])
  likes: string[];

  @Prop([{ type: String, default: [] }])
  dislikes: string[];

  @Prop({ type: Number, default: 0 })
  score: number;

  @Prop({ type: String, default: '', minlength: 0, maxlength: 512 })
  hint: string;

  @Prop([{ type: attemptSchema, default: [] }])
  attempts: mongoose.Types.DocumentArray<AttemptDocument>;
}

export const targetSchema = SchemaFactory.createForClass(Target);

targetSchema.pre('save', async function (this: TargetDocument, next) {
  this.slug = this.slug || generateSlug(4);
  this.score = this.likes.length - this.dislikes.length;

  next();
});
