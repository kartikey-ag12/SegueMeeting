const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const decisions = await prisma.decision.findMany({
    include: {
      votes: true
    }
  });
  console.log(JSON.stringify(decisions, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
