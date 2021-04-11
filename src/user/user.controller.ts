import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiHeaders, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { UpdateUserDto } from './user.dto';
import { UserService } from './user.service';

@ApiHeaders([
  {
    name: 'api-return-format',
    enum: ['application/json', 'text/xml'],
    required: true
  }
])
@Controller('/users')
@ApiTags('Users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiQuery({
    name: 'page',
    required: false,
    type: Number
  })
  @ApiQuery({
    name: 'amount',
    required: false,
    type: Number
  })
  @Get()
  public async findAll(@Query() params: PaginationDto) {
    return this.userService.findAll(params);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.userService.findBySlug(slug);
  }

  @Post('/:slug/admin')
  public async makeAdmin(@Param('slug') slug: string) {
    await this.userService.makeAdmin(slug);
  }

  @Put('/:slug')
  public async update(@Param('slug') slug: string, @Body() user: UpdateUserDto) {
    await this.userService.update(slug, user);
  }
}
