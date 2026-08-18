import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { OrganisationsService } from '../organisations/organisations.service';
import type { AuthenticatedUser } from '../auth/auth.types';

@Injectable()
export class ActionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly organisationsService: OrganisationsService,
  ) {}

  async getActionsForUser(userId: string) {
    return this.prisma.minutesActionItem.findMany({
      where: { assigneeId: userId },
      include: {
        minutes: {
          include: {
            meeting: {
              select: { id: true, title: true, date: true, organisationId: true }
            }
          }
        },
        assignee: { select: { id: true, name: true, email: true } }
      },
      orderBy: { dueDate: 'asc' }
    });
  }

  async getActionsForOrganisation(orgId: string, user: AuthenticatedUser) {
    // 1. Verify tenant membership
    await this.organisationsService.requireMembership(orgId, user.id);

    return this.prisma.minutesActionItem.findMany({
      where: {
        minutes: {
          meeting: {
            organisationId: orgId
          }
        }
      },
      include: {
        minutes: {
          include: {
            meeting: {
              select: { id: true, title: true, date: true, organisationId: true }
            }
          }
        },
        assignee: { select: { id: true, name: true, email: true } }
      },
      orderBy: { dueDate: 'asc' }
    });
  }
}
