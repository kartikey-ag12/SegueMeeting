import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  const orgId = '11111111-1111-1111-1111-111111111111';
  const userId = '22222222-2222-2222-2222-222222222222';

  // Create Organisation
  const org = await prisma.organisation.upsert({
    where: { id: orgId },
    update: {},
    create: {
      id: orgId,
      name: 'Acme Corporation',
    },
  });

  // Create User
  const user = await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: 'kartikey@example.com',
      name: 'Kartikey Agrahari',
      passwordHash: 'dummyhash',
      memberships: {
        create: {
          organisationId: orgId,
          role: 'BOARD_ADMIN',
        },
      },
    },
  });

  // Create Meeting
  const meeting = await prisma.meeting.create({
    data: {
      organisationId: orgId,
      title: 'Project Deadline',
      date: '2026-08-17',
      startTime: '09:00',
      endTime: '11:00',
      location: 'Default Location\nShakti Khand 3, Indirapuram, Ghaziabad, Uttar Pradesh, India\nTime zone: Asia/Kolkata',
      administrator: user.name,
      notes: '<p>Click here to add some notes at the top of the Agenda</p>',
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
