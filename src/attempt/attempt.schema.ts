import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { generateSlug } from 'random-word-slugs';
import { UserDocument } from '../user/user.schema';

export type AttemptDocument = Attempt & Document;

@Schema()
export class Attempt {
  @Prop({ required: false, unique: true })
  slug: string;

  @Prop({ required: true, unique: true })
  image: string;

  @Prop({ required: true })
  score: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'UserDocument', required: true })
  user: UserDocument;
}

export const attemptSchema = SchemaFactory.createForClass(Attempt);

attemptSchema.pre('save', async function (this: AttemptDocument, next) {
  this.slug = this.slug || generateSlug(4);

  next();
});
