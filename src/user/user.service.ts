import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthDto } from '../auth/auth.dto';
import { Role } from '../common/enums/role.enum';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * Returns a user with a certain name.
   *
   * @param name the user's name
   * @returns the found user.
   */
  findByName(name: string): Promise<User> {
    return this.userModel.findOne({ name }).select('password user').lean().exec();
  }

  /**
   * Returns slug and roles based on a username.
   *
   * @param name the user's name.
   * @returns the user's roles and slug.
   */
  async findWithRoles(name: string): Promise<{ roles: Role[]; slug: string }> {
    const { roles, slug } = await this.userModel.findOne({ name }).select('roles slug').lean().exec();

    return { roles, slug };
  }

  /**
   * Returns a user based on a slug.
   *
   * @param slug the user's slug
   * @returns the found user.
   */
  async findBySlug(slug: string) {
    return this.userModel.findOne({ slug }).lean().exec();
  }

  /**
   * Creates a user.
   *
   * @param data the auth payload.
   * @returns the created user.
   */
  async create(data: AuthDto): Promise<UserDocument> {
    const created = new this.userModel(data);
    return created.save();
  }

  /**
   * Makes a user an admin.
   *
   * @param slug the user's slug.
   */
  async makeAdmin(slug: string) {
    const user = await this.findBySlug(slug);

    user.roles = [Role.Admin, Role.User];

    await this.userModel.updateOne({ slug }, user);
  }
}
