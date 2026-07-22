import { prisma } from "./lib/prisma";

async function main() {
  await prisma.message.deleteMany();
  await prisma.match.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();
  console.log("All users and related data deleted successfully.");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
