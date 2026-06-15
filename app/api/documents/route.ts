import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/auth";
import { extractTextFromPdf, isPdfMagicBytes } from "@/lib/pdf";
import { generateSummary } from "@/lib/ai";
import { safeError, throwSafe } from "@/lib/safeError";

const MAX_FILE_BYTES =
  parseInt(process.env.DOCUAI_MAX_FILE_MB ?? "10", 10) * 1024 * 1024;

// ─── POST /api/documents ──────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) throwSafe("UNAUTHORIZED");

    const dbUser = await ensureUser();

    // Parse multipart form
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      throwSafe("VALIDATION_ERROR");
    }

    const file = formData.get("file") as File | null;
    if (!file) throwSafe("VALIDATION_ERROR");

    // ── File size check ───────────────────────────────────────────────────────
    if (file.size > MAX_FILE_BYTES) throwSafe("FILE_TOO_LARGE");

    // ── MIME type check ───────────────────────────────────────────────────────
    if (file.type !== "application/pdf") throwSafe("INVALID_FILE_TYPE");

    // ── Read buffer ───────────────────────────────────────────────────────────
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // ── Magic bytes check (%PDF) ──────────────────────────────────────────────
    if (!isPdfMagicBytes(buffer)) throwSafe("INVALID_FILE_TYPE");

    // ── Extract text ──────────────────────────────────────────────────────────
    const { text: rawText, truncated } = await extractTextFromPdf(buffer);

    // ── Generate AI summary ───────────────────────────────────────────────────
    const { summary, keyPoints } = await generateSummary(rawText);

    // ── Store in DB ───────────────────────────────────────────────────────────
    const document = await prisma.document.create({
      data: {
        name: file.name.replace(/\.pdf$/i, ""),
        rawText, // stored server-side; never returned to client
        summary,
        keyPoints: JSON.stringify(keyPoints),
        fileSize: file.size,
        userId: dbUser.id,
      },
      select: {
        id: true,
        name: true,
        summary: true,
        keyPoints: true,
        fileSize: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        ...document,
        createdAt: document.createdAt.toISOString(),
        truncated,
      },
      { status: 201 }
    );
  } catch (err) {
    return safeError(err);
  }
}

// ─── GET /api/documents ───────────────────────────────────────────────────────
export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) throwSafe("UNAUTHORIZED");

    const dbUser = await ensureUser();

    const documents = await prisma.document.findMany({
      where: { userId: dbUser.id },
      select: {
        id: true,
        name: true,
        summary: true,
        fileSize: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      documents.map((d) => ({ ...d, createdAt: d.createdAt.toISOString() }))
    );
  } catch (err) {
    return safeError(err);
  }
}
