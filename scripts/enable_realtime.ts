import { PrismaClient } from "../generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    await prisma.$executeRawUnsafe('ALTER PUBLICATION supabase_realtime ADD TABLE "Match";');
    console.log("Enabled realtime for Match");
  } catch (e: any) {
    console.log("Match error or already enabled: ", e.message);
  }
  try {
    await prisma.$executeRawUnsafe('ALTER PUBLICATION supabase_realtime ADD TABLE "Message";');
    console.log("Enabled realtime for Message");
  } catch (e: any) {
    console.log("Message error or already enabled: ", e.message);
  }
}

main().finally(() => prisma.$disconnect());
