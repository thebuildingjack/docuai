"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  points: string[];
}

export default function KeyPoints({ points }: Props) {
  return (
    <ul className="space-y-2.5">
      {points.map((point, i) => (
        <li
          key={i}
          className="flex items-start gap-2.5 animate-fade-in"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <CheckCircle2
            className={cn(
              "w-4 h-4 flex-shrink-0 mt-0.5",
              "text-primary"
            )}
          />
          <p className="text-sm text-muted-foreground leading-relaxed">{point}</p>
        </li>
      ))}
    </ul>
  );
}
