import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, Length } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty()
  @IsString()
  @Length(3, 32)
  name: string;

  @ApiProperty()
  @IsArray()
  badges: string[];
}
