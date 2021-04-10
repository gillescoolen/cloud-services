import { Controller, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiHeaders, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';

@ApiHeaders([
  {
    name: 'x-api-format',
    enum: ['text/xml', 'application/json'],
    required: true
  }
])
@Controller()
@ApiTags('Users')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('/admin/:slug')
  public async update(@Param('slug') slug: string) {
    await this.userService.makeAdmin(slug);
  }
}
