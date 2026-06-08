import { z } from "zod";

export const renameEbayAccountSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, "Enter a label")
    .max(60, "Keep it under 60 characters"),
});

export type RenameEbayAccountValues = z.infer<typeof renameEbayAccountSchema>;
