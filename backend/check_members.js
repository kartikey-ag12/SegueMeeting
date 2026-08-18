const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const members = await prisma.organisationMember.findMany({
    include: {
      user: true,
      organisation: true
    }
  });
  console.log("MEMBERS:");
  console.log(JSON.stringify(members, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
