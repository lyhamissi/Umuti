
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("--- Query 1: findMany with skip/take ---");
    await prisma.medicine.findMany({
        take: 50,
        skip: 0,
        orderBy: { name: "asc" }
    });

    console.log("\n--- Query 2: count without skip ---");
    await prisma.medicine.count();

    console.log("\n--- Query 3: count with skip (should match user log) ---");
    await (prisma.medicine as any).count({
        skip: 0
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
