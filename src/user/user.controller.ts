import { Controller, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiHeaders, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';

@ApiHeaders([
  {
    name: 'api-return-format',
    enum: ['application/json', 'text/xml'],
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
