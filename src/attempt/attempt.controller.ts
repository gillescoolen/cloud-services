import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiHeaders, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { Roles } from '../common/decorators/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Role } from '../common/enums/role.enum';
import { PaginationResponse } from '../common/responses/pagination.response';
import { TargetService } from '../target/target.service';
import { UserDocument } from '../user/user.schema';
import { UserService } from '../user/user.service';
import { CreateAttemptDto } from './attempt.dto';
import { AttemptService } from './attempt.service';

@ApiHeaders([
  {
    name: 'api-return-format',
    enum: ['application/json', 'text/xml'],
    required: true
  }
])
@Controller('/targets/:targetSlug/attempts')
@ApiTags('Attempts')
@ApiBearerAuth()
export class AttemptController {
  constructor(
    private readonly attemptService: AttemptService,
    private readonly targetService: TargetService,
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

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
  public async findAll(@Query() params: PaginationDto, @Param('targetSlug') targetSlug: string) {
    const target = await this.targetService.findBySlug(targetSlug);

    return new PaginationResponse({
      page: params.page,
      count: target.attempts.length,
      data: target.attempts
    });
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  public async create(
    @Body() attempt: CreateAttemptDto,
    @Param('targetSlug') targetSlug: string,
    @User() user: UserDocument,
    @UploadedFile() file: Express.Multer.File
  ) {
    const target = await this.targetService.findBySlug(targetSlug);

    if (target === null) throw new NotFoundException();
    if (this.authService.hasPermission(target.user, user))
      throw new UnauthorizedException("You can't submit attempts for your own targets!");

    const created = await this.attemptService.create(target, file.filename, user);

    return created;
  }

  @Get(':attemptSlug')
  public async findBySlug(@Param('attemptSlug') attemptSlug: string, @Param('targetSlug') targetSlug: string) {
    const target = await this.targetService.findBySlug(targetSlug);
    if (target === null) throw new NotFoundException();

    const attempt = this.attemptService.findBySlug(target, attemptSlug);
    if (attempt === null) throw new NotFoundException();

    return attempt;
  }

  @Get(':attemptSlug/user')
  public async findCreatorBySlug(@Param('attemptSlug') attemptSlug: string, @Param('targetSlug') targetSlug: string) {
    const target = await this.targetService.findBySlug(targetSlug);
    if (target === null) throw new NotFoundException();

    const attempt = await this.attemptService.findBySlug(target, attemptSlug);
    if (attempt === null) throw new NotFoundException();

    return await this.userService.findById(attempt.user._id);
  }

  @Get(':attemptSlug/user/has/:badge')
  public async checkIfUserHasSlug(
    @Param('attemptSlug') attemptSlug: string,
    @Param('targetSlug') targetSlug: string,
    @Param('badgeSlug') badgeSlug: string
  ) {
    const target = await this.targetService.findBySlug(targetSlug);
    if (target === null) throw new NotFoundException();

    const attempt = await this.attemptService.findBySlug(target, attemptSlug);
    if (attempt === null) throw new NotFoundException();

    const user = await this.userService.findById(attempt.user._id);
    if (user === null) throw new NotFoundException();

    return user.badges.includes(badgeSlug);
  }

  @Roles(Role.Admin)
  @Delete(':attemptSlug')
  public async delete(
    @User() user: UserDocument,
    @Param('targetSlug') targetSlug: string,
    @Param('attemptSlug') attemptSlug: string
  ) {
    const target = await this.targetService.findBySlug(targetSlug);
    const attempt = await this.attemptService.findBySlug(target, attemptSlug);

    if (target === null || attempt === null) throw new NotFoundException();
    if (!this.authService.hasPermission(target.user, user))
      throw new UnauthorizedException("You don't have access to this attempt.");

    await this.attemptService.delete(target, attemptSlug);
  }
}
