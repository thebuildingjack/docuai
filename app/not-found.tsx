import Link from "next/link";
import { FileX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted border border-border flex items-center justify-center mb-6">
        <FileX className="w-8 h-8 text-muted-foreground" />
      </div>
      <h1 className="font-display text-3xl font-semibold text-foreground mb-2">
        Page not found
      </h1>
      <p className="text-sm text-muted-foreground mb-8 max-w-xs">
        The document or page you were looking for doesn't exist or has been
        deleted.
      </p>
      <Link
        href="/dashboard"
        className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
