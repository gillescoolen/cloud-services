import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { User, UserDocument } from '../user/user.schema';
import { CreateTargetDto, UpdateTargetDto } from './target.dto';
import { Target, TargetDocument } from './target.schema';

@Injectable()
export class TargetService {
  constructor(@InjectModel(Target.name) private targetModel: Model<TargetDocument>) {}

  private populationOptions = {
    path: 'owner',
    select: { name: 1, slug: 1, _id: 0 },
    model: User
  };

  public async create(target: CreateTargetDto, image: string, owner: UserDocument) {
    const created = new this.targetModel({ ...target, owner, image });
    return await created.save();
  }

  public async all(params: PaginationDto) {
    return await this.targetModel
      .find()
      .populate(this.populationOptions)
      .limit(params.amount)
      .skip(params.amount * (params.page - 1))
      .lean()
      .exec();
  }

  public findBySlug(slug: string) {
    return this.targetModel.findOne({ slug }).populate(this.populationOptions).exec();
  }

  public async update(slug: string, target: UpdateTargetDto, image: string | undefined = undefined) {
    let data = {
      ...target
    };

    if (image) data = { ...data, image };

    return await this.targetModel.findOneAndUpdate({ slug }, data).populate(this.populationOptions).exec();
  }

  public async like(targetSlug: string, userSlug: string) {
    const target = await this.findBySlug(targetSlug);

    this.disassociate(target, userSlug);
    target.likes.push(userSlug);
    target.score++;

    return await target.save();
  }
  public async dislike(targetSlug: string, userSlug: string) {
    const target = await this.findBySlug(targetSlug);

    this.disassociate(target, userSlug);
    target.dislikes.push(userSlug);
    target.score--;

    return await target.save();
  }

  public async delete(slug: string) {
    return await this.targetModel.findOneAndDelete({ slug }).exec();
  }

  private disassociate(target: TargetDocument, userSlug: string) {
    target.dislikes = target.dislikes.filter((l) => l != userSlug);
    target.likes = target.likes.filter((l) => l != userSlug);
  }
}
