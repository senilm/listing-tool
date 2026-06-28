import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { auditLog } from "@/lib/db/schema/audit-log";
import { type AuditAction, type AuditEntityType } from "@/lib/enums/audit-log";

export type AuditEventSummary = {
  id: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  summary: string;
  createdAt: Date;
};

const AUDIT_EVENT_SELECTION = {
  id: auditLog.id,
  action: auditLog.action,
  entityType: auditLog.entityType,
  entityId: auditLog.entityId,
  summary: auditLog.summary,
  createdAt: auditLog.createdAt,
};

export const listAuditEvents = async ({
  userId,
  limit,
}: {
  userId: string;
  limit: number;
}): Promise<AuditEventSummary[]> => {
  const rows = await db
    .select(AUDIT_EVENT_SELECTION)
    .from(auditLog)
    .where(eq(auditLog.userId, userId))
    .orderBy(desc(auditLog.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    ...row,
    action: row.action as AuditAction,
    entityType: row.entityType as AuditEntityType,
  }));
};
