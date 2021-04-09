import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateAttemptDto {
  @ApiProperty({ type: 'file' })
  image?: any;
}

export class UpdateAttemptDto extends PartialType(CreateAttemptDto) {}
