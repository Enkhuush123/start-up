const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe('ALTER PUBLICATION supabase_realtime ADD TABLE "Match";');
    console.log("Enabled realtime for Match");
  } catch (e) {
    console.log("Match error or already enabled: ", e.message);
  }
  try {
    await prisma.$executeRawUnsafe('ALTER PUBLICATION supabase_realtime ADD TABLE "Message";');
    console.log("Enabled realtime for Message");
  } catch (e) {
    console.log("Message error or already enabled: ", e.message);
  }
}

main().finally(() => prisma.$disconnect());
