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

// eBay caps scheduled listings at ~3 weeks ahead; we validate to 21 days so the
// user gets a clean error instead of an eBay rejection.
export const MAX_SCHEDULE_DAYS = 21;
const MAX_SCHEDULE_MS = MAX_SCHEDULE_DAYS * 24 * 60 * 60 * 1000;

// Shared with the client so the publish button can mirror the server check.
export const isScheduleWindowValid = (date: Date): boolean => {
  const time = date.getTime();
  const now = Date.now();
  return time > now && time <= now + MAX_SCHEDULE_MS;
};

// Launch time handed to eBay (UTC). Optional everywhere — omit it and the
// listing goes live immediately on publish.
export const scheduledAtSchema = z.coerce
  .date()
  .refine((date) => date.getTime() > Date.now(), {
    message: "Schedule time must be in the future",
  })
  .refine((date) => date.getTime() <= Date.now() + MAX_SCHEDULE_MS, {
    message: `Cannot schedule more than ${MAX_SCHEDULE_DAYS} days ahead`,
  });

export const publishAccountSchema = z.object({
  accountId: z.uuid(),
  paymentPolicyId: z.string().min(1, "Select a payment policy"),
  returnPolicyId: z.string().min(1, "Select a return policy"),
  fulfillmentPolicyId: z.string().min(1, "Select a fulfillment policy"),
  merchantLocationKey: z.string().min(1, "Select a location"),
  overrides: publishOverridesSchema.optional(),
  scheduledAt: scheduledAtSchema.optional(),
});

export type PublishAccount = z.infer<typeof publishAccountSchema>;

export const publishRequestSchema = z.object({
  productId: z.uuid(),
  accounts: z.array(publishAccountSchema).min(1),
});

export type PublishRequest = z.infer<typeof publishRequestSchema>;
