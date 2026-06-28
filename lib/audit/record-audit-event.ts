import { db } from "@/lib/db/client";
import { auditLog } from "@/lib/db/schema/audit-log";
import { type AuditAction, type AuditEntityType } from "@/lib/enums/audit-log";

export type AuditEventInput = {
  userId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  summary: string;
  metadata?: Record<string, unknown>;
};

export const recordAuditEvent = async (
  event: AuditEventInput,
): Promise<void> => {
  try {
    await db.insert(auditLog).values({
      userId: event.userId,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      summary: event.summary,
      metadata: event.metadata ?? null,
    });
  } catch (error) {
    console.error("Failed to write audit log event", error);
  }
};
