import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureUser } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import DocumentList from "@/components/DocumentList";
import UploadDropzone from "@/components/UploadDropzone";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  const dbUser = await ensureUser();

  const documents = await prisma.document.findMany({
    where: { userId: dbUser.id },
    select: {
      id: true,
      name: true,
      fileSize: true,
      createdAt: true,
      summary: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b border-border/50 px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {documents.length}{" "}
              {documents.length === 1 ? "document" : "documents"}
            </p>
          </div>
          <UploadDropzone />
        </header>

        {/* Body */}
        <div className="flex-1 p-6">
          <DocumentList initialDocuments={documents} />
        </div>
      </main>
    </div>
  );
}
