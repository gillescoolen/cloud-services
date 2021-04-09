import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeaders, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { User } from '../common/decorators/user.decorator';
import { PaginationResponse } from '../common/responses/pagination.response';
import { TargetService } from '../target/target.service';
import { UserDocument } from '../user/user.schema';
import { CreateHintDto, HintDto, UpdateHintDto } from './hint.dto';
import { HintService } from './hint.service';

@ApiHeaders([
  {
    name: 'x-api-format',
    enum: ['text/xml', 'application/json'],
    required: true
  }
])
@Controller('/target/:targetSlug/hints')
@ApiTags('Hints')
@ApiBearerAuth()
export class HintController {
  constructor(
    private readonly hintService: HintService,
    private readonly targetService: TargetService,
    private readonly authService: AuthService
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
  public async all(@Query() params: HintDto, @Param('targetSlug') targetSlug: string) {
    const target = await this.targetService.findBySlug(targetSlug);

    if (target === null) throw new NotFoundException();

    return new PaginationResponse({
      page: params.page,
      count: target.hints.length,
      data: target.hints
    });
  }

  @Post()
  public async create(
    @Body() hint: CreateHintDto,
    @Param('targetSlug') targetSlug: string,
    @User() user: UserDocument
  ) {
    const target = await this.targetService.findBySlug(targetSlug);

    if (target === null) throw new NotFoundException();

    if (!this.authService.hasPermission(target.owner, user))
      throw new UnauthorizedException("You don't have access to this hint.");

    await this.hintService.create(target, hint.title, hint.description);
  }

  @Get(':id')
  public async findBySlug(@Param('hintSlug') hintSlug: string, @Param('targetSlug') targetSlug: string) {
    const target = await this.targetService.findBySlug(targetSlug);

    if (target === null) throw new NotFoundException();

    const hint = this.hintService.findBySlug(target, hintSlug);

    if (hint === null) throw new NotFoundException();

    return hint;
  }

  @Patch(':targetSlug/:hintSlug')
  public async update(
    @Param('hintSlug') hintSlug: string,
    @Param('targetSlug') targetSlug: string,
    @Body() hint: UpdateHintDto,
    @User() user: UserDocument
  ) {
    const target = await this.targetService.findBySlug(targetSlug);

    if (target === null) throw new NotFoundException();
    if (!this.authService.hasPermission(target.owner, user))
      throw new UnauthorizedException("You don't have access to this hint.");

    const existingHint = this.hintService.findBySlug(target, hintSlug);

    if (existingHint === null) throw new NotFoundException();

    await this.hintService.update(target, hintSlug, hint);
  }

  @Delete(':targetSlug/:hintSlug')
  public async delete(
    @User() user: UserDocument,
    @Param('targetSlug') targetSlug: string,
    @Param('hintSlug') hintSlug: string
  ) {
    const target = await this.targetService.findBySlug(targetSlug);

    if (target === null) throw new NotFoundException();

    if (!this.authService.hasPermission(target.owner, user))
      throw new UnauthorizedException("You don't have access to this hint.");

    const hint = this.hintService.findBySlug(target, hintSlug);

    if (hint === null) throw new NotFoundException();

    await this.hintService.delete(target, hintSlug);
  }
}
