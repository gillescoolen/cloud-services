import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { TargetDocument } from '../target/target.schema';
import { UserDocument } from '../user/user.schema';

@Injectable()
export class AttemptService {
  public async create(target: TargetDocument, image: string, owner: UserDocument) {
    const score = await this.compareImages(target.image, image);
    target.attempts.push({ image, score, owner });
    return await target.save();
  }

  public findBySlug(target: TargetDocument, slug: string) {
    return target.attempts.find((attempt) => attempt.slug === slug);
  }

  public async delete(target: TargetDocument, slug: string) {
    const attempt = this.findBySlug(target, slug);
    await attempt.remove();
    return await target.save();
  }

  private async compareImages(targetImage: string, attemptImage: string): Promise<number> {
    return 0;
  }

  public async hashImage(file: string) {
    return new Promise((resolve) => {
      const hash = crypto.createHash('sha1');
      fs.createReadStream(path.join(__dirname, '../..', 'public', file))
        .on('data', (data) => hash.update(data))
        .on('end', () => resolve(hash.digest('hex')));
    });
  }
}
