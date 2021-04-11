import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model } from 'mongoose';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { User, UserDocument } from '../user/user.schema';
import { CreateTargetDto, UpdateTargetDto } from './target.dto';
import { Target, TargetDocument } from './target.schema';

@Injectable()
export class TargetService {
  constructor(@InjectModel(Target.name) private targetModel: Model<TargetDocument>) {}

  private populationOptions = {
    path: 'user',
    select: { name: 1, slug: 1, _id: 0 },
    model: User
  };

  /**
   * Returns all targets within the specified
   * parameters.
   *
   * @param pagination the pagination wrapper.
   * @returns the found targets.
   */
  public async findAll(pagination: PaginationDto): Promise<LeanDocument<TargetDocument[]>> {
    return this.targetModel
      .find()
      .populate(this.populationOptions)
      .limit(pagination.amount)
      .skip(pagination.amount * (pagination.page - 1))
      .lean()
      .exec();
  }

  /**
   * Returns a single target identified
   * by its slug.
   *
   * @param slug the target slug.
   * @returns the found target.
   */
  public findBySlug(slug: string): Promise<TargetDocument> {
    return this.targetModel.findOne({ slug }).populate(this.populationOptions).exec();
  }

  /**
   * Creates a target.
   *
   * @param target The target data.
   * @param image The uploaded image name.
   * @param authUser The user that created the request.
   */
  public async create(target: CreateTargetDto, image: string, user: UserDocument): Promise<TargetDocument> {
    const created = new this.targetModel({ ...target, user, image });

    return created.save();
  }

  /**
   * Updates a target.
   *
   * @param slug the targe slug.
   * @param target the updated data.
   */
  public async update(slug: string, data: UpdateTargetDto): Promise<void> {
    await this.targetModel.findOneAndUpdate({ slug }, data).populate(this.populationOptions).exec();
  }

  /**
   * Permanently deletes a target.
   *
   * @param slug the target slug.
   */
  public async delete(slug: string): Promise<TargetDocument> {
    return this.targetModel.findOneAndDelete({ slug }).exec();
  }

  /**
   * Likes a target.
   *
   * @param targetSlug the target slug.
   * @param userSlug the user slug.
   * @returns
   */
  public async like(targetSlug: string, userSlug: string): Promise<TargetDocument> {
    const target = await this.findBySlug(targetSlug);

    this.disassociate(target, userSlug);
    target.likes.push(userSlug);

    return target.save();
  }

  /**
   * Dislikes a target.
   *
   * @param targetSlug the target slug.
   * @param userSlug the user slug.
   * @returns
   */
  public async dislike(targetSlug: string, userSlug: string): Promise<TargetDocument> {
    const target = await this.findBySlug(targetSlug);

    this.disassociate(target, userSlug);
    target.dislikes.push(userSlug);

    return target.save();
  }

  /**
   * Removes a user from the target liked or disliked list.
   *
   * @param target the target.
   * @param userSlug the user slug.
   */
  private disassociate(target: TargetDocument, userSlug: string): void {
    target.dislikes = target.dislikes.filter((l) => l != userSlug);
    target.likes = target.likes.filter((l) => l != userSlug);
  }
}
