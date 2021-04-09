import { Injectable } from '@nestjs/common';
import { TargetDocument } from '../target/target.schema';

@Injectable()
export class HintService {
  public async create(target: TargetDocument, title: string, description: string) {
    target.hints.push({ description, title });
    return await target.save();
  }

  public async update(target: TargetDocument, slug: string, data) {
    const hint = this.findBySlug(target, slug);
    hint.set(data);
    return await target.save();
  }

  public findBySlug(target: TargetDocument, slug: string) {
    return target.hints.find((hint) => hint.slug === slug);
  }

  public async delete(target: TargetDocument, slug: string) {
    const hint = this.findBySlug(target, slug);
    await hint.remove();
    return await target.save();
  }
}
