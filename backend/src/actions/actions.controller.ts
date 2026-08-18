import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';

@UseGuards(JwtAuthGuard)
@Controller('actions')
export class ActionsController {
  constructor(private readonly actionsService: ActionsService) {}

  @Get('me')
  findMyActions(@CurrentUser() user: AuthenticatedUser) {
    return this.actionsService.getActionsForUser(user.id);
  }

  @Get('organisation/:orgId')
  findOrgActions(
    @Param('orgId') orgId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.actionsService.getActionsForOrganisation(orgId, user);
  }
}
