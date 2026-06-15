import { z } from "zod";

/** Claude summary + key points response */
export const SummaryResponseSchema = z.object({
  summary: z.string().min(1),
  keyPoints: z.array(z.string().min(1)).min(1).max(10),
});

export type SummaryResponse = z.infer<typeof SummaryResponseSchema>;

/** Chat request body */
export const ChatRequestSchema = z.object({
  question: z
    .string()
    .min(1, "Question cannot be empty")
    .max(2000, "Question too long"),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

/** Safe document returned to client (no rawText) */
export const SafeDocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string().nullable(),
  keyPoints: z.string().nullable(),
  fileSize: z.number(),
  createdAt: z.string(),
});

export type SafeDocument = z.infer<typeof SafeDocumentSchema>;
