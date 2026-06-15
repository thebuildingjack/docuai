"use client";

import Link from "next/link";
import { useState } from "react";
import { FileText, Calendar, HardDrive, ChevronRight, Upload } from "lucide-react";
import { cn, formatBytes, formatDate, truncate } from "@/lib/utils";

interface Document {
  id: string;
  name: string;
  summary: string | null;
  fileSize: number;
  createdAt: string;
}

interface Props {
  initialDocuments: Document[];
}

export default function DocumentList({ initialDocuments }: Props) {
  const [docs] = useState<Document[]>(initialDocuments);

  if (docs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
          <FileText className="w-8 h-8 text-primary/60" />
        </div>
        <h2 className="font-display text-xl font-semibold text-foreground mb-2">
          No documents yet
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          Upload your first PDF to get an AI-generated summary, key points, and
          a smart Q&A assistant.
        </p>
        <div className="flex items-center gap-2 mt-5 text-xs text-muted-foreground bg-muted/50 rounded-lg px-4 py-2.5">
          <Upload className="w-3.5 h-3.5" />
          Click "Upload PDF" in the top-right corner to get started
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-fade-in">
      {docs.map((doc, i) => (
        <Link
          key={doc.id}
          href={`/documents/${doc.id}`}
          className="group block"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div
            className={cn(
              "bg-card border border-border/60 rounded-xl p-5 flex flex-col gap-4",
              "hover:border-primary/30 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5",
              "transition-all duration-200 animate-fade-in"
            )}
          >
            {/* Icon + Title */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className="font-medium text-foreground text-sm leading-snug truncate"
                  title={doc.name}
                >
                  {doc.name}
                </h3>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {formatDate(doc.createdAt)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <HardDrive className="w-3 h-3" />
                    {formatBytes(doc.fileSize)}
                  </span>
                </div>
              </div>
            </div>

            {/* Summary preview */}
            {doc.summary && (
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {truncate(doc.summary, 160)}
              </p>
            )}

            {/* CTA */}
            <div className="flex items-center justify-end text-xs text-primary/70 group-hover:text-primary transition-colors">
              Open document
              <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
