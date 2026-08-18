import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { OrganisationsService } from '../organisations/organisations.service';
import type { AuthenticatedUser } from '../auth/auth.types';

export interface SearchResult {
  id: string;
  title: string;
  type: 'GOVERNANCE_DOCUMENT' | 'MEETING_DOCUMENT' | 'FLYING_MINUTE' | 'MEETING';
  date: string;
  url: string;
  context?: string;
}

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orgService: OrganisationsService,
  ) {}

  async search(orgId: string, user: AuthenticatedUser, query: string, filter: string): Promise<SearchResult[]> {
    // Ensure the user has access to this organisation
    await this.orgService.requireMembership(orgId, user.id);

    const results: SearchResult[] = [];
    const q = (query || '').trim().toLowerCase();

    // Determine which categories to search based on the filter
    const searchAll = filter === 'ALL';
    const searchGovDocs = searchAll || filter === 'GOVERNANCE';
    const searchMeetingDocs = searchAll || filter === 'MEETING_DOC';
    const searchFlyingMinutes = searchAll || filter === 'FLYING_MINUTE';

    // 1. Governance Documents (Documents without a meetingId)
    if (searchGovDocs && q) {
      const docs = await this.prisma.document.findMany({
        where: {
          organisationId: orgId,
          meetingId: null,
          OR: [
            { originalName: { contains: q, mode: 'insensitive' } },
            { fileName: { contains: q, mode: 'insensitive' } }
          ]
        },
        take: 20
      });
      docs.forEach(d => {
        results.push({
          id: d.id,
          title: d.originalName,
          type: 'GOVERNANCE_DOCUMENT',
          date: d.createdAt.toISOString(),
          url: `/documents`,
        });
      });
    }

    // 2. Meeting Documents (Documents with a meetingId)
    if (searchMeetingDocs && q) {
      const docs = await this.prisma.document.findMany({
        where: {
          organisationId: orgId,
          meetingId: { not: null },
          OR: [
            { originalName: { contains: q, mode: 'insensitive' } },
            { fileName: { contains: q, mode: 'insensitive' } }
          ]
        },
        include: { meeting: true },
        take: 20
      });
      docs.forEach(d => {
        results.push({
          id: d.id,
          title: d.originalName,
          type: 'MEETING_DOCUMENT',
          date: d.createdAt.toISOString(),
          context: d.meeting?.title,
          url: `/meetings/${d.meetingId}/board-pack`,
        });
      });
    }

    // 3. Flying Minutes (Decisions with type FLYING_MINUTE)
    if (searchFlyingMinutes && q) {
      const minutes = await this.prisma.decision.findMany({
        where: {
          organisationId: orgId,
          type: 'FLYING_MINUTE',
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } }
          ]
        },
        take: 20
      });
      minutes.forEach(m => {
        results.push({
          id: m.id,
          title: m.title || 'Untitled Flying Minute',
          type: 'FLYING_MINUTE',
          date: m.createdAt.toISOString(),
          url: `/between-meetings/${m.id}`,
        });
      });
    }

    // Sort combined results by date descending
    results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return results;
  }
}
