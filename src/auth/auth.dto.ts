import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
import { Role } from '../common/enums/role.enum';

export class AuthDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  password: string;

  @IsArray()
  @ApiProperty()
  roles: Role[];
}
