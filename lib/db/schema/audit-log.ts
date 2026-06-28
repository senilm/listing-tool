import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "@/lib/db/schema/auth";
import { AuditAction, AuditEntityType } from "@/lib/enums/audit-log";

export const auditActionEnum = pgEnum(
  "audit_action",
  Object.values(AuditAction) as [string, ...string[]],
);

export const auditEntityTypeEnum = pgEnum(
  "audit_entity_type",
  Object.values(AuditEntityType) as [string, ...string[]],
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    action: auditActionEnum("action").notNull(),
    entityType: auditEntityTypeEnum("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    summary: text("summary").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("audit_log_user_id_created_at_idx").on(
      table.userId,
      table.createdAt.desc(),
    ),
    index("audit_log_entity_idx").on(table.entityType, table.entityId),
  ],
);
