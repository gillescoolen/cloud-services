import { IsOptional, IsPositive } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaginationDto {
  @IsPositive()
  @IsOptional()
  @Transform((v) => parseInt(v.value))
  page = 1;

  @IsPositive()
  @IsOptional()
  @Transform((v) => parseInt(v.value))
  amount = 20;
}
