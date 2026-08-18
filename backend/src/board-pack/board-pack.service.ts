import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../common/database/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import type { AuthenticatedUser } from '../auth/auth.types';
import * as puppeteer from 'puppeteer';
import { PDFDocument } from 'pdf-lib';

@Injectable()
export class BoardPackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async generateBoardPackPdf(meetingId: string, user: AuthenticatedUser): Promise<Buffer> {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        organisation: true,
        agendaSections: {
          include: {
            items: { 
              orderBy: { position: 'asc' },
              include: { documents: true }
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!meeting) {
      throw new NotFoundException('Meeting not found');
    }

    // Auth check: Is user part of the organisation?
    const membership = await this.prisma.organisationMember.findUnique({
      where: {
        organisationId_userId: {
          organisationId: meeting.organisationId,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Access denied');
    }

    if (meeting.agendaStatus !== 'PUBLISHED') {
      throw new ForbiddenException('Cannot generate board pack until agenda is published');
    }

    // Build HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${meeting.title} - Board Pack</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          h1 { color: #1e1b4b; text-align: center; margin-top: 100px; }
          h2 { border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 40px; }
          .cover-page { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
          .page-break { page-break-before: always; }
          .meta { font-size: 1.2rem; margin: 10px 0; color: #64748b; }
          .section-title { font-size: 1.5rem; color: #334155; margin-top: 30px; }
          .item-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-top: 15px; }
          .item-title { font-weight: bold; font-size: 1.2rem; }
          .item-meta { color: #64748b; font-size: 0.9rem; margin-top: 5px; }
          .doc-badge { display: inline-block; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; margin-top: 8px; }
        </style>
      </head>
      <body>
        <div class="cover-page">
          <h1>${meeting.organisation.name}</h1>
          <h2>Board Pack: ${meeting.title}</h2>
          <div class="meta"><strong>Date:</strong> ${meeting.date}</div>
          <div class="meta"><strong>Time:</strong> ${meeting.startTime} - ${meeting.endTime}</div>
          <div class="meta"><strong>Location:</strong> ${meeting.location}</div>
        </div>

        <div class="page-break"></div>

        <h2>Agenda</h2>
        ${meeting.agendaSections.map(section => `
          <div class="section-title">${section.title}</div>
          ${section.items.map(item => `
            <div class="item-box">
              <div class="item-title">${item.title}</div>
              <div class="item-meta">
                Purpose: ${item.purpose.replace('_', ' ')} | 
                Duration: ${item.durationMinutes}m | 
                Presenter: ${item.presenter || 'Unassigned'}
              </div>
              ${item.documents.length > 0 ? `
                <div style="margin-top: 8px;">
                  ${item.documents.map(doc => `<span class="doc-badge">📄 ${doc.originalName}</span>`).join(' ')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        `).join('')}
      </body>
      </html>
    `;

    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
      
      const coverPdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
      });
      
      await browser.close();
      
      // Load the generated cover PDF into pdf-lib
      const mergedPdf = await PDFDocument.load(coverPdfBuffer);

      // Extract all documents from all agenda items in order
      const attachedDocs = meeting.agendaSections.flatMap(section =>
        section.items.flatMap(item => item.documents)
      );

      // Iterate through attachments and append them if they are PDFs or images
      for (const doc of attachedDocs) {
        try {
          const res = await fetch(doc.storagePath);
          if (!res.ok) {
            console.warn(`Could not fetch document ${doc.id} from ${doc.storagePath}`);
            continue;
          }
          
          const fileBuffer = await res.arrayBuffer();

          if (doc.mimeType === 'application/pdf') {
            const externalPdf = await PDFDocument.load(fileBuffer);
            const copiedPages = await mergedPdf.copyPages(externalPdf, externalPdf.getPageIndices());
            copiedPages.forEach((page) => {
              mergedPdf.addPage(page);
            });
          } else if (doc.mimeType.startsWith('image/')) {
            let image;
            if (doc.mimeType === 'image/jpeg' || doc.mimeType === 'image/jpg') {
              image = await mergedPdf.embedJpg(fileBuffer);
            } else if (doc.mimeType === 'image/png') {
              image = await mergedPdf.embedPng(fileBuffer);
            }
            
            if (image) {
              const page = mergedPdf.addPage();
              const { width, height } = page.getSize();
              const imgDims = image.scaleToFit(width - 40, height - 40);
              page.drawImage(image, {
                x: page.getWidth() / 2 - imgDims.width / 2,
                y: page.getHeight() / 2 - imgDims.height / 2,
                width: imgDims.width,
                height: imgDims.height,
              });
            }
          } else {
            console.warn(`Skipping unsupported document type: ${doc.mimeType}`);
          }
        } catch (fetchErr) {
          console.error(`Failed to process document ${doc.id}:`, fetchErr);
        }
      }
      
      const finalPdfBytes = await mergedPdf.save();
      return Buffer.from(finalPdfBytes);
    } catch (error) {
      console.error('Puppeteer/PDF generation error:', error);
      throw new InternalServerErrorException('Failed to generate PDF board pack');
    }
  }
}
