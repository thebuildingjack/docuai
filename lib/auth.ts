import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

/**
 * Get the authenticated Clerk user ID, throwing if not authenticated.
 */
export function requireAuth(): string {
  const { userId } = auth();
  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }
  return userId;
}

/**
 * Upsert the Clerk user into our DB, returning the DB user.
 * Call this on protected pages/routes to ensure the user exists.
 */
export async function ensureUser() {
  const { userId } = auth();
  if (!userId) throw new Error("UNAUTHORIZED");

  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("UNAUTHORIZED");

  const email =
    clerkUser.emailAddresses[0]?.emailAddress ?? `${userId}@unknown.com`;

  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: { email },
    create: { clerkId: userId, email },
  });

  return user;
}

/**
 * Get DB user by Clerk ID (throws if not found).
 */
export async function getDbUser(clerkId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) throw new Error("USER_NOT_FOUND");
  return user;
}
