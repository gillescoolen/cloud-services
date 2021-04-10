import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Role } from '../common/enums/role.enum';
import { UserDocument } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { AuthDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UserService, private readonly jwtService: JwtService) {}

  async register(data: AuthDto): Promise<string> {
    const user = await this.usersService.create(data);
    return this.jwtService.sign({ name: user.name });
  }

  async login(data: AuthDto): Promise<string | null> {
    const user = await this.usersService.findByName(data.name);
    const match = await bcrypt.compare(data.password, user.password);
    return match ? this.jwtService.sign({ name: data.name }) : null;
  }

  public hasPermission(user: UserDocument, authenticatedUser: UserDocument): boolean {
    return authenticatedUser.slug === user.slug || authenticatedUser.roles?.includes(Role.Admin);
  }
}
