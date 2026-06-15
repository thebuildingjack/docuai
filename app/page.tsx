import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { FileText, Zap, MessageSquare, Shield } from "lucide-react";

export default async function Home() {
  const { userId } = auth();
  if (userId) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="border-b border-border/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-semibold text-lg">DocuAI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 text-center py-24">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          <Zap className="w-3 h-3" />
          Powered by Claude
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight max-w-3xl">
          Understand any PDF{" "}
          <span className="text-primary">instantly</span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed">
          Upload a document and get an AI-generated summary, key points, and
          an intelligent Q&A assistant — grounded entirely in your content.
        </p>

        <div className="flex items-center gap-4">
          <Link
            href="/sign-up"
            className="bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20 text-sm"
          >
            Upload your first PDF
          </Link>
          <Link
            href="/sign-in"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in →
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/50 px-6 py-20">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: FileText,
              title: "Instant summaries",
              desc: "Get a concise summary and 5–7 key points extracted from any PDF in seconds.",
            },
            {
              icon: MessageSquare,
              title: "Document chat",
              desc: "Ask questions in plain English. Claude answers only from your document, never hallucinating.",
            },
            {
              icon: Shield,
              title: "Private by design",
              desc: "Raw text never leaves the server. Your documents are scoped to your account only.",
            },
          ].map((f) => (
            <div key={f.title} className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/50 px-6 py-6 text-center text-xs text-muted-foreground">
        DocuAI — Built with Next.js, Clerk, Prisma & Claude
      </footer>
    </main>
  );
}
