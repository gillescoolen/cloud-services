import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model } from 'mongoose';
import { AuthDto } from '../auth/auth.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Role } from '../common/enums/role.enum';
import { UpdateUserDto } from './user.dto';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  public async findAll(pagination: PaginationDto): Promise<LeanDocument<UserDocument[]>> {
    return this.userModel
      .find()
      .limit(pagination.amount)
      .skip(pagination.amount * (pagination.page - 1))
      .lean()
      .exec();
  }

  /**
   * Returns a user with a certain name.
   *
   * @param name the user's name
   * @returns the found user.
   */
  findByName(name: string): Promise<User> {
    return this.userModel.findOne({ name }).select('password').lean().exec();
  }

  findById(id: string): Promise<UserDocument> {
    return this.userModel.findOne({ _id: id }).select('name roles badges slug').exec();
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
  async findBySlug(slug: string): Promise<UserDocument> {
    return this.userModel.findOne({ slug }).exec();
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
   * Updates a user.
   *
   * @param slug the user slug.
   * @param user the user data.
   */
  async update(slug: string, user: UpdateUserDto) {
    await this.userModel.updateOne({ slug }, user);
  }

  async makeAdmin(slug: string) {
    const user = await this.findBySlug(slug);

    user.roles = [Role.Admin, Role.User];

    await this.userModel.updateOne({ slug }, user);
  }
}
