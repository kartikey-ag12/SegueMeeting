const http = require('http');

async function test() {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const jwt = require('jsonwebtoken');

  const user = await prisma.user.findFirst({
    where: { email: '2k22.cse.2212451@gmail.com' } // User from previous logs
  });
  const member = await prisma.organisationMember.findFirst({
    where: { userId: user.id }
  });

  const orgId = member.organisationId;
  const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET || 'fallback_secret');

  console.log("Token:", token);
  console.log("OrgId:", orgId);

  const res = await fetch(`http://127.0.0.1:3000/organisations/${orgId}/decisions/flying`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "Test Flying Minute",
      content: "This is a test content",
      voterIds: [user.id]
    })
  });

  const text = await res.text();
  console.log("Response:", res.status, text);
}

test().catch(console.error);
