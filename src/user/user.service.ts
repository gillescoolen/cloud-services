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

  async findWithRoles(name: string): Promise<{ roles: Role[]; slug: string }> {
    const { roles, slug } = await this.userModel.findOne({ name }).select('roles slug').lean().exec();

    return { roles, slug };
  }

  async findBySlug(slug: string) {
    return this.userModel.findOne({ slug }).lean().exec();
  }

  async makeAdmin(slug: string) {
    const user = await this.findBySlug(slug);

    user.roles = [Role.Admin, Role.User];

    await this.userModel.updateOne({ slug }, user);
  }
}
