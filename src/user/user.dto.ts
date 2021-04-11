import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, Length } from 'class-validator';
import { Role } from '../common/enums/role.enum';
import { Unit } from '../common/enums/unit.enum';

export class UpdateUserDto {
  @ApiProperty()
  @IsString()
  @Length(3, 32)
  name: string;

  @ApiProperty({ enum: Unit, default: Role.User.toString(), isArray: true })
  @IsArray()
  roles: Role[];

  @ApiProperty()
  @IsArray()
  badges: string[];
}
