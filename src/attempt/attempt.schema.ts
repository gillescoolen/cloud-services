import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { generateSlug } from 'random-word-slugs';
import { UserDocument } from '../user/user.schema';

export type AttemptDocument = Attempt & Document;

@Schema()
export class Attempt {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true, unique: true })
  image: string;

  @Prop({ required: true })
  score: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'UserDocument', required: true })
  owner: UserDocument;
}

export const attemptSchema = SchemaFactory.createForClass(Attempt);

attemptSchema.pre('save', async function (this: AttemptDocument, next) {
  if (this.score > 100 || this.score < 1) throw new Error('Score cannot be greater than 100 or less than 1');

  this.slug = generateSlug(4);

  next();
});
