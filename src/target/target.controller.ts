import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
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
import { UserDocument } from '../user/user.schema';
import { CreateTargetDto, UpdateTargetDto } from './target.dto';
import { TargetService } from './target.service';

@ApiHeaders([
  {
    name: 'api-return-format',
    enum: ['application/json', 'text/xml'],
    required: true
  }
])
@Controller('/targets')
@ApiTags('Targets')
@ApiBearerAuth()
export class TargetController {
  constructor(private readonly targetService: TargetService, private readonly authService: AuthService) {}

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
    const targets = await this.targetService.findAll(params);

    return new PaginationResponse({
      page: params.page,
      count: targets.length,
      data: targets
    });
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  public async create(
    @Body() target: CreateTargetDto,
    @User() user: UserDocument,
    @UploadedFile() file: Express.Multer.File
  ) {
    await this.targetService.create(target, file.filename, user);
  }

  @Post(':slug/like')
  public async like(@Param('slug') slug: string, @User() user: UserDocument) {
    const target = await this.targetService.findBySlug(slug);

    if (target === null) throw new NotFoundException();

    return await this.targetService.like(target.slug, user.slug);
  }

  @Post(':slug/dislike')
  public async dislike(@Param('slug') slug: string, @User() user: UserDocument) {
    const target = await this.targetService.findBySlug(slug);

    if (target === null) throw new NotFoundException();

    return await this.targetService.dislike(target.slug, user.slug);
  }

  @Get(':targetSlug')
  public findBySlug(@Param('targetSlug') targetSlug: string) {
    const target = this.targetService.findBySlug(targetSlug);

    if (target === null) throw new NotFoundException();

    return target;
  }

  @Put(':targetSlug')
  public async update(
    @Param('targetSlug') targetSlug: string,
    @Body() target: UpdateTargetDto,
    @User() user: UserDocument
  ) {
    const currentTarget = await this.targetService.findBySlug(targetSlug);

    if (currentTarget === null) throw new NotFoundException();

    if (!this.authService.hasPermission(currentTarget.user, user))
      throw new UnauthorizedException("You don't have access to this target.");

    await this.targetService.update(targetSlug, target);
  }

  @Roles(Role.Admin)
  @Delete(':targetSlug')
  public async delete(@User() user: UserDocument, @Param('targetSlug') targetSlug: string) {
    const currentTarget = await this.targetService.findBySlug(targetSlug);

    if (currentTarget === null) throw new NotFoundException();
    if (!this.authService.hasPermission(currentTarget.user, user))
      throw new UnauthorizedException("You don't have access to this target.");

    await currentTarget.delete();
  }
}
