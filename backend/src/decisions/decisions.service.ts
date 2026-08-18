import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { OrganisationsService } from '../organisations/organisations.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CreateFlyingMinuteDto } from './dto/create-flying-minute.dto';
import { SubmitVoteDto } from './dto/submit-vote.dto';

@Injectable()
export class DecisionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orgService: OrganisationsService,
  ) {}

  async findAll(orgId: string, user: AuthenticatedUser) {
    await this.orgService.requireMembership(orgId, user.id);

    return this.prisma.decision.findMany({
      where: { organisationId: orgId },
      orderBy: { createdAt: 'desc' },
      include: {
        meeting: {
          select: { title: true }
        },
        votes: true,
      }
    });
  }

  async getDecisionById(orgId: string, id: string, user: AuthenticatedUser) {
    await this.orgService.requireMembership(orgId, user.id);

    const decision = await this.prisma.decision.findUnique({
      where: { id, organisationId: orgId },
      include: {
        votes: {
          include: {
            voter: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    if (!decision) {
      throw new NotFoundException('Decision not found');
    }

    return decision;
  }

  async createFlyingMinute(orgId: string, dto: CreateFlyingMinuteDto, user: AuthenticatedUser) {
    await this.orgService.requireMembership(orgId, user.id);

    // Create the decision and its voters
    return this.prisma.decision.create({
      data: {
        organisationId: orgId,
        type: 'FLYING_MINUTE',
        title: dto.title,
        content: dto.content,
        closeDate: dto.closeDate,
        date: new Date().toISOString().split('T')[0],
        status: 'OPEN',
        votes: {
          create: dto.voterIds.map(voterId => ({
            voterId
          }))
        }
      },
      include: {
        votes: true
      }
    });
  }

  async submitVote(orgId: string, decisionId: string, dto: SubmitVoteDto, user: AuthenticatedUser) {
    await this.orgService.requireMembership(orgId, user.id);

    const decision = await this.prisma.decision.findUnique({
      where: { id: decisionId, organisationId: orgId }
    });

    if (!decision) {
      throw new NotFoundException('Decision not found');
    }

    if (decision.type !== 'FLYING_MINUTE') {
      throw new BadRequestException('Can only vote on flying minutes');
    }

    if (decision.status !== 'OPEN') {
      throw new BadRequestException('This flying minute is no longer open for voting');
    }

    // Find the vote record for this user
    const voteRecord = await this.prisma.decisionVote.findUnique({
      where: {
        decisionId_voterId: {
          decisionId,
          voterId: user.id
        }
      }
    });

    if (!voteRecord) {
      throw new ForbiddenException('You are not authorized to vote on this decision');
    }

    // Update the vote
    const updatedVote = await this.prisma.decisionVote.update({
      where: { id: voteRecord.id },
      data: {
        vote: dto.vote,
        comment: dto.comment,
      }
    });

    // Check if everyone has voted, maybe auto-close or update status?
    // Left as an exercise for the frontend or a background job.

    return updatedVote;
  }
}
