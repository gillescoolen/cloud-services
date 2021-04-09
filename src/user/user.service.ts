import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthDto } from '../auth/auth.dto';
import { Role } from '../common/enums/role.enum';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(data: AuthDto) {
    const created = new this.userModel(data);
    return created.save();
  }

  findByName(name: string): Promise<User> {
    return this.userModel.findOne({ name }).select('password user').lean().exec();
  }

  async getRolesByName(name: string): Promise<Role[]> {
    const { roles } = await this.userModel.findOne({ name }).select('roles').lean().exec();

    return roles;
  }

  async findBySlug(slug: string) {
    return this.userModel.findOne({ slug }).lean().exec();
  }
}
