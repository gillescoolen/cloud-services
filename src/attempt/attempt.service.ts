import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import deepai from 'deepai';
import * as fs from 'fs';
import * as path from 'path';
import { TargetDocument } from '../target/target.schema';
import { UserDocument } from '../user/user.schema';

@Injectable()
export class AttemptService {
  constructor(private readonly configService: ConfigService) {}

  public async create(target: TargetDocument, image: string, owner: UserDocument) {
    const score = await this.compare(target.image, image);
    target.attempts.push({ image, score, owner });
    return target.save();
  }

  public findBySlug(target: TargetDocument, slug: string) {
    return target.attempts.find((attempt) => attempt.slug === slug);
  }

  public async delete(target: TargetDocument, slug: string) {
    const attempt = this.findBySlug(target, slug);
    await attempt.remove();
    return target.save();
  }

  private async compare(targetImage: string, attemptImage: string): Promise<number> {
    deepai.setApiKey(this.configService.get('DEEPAI_KEY'));
    const response = await deepai.callStandardApi('image-similarity', {
      image1: fs.createReadStream(`../../public/${targetImage}`),
      image2: fs.createReadStream(`../../public/${attemptImage}`)
    });

    console.log(response);

    return 0;
  }

  public hashImage(file: string) {
    return new Promise((resolve) => {
      const hash = crypto.createHash('sha1');
      fs.createReadStream(path.join(__dirname, '../..', 'public', file))
        .on('data', (data) => hash.update(data))
        .on('end', () => resolve(hash.digest('hex')));
    });
  }
}
