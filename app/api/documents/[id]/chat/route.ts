import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/auth";
import { chatWithDocument } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rateLimit";
import { ChatRequestSchema } from "@/lib/validators";
import { safeError, throwSafe } from "@/lib/safeError";

interface RouteParams {
  params: { id: string };
}

// ─── POST /api/documents/[id]/chat ────────────────────────────────────────────
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = auth();
    if (!userId) throwSafe("UNAUTHORIZED");

    // ── Rate limit ────────────────────────────────────────────────────────────
    const { allowed, remaining, resetAt } = checkRateLimit(userId);
    if (!allowed) throwSafe("RATE_LIMITED");

    const dbUser = await ensureUser();

    // ── Validate request body ─────────────────────────────────────────────────
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throwSafe("VALIDATION_ERROR");
    }

    const parsed = ChatRequestSchema.safeParse(body);
    if (!parsed.success) throwSafe("VALIDATION_ERROR");

    const { question } = parsed.data;

    // ── Authorize: verify document belongs to user ────────────────────────────
    const document = await prisma.document.findFirst({
      where: { id: params.id, userId: dbUser.id },
      select: {
        id: true,
        rawText: true, // used for AI context, never returned to client
        summary: true,
        keyPoints: true,
      },
    });

    if (!document) throwSafe("NOT_FOUND");

    // ── Fetch recent chat history ─────────────────────────────────────────────
    const historyRows = await prisma.message.findMany({
      where: { documentId: document.id },
      select: { role: true, content: true },
      orderBy: { createdAt: "asc" },
      take: 20, // last 20 messages
    });

    const keyPoints: string[] = document.keyPoints
      ? JSON.parse(document.keyPoints)
      : [];

    // ── Call Claude ───────────────────────────────────────────────────────────
    const answer = await chatWithDocument({
      question,
      rawText: document.rawText,
      summary: document.summary,
      keyPoints,
      history: historyRows.map((h) => ({
        role: h.role as "USER" | "ASSISTANT",
        content: h.content,
      })),
    });

    // ── Persist both messages ─────────────────────────────────────────────────
    await prisma.message.createMany({
      data: [
        { role: "USER", content: question, documentId: document.id },
        { role: "ASSISTANT", content: answer, documentId: document.id },
      ],
    });

    return NextResponse.json(
      {
        answer,
        rateLimitRemaining: remaining,
        rateLimitResetAt: new Date(resetAt).toISOString(),
      },
      { status: 200 }
    );
  } catch (err) {
    return safeError(err);
  }
}

// ─── GET /api/documents/[id]/chat ─────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = auth();
    if (!userId) throwSafe("UNAUTHORIZED");

    const dbUser = await ensureUser();

    // Verify ownership
    const document = await prisma.document.findFirst({
      where: { id: params.id, userId: dbUser.id },
      select: { id: true },
    });

    if (!document) throwSafe("NOT_FOUND");

    const messages = await prisma.message.findMany({
      where: { documentId: document.id },
      select: { id: true, role: true, content: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      messages.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))
    );
  } catch (err) {
    return safeError(err);
  }
}
