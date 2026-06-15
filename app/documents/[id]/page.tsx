import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import KeyPoints from "@/components/KeyPoints";
import Chat from "@/components/Chat";
import DeleteDocumentButton from "@/components/DeleteDocumentButton";
import { FileText, Calendar, HardDrive } from "lucide-react";
import { formatBytes, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function DocumentPage({ params }: Props) {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

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
      messages: {
        select: { id: true, role: true, content: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!document) notFound();

  const keyPoints: string[] = document.keyPoints
    ? JSON.parse(document.keyPoints)
    : [];

  const initialMessages = document.messages.map((m) => ({
    id: m.id,
    role: m.role as "USER" | "ASSISTANT",
    content: m.content,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="border-b border-border/50 px-6 py-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1
                className="font-display text-xl font-semibold text-foreground truncate"
                title={document.name}
              >
                {document.name}
              </h1>
              <div className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {formatDate(document.createdAt)}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <HardDrive className="w-3 h-3" />
                  {formatBytes(document.fileSize)}
                </span>
              </div>
            </div>
          </div>
          <DeleteDocumentButton documentId={document.id} />
        </header>

        {/* Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left panel: Summary + Key Points */}
          <div className="lg:w-80 xl:w-96 border-b lg:border-b-0 lg:border-r border-border/50 overflow-y-auto p-6 flex flex-col gap-6">
            {/* Summary */}
            <section>
              <h2 className="font-display text-base font-semibold text-foreground mb-3">
                Summary
              </h2>
              {document.summary ? (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {document.summary}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground/50 italic">
                  No summary available.
                </p>
              )}
            </section>

            {/* Key Points */}
            {keyPoints.length > 0 && (
              <section>
                <h2 className="font-display text-base font-semibold text-foreground mb-3">
                  Key Points
                </h2>
                <KeyPoints points={keyPoints} />
              </section>
            )}
          </div>

          {/* Right panel: Chat */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Chat
              documentId={document.id}
              initialMessages={initialMessages}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
