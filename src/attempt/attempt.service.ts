import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as deepai from 'deepai';
import * as fs from 'fs';
import * as path from 'path';
import { TargetDocument } from '../target/target.schema';
import { User, UserDocument } from '../user/user.schema';
import { UserService } from '../user/user.service';

@Injectable()
export class AttemptService {
  constructor(private readonly configService: ConfigService, private readonly userService: UserService) {}

  private populationOptions = {
    path: 'user',
    select: { name: 1, slug: 1, _id: 0 },
    model: User
  };

  public async findBySlug(target: TargetDocument, slug: string) {
    return target.attempts.find((attempt) => attempt.slug === slug);
  }

  public async create(target: TargetDocument, image: string, authUser: UserDocument) {
    const score = await this.compare(target.image, image);
    const user = await this.userService.findBySlug(authUser.slug);

    target.attempts.push({ image, score, user });

    return target.save();
  }

  public async delete(target: TargetDocument, slug: string) {
    const attempt = await this.findBySlug(target, slug);
    await attempt.remove();
    return target.save();
  }

  /**
   * Compares two images using the DeepAI
   * image similarity service.
   *
   * @param targetImage the target's image.
   * @param attemptImage the attempt's image.
   * @returns returns a score in percentages.
   */
  private async compare(targetImage: string, attemptImage: string): Promise<number> {
    try {
      deepai.setApiKey(this.configService.get('DEEPAI_KEY'));

      const response = await deepai.callStandardApi('image-similarity', {
        image1: fs.createReadStream(this.getImagePath(targetImage)),
        image2: fs.createReadStream(this.getImagePath(attemptImage))
      });

      const distance = 100 - response.output.distance;

      return distance;
    } catch (error) {
      throw new ServiceUnavailableException(
        error,
        'DeepAI image similarity server is not working correctly. Please try again later.'
      );
    }
  }

  private getImagePath(image: string) {
    return path.join(__dirname, '../..', 'images', image);
  }
}
