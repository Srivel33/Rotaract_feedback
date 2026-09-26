import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = "srivel@gmail.com";
  
  const existing = await prisma.allowedEmail.findUnique({
    where: { email }
  });

  if (!existing) {
    await prisma.allowedEmail.create({
      data: { email }
    });
    console.log(`Successfully added ${email} to the allowlist!`);
  } else {
    console.log(`${email} is already in the allowlist.`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
