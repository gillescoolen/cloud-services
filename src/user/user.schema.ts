import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Document } from 'mongoose';
import { generateSlug } from 'random-word-slugs';
import { Role } from '../common/enums/role.enum';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: false, unique: true })
  slug: string;

  @Prop({ required: true, unique: true, trim: true, minlength: 3, maxlength: 32 })
  name: string;

  @Prop({ select: false, minlength: 3, maxlength: 100 })
  password: string;

  @Prop({ select: true, default: [Role.User] })
  roles: Role[];
}

export const userSchema = SchemaFactory.createForClass(User);

userSchema.pre('save', async function (this: UserDocument, next) {
  this.slug = this.slug || generateSlug(4);
  this.password = await bcrypt.hash(this.password, 16);
  next();
});

userSchema.pre('updateOne', async function (this: UserDocument, next) {
  if (this.password) this.password = await bcrypt.hash(this.password, 16);
  next();
});
