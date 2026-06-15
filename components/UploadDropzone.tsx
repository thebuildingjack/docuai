"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; progress: number }
  | { status: "extracting" }
  | { status: "summarizing" }
  | { status: "done" }
  | { status: "error"; message: string };

export default function UploadDropzone() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>({ status: "idle" });
  const [dragging, setDragging] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      // Client-side validation
      if (file.type !== "application/pdf") {
        setState({ status: "error", message: "Please upload a PDF file." });
        return;
      }

      const maxMb = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_MB ?? "10", 10);
      if (file.size > maxMb * 1024 * 1024) {
        setState({
          status: "error",
          message: `File too large. Maximum size is ${maxMb}MB.`,
        });
        return;
      }

      setState({ status: "uploading", progress: 0 });

      const formData = new FormData();
      formData.append("file", file);

      // Simulate upload progress stages
      const progressInterval = setInterval(() => {
        setState((prev) =>
          prev.status === "uploading" && prev.progress < 80
            ? { status: "uploading", progress: prev.progress + 15 }
            : prev
        );
      }, 200);

      try {
        // Small delay so UI transitions feel natural
        await new Promise((r) => setTimeout(r, 400));
        setState({ status: "extracting" });

        const res = await fetch("/api/documents", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Upload failed. Please try again.");
        }

        setState({ status: "summarizing" });
        await new Promise((r) => setTimeout(r, 600));
        setState({ status: "done" });

        await new Promise((r) => setTimeout(r, 800));
        router.refresh();
        setState({ status: "idle" });
      } catch (err) {
        clearInterval(progressInterval);
        setState({
          status: "error",
          message: err instanceof Error ? err.message : "Upload failed.",
        });
      }
    },
    [router]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const isProcessing =
    state.status === "uploading" ||
    state.status === "extracting" ||
    state.status === "summarizing";

  return (
    <div className="flex flex-col items-end gap-2">
      {/* Upload Button */}
      <button
        onClick={() => !isProcessing && inputRef.current?.click()}
        disabled={isProcessing}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
          isProcessing
            ? "bg-muted text-muted-foreground cursor-not-allowed"
            : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:shadow-primary/20"
        )}
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
        Upload PDF
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Status indicator */}
      {state.status !== "idle" && (
        <div
          className={cn(
            "flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border animate-fade-in",
            state.status === "error"
              ? "bg-destructive/10 border-destructive/20 text-destructive"
              : state.status === "done"
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : "bg-primary/10 border-primary/20 text-primary"
          )}
        >
          {state.status === "uploading" && (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Uploading… {state.progress}%
            </>
          )}
          {state.status === "extracting" && (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Extracting text…
            </>
          )}
          {state.status === "summarizing" && (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              Generating summary…
            </>
          )}
          {state.status === "done" && (
            <>
              <CheckCircle2 className="w-3 h-3" />
              Done!
            </>
          )}
          {state.status === "error" && (
            <>
              <AlertCircle className="w-3 h-3" />
              {state.message}
            </>
          )}
        </div>
      )}

      {/* Drop zone — shown as an overlay zone for drag-and-drop */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "fixed inset-0 z-50 pointer-events-none flex items-center justify-center transition-all duration-200",
          dragging
            ? "bg-background/80 backdrop-blur-sm pointer-events-auto"
            : "opacity-0"
        )}
      >
        <div className="w-80 h-48 border-2 border-dashed border-primary rounded-2xl flex flex-col items-center justify-center gap-3 bg-primary/5">
          <FileText className="w-10 h-10 text-primary" />
          <p className="text-sm font-medium text-primary">Drop your PDF here</p>
        </div>
      </div>
    </div>
  );
}
