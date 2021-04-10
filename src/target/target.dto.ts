import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsString, Length } from 'class-validator';
import { Unit } from '../common/enums/unit.enum';

export class CreateTargetDto {
  @ApiProperty()
  @IsString()
  @Length(6, 64)
  title: string;

  @ApiProperty()
  @IsString()
  @Length(1, 128)
  location: string;

  @ApiProperty()
  @IsNumberString()
  @Length(1, 5000)
  radius: number;

  @ApiProperty()
  @IsString()
  @Length(1, 512)
  hint: string;

  @ApiProperty({ enum: Unit, default: Unit.Meter.toString() })
  unit: Unit;

  @ApiProperty({ type: 'file' })
  image?: any;
}

export class UpdateTargetDto {
  @ApiProperty()
  @IsString()
  @Length(6, 64)
  title: string;

  @ApiProperty()
  @IsString()
  @Length(1, 128)
  location: string;

  @ApiProperty()
  @IsNumberString()
  @Length(1, 5000)
  radius: number;

  @ApiProperty()
  @IsString()
  @Length(1, 512)
  hint: string;

  @ApiProperty({ enum: Unit, default: Unit.Meter.toString() })
  unit: Unit;
}
