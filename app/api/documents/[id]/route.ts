import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/auth";
import { safeError, throwSafe } from "@/lib/safeError";

interface RouteParams {
  params: { id: string };
}

// ─── GET /api/documents/[id] ──────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = auth();
    if (!userId) throwSafe("UNAUTHORIZED");

    const dbUser = await ensureUser();

    const document = await prisma.document.findFirst({
      where: { id: params.id, userId: dbUser.id },
      select: {
        id: true,
        name: true,
        summary: true,
        keyPoints: true,
        fileSize: true,
        createdAt: true,
        // rawText is intentionally excluded
      },
    });

    if (!document) throwSafe("NOT_FOUND");

    return NextResponse.json({
      ...document,
      createdAt: document.createdAt.toISOString(),
    });
  } catch (err) {
    return safeError(err);
  }
}

// ─── DELETE /api/documents/[id] ───────────────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = auth();
    if (!userId) throwSafe("UNAUTHORIZED");

    const dbUser = await ensureUser();

    // Verify ownership before deleting
    const document = await prisma.document.findFirst({
      where: { id: params.id, userId: dbUser.id },
      select: { id: true },
    });

    if (!document) throwSafe("NOT_FOUND");

    // Cascade delete handled by Prisma schema (onDelete: Cascade on Message)
    await prisma.document.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    return safeError(err);
  }
}
