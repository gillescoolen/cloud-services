import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { PaginationDto } from '../common/dtos/pagination.dto';

export class HintDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  title;

  @IsOptional()
  @MaxLength(256)
  @IsString()
  description;
}

export class CreateHintDto {
  @ApiProperty()
  @IsString()
  @Length(6, 64)
  title: string;

  @ApiProperty()
  @IsString()
  @Length(6, 64)
  description: string;
}

export class UpdateHintDto extends PartialType(CreateHintDto) {}
