import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { generateSlug } from 'random-word-slugs';

export type HintDocument = Hint & Document;

@Schema()
export class Hint {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true, unique: false, trim: true, minlength: 3, maxlength: 64 })
  title: string;

  @Prop({ required: true, unique: false, trim: true, minlength: 1, maxlength: 256 })
  description: string;
}

export const hintSchema = SchemaFactory.createForClass(Hint);

hintSchema.pre('save', async function (this: HintDocument, next) {
  this.slug = generateSlug(4);

  next();
});
