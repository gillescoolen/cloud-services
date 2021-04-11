import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as deepai from 'deepai';
import * as fs from 'fs';
import * as path from 'path';
import { TargetDocument } from '../target/target.schema';
import { UserDocument } from '../user/user.schema';
import { UserService } from '../user/user.service';

@Injectable()
export class AttemptService {
  constructor(private readonly configService: ConfigService, private readonly userService: UserService) {}

  public async findBySlug(target: TargetDocument, slug: string) {
    return target.attempts.find((attempt) => attempt.slug === slug);
  }

  public async create(target: TargetDocument, image: string, authUser: UserDocument) {
    const score = await this.compare(target.image, image);
    const user = await this.userService.findByName(authUser.name);

    target.attempts.push({ image, score, user });

    return target.save();
  }
  public async delete(target: TargetDocument, slug: string) {
    const attempt = await this.findBySlug(target, slug);
    await attempt.remove();
    return target.save();
  }

  public hashImage(image: string) {
    return new Promise((resolve) => {
      const hash = crypto.createHash('sha1');
      fs.createReadStream(this.getImagePath(image))
        .on('data', (data) => hash.update(data))
        .on('end', () => resolve(hash.digest('hex')));
    });
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

      const distance = response.output.distance;

      const result = Math.floor(100 - (distance / 40) * 100);

      return result;
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
