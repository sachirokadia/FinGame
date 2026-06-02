import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "hero@fingame.com" }
    });
    if (!user) {
      console.log("Demo user not found!");
      return;
    }
    console.log("Found user:", user.email);
    console.log("Hashed password in DB:", user.password);
    
    const isValid = await bcrypt.compare("password123", user.password);
    console.log("Bcrypt comparison result for 'password123':", isValid);
  } catch (error) {
    console.error("Database query failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
