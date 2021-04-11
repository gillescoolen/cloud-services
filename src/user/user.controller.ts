import { Body, Controller, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiHeaders, ApiTags } from '@nestjs/swagger';
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

  @Put('/:slug')
  public async update(@Param('slug') slug: string, @Body() user: UpdateUserDto) {
    await this.userService.update(slug, user);
  }
}
