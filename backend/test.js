const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  try {
    const meeting = await prisma.meeting.findFirst();
    if (!meeting) {
      console.log("No meeting found");
      return;
    }
    await prisma.meeting.update({
      where: { id: meeting.id },
      data: { agendaStatus: 'PUBLISHED' }
    });
    console.log("Success");
  } catch(e) {
    console.error("ERROR:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
run();
