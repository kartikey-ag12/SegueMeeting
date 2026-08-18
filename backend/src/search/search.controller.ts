import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';

@Controller('organisations/:orgId/search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(
    @Param('orgId') orgId: string,
    @Query('q') query: string,
    @Query('filter') filter: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.searchService.search(orgId, user, query, filter || 'ALL');
  }
}
