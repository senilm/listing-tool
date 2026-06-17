import { z } from "zod";

import {
  DESCRIPTION_MAX_LENGTH,
  MAX_QUANTITY,
  MIN_QUANTITY,
  priceSchema,
  TITLE_MAX_LENGTH,
} from "@/validations/product";

export const publishOverridesSchema = z.object({
  title: z.string().trim().min(1).max(TITLE_MAX_LENGTH).optional(),
  description: z.string().trim().min(1).max(DESCRIPTION_MAX_LENGTH).optional(),
  price: priceSchema.optional(),
  quantity: z.number().int().min(MIN_QUANTITY).max(MAX_QUANTITY).optional(),
});

export type PublishOverrides = z.infer<typeof publishOverridesSchema>;

export const publishAccountSchema = z.object({
  accountId: z.uuid(),
  paymentPolicyId: z.string().min(1, "Select a payment policy"),
  returnPolicyId: z.string().min(1, "Select a return policy"),
  fulfillmentPolicyId: z.string().min(1, "Select a fulfillment policy"),
  merchantLocationKey: z.string().min(1, "Select a location"),
  overrides: publishOverridesSchema.optional(),
});

export type PublishAccount = z.infer<typeof publishAccountSchema>;

export const publishRequestSchema = z.object({
  productId: z.uuid(),
  accounts: z.array(publishAccountSchema).min(1),
});

export type PublishRequest = z.infer<typeof publishRequestSchema>;
