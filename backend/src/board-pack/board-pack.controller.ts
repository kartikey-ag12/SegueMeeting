import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { BoardPackService } from './board-pack.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import type { Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('meetings/:meetingId/pack')
export class BoardPackController {
  constructor(private readonly boardPackService: BoardPackService) {}

  @Get()
  async generatePack(
    @Param('meetingId') meetingId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.boardPackService.generateBoardPackPdf(meetingId, user);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=board-pack-${meetingId}.pdf`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }
}
