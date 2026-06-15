/**
 * prisma/seed.ts
 *
 * Optional seed — creates a demo user.
 * Run with: npx ts-node prisma/seed.ts
 *
 * Note: In production, users are created automatically via Clerk webhooks
 * or on first authenticated request via ensureUser().
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database…");

  // Demo user (replace clerkId/email with real values from your Clerk dashboard)
  const user = await prisma.user.upsert({
    where: { clerkId: "user_demo_seed" },
    update: {},
    create: {
      clerkId: "user_demo_seed",
      email: "demo@docuai.example",
    },
  });

  console.log(`✅ Upserted user: ${user.email} (${user.id})`);
  console.log("✨ Seed complete.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
