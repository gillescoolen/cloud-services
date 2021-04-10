import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { ApiHeaders, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { AuthDto } from './auth.dto';
import { AuthService } from './auth.service';

@ApiHeaders([
  {
    name: 'api-return-format',
    enum: ['text/xml', 'application/json'],
    required: true
  }
])
@Controller()
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() data: AuthDto) {
    return {
      token: await this.authService.register(data)
    };
  }

  @Public()
  @Post('login')
  async login(@Body() data: AuthDto) {
    const token = await this.authService.login(data);

    if (!token) throw new UnauthorizedException();

    return {
      token
    };
  }
}
