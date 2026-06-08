import { z } from "zod";

// Body for POST /api/publications: publish one product to one or more linked
// accounts. The listing content is snapshotted from the product server-side, so
// the client only sends the targets.
export const publishRequestSchema = z.object({
  productId: z.uuid(),
  accountIds: z.array(z.uuid()).min(1),
});

export type PublishRequest = z.infer<typeof publishRequestSchema>;
