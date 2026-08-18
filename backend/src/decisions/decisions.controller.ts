import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { DecisionsService } from './decisions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CreateFlyingMinuteDto } from './dto/create-flying-minute.dto';
import { SubmitVoteDto } from './dto/submit-vote.dto';

@Controller('organisations/:orgId/decisions')
@UseGuards(JwtAuthGuard)
export class DecisionsController {
  constructor(private readonly decisionsService: DecisionsService) {}

  @Get()
  findAll(
    @Param('orgId') orgId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.decisionsService.findAll(orgId, user);
  }

  @Get(':id')
  getDecisionById(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.decisionsService.getDecisionById(orgId, id, user);
  }

  @Post('flying')
  createFlyingMinute(
    @Param('orgId') orgId: string,
    @Body() dto: CreateFlyingMinuteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.decisionsService.createFlyingMinute(orgId, dto, user);
  }

  @Post(':id/vote')
  submitVote(
    @Param('orgId') orgId: string,
    @Param('id') id: string,
    @Body() dto: SubmitVoteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.decisionsService.submitVote(orgId, id, dto, user);
  }
}
