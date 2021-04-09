import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AuthDto {
  @IsString()
  @ApiProperty({ required: true, minLength: 3, maxLength: 32 })
  name: string;

  @IsString()
  @ApiProperty({ required: true, minLength: 3, maxLength: 128 })
  password: string;
}
