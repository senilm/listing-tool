import {
  StatusBadge,
  type StatusBadgeVariant,
} from "@/components/status-badge";
import { AuditAction } from "@/lib/enums/audit-log";

const ACTION_META: Record<
  AuditAction,
  { label: string; variant: StatusBadgeVariant }
> = {
  [AuditAction.ProductCreated]: { label: "Created", variant: "success" },
  [AuditAction.ProductUpdated]: { label: "Updated", variant: "info" },
  [AuditAction.ProductDeleted]: { label: "Deleted", variant: "destructive" },
  [AuditAction.PublicationPublished]: {
    label: "Published",
    variant: "success",
  },
  [AuditAction.PublicationFailed]: { label: "Failed", variant: "destructive" },
  [AuditAction.EbayAccountLinked]: { label: "Connected", variant: "info" },
  [AuditAction.EbayAccountDisconnected]: {
    label: "Disconnected",
    variant: "warning",
  },
  [AuditAction.EbayAccountRenamed]: { label: "Renamed", variant: "default" },
};

type AuditActionBadgeProps = {
  action: AuditAction;
  className?: string;
};

export const AuditActionBadge = ({
  action,
  className,
}: AuditActionBadgeProps) => {
  const meta = ACTION_META[action];

  return (
    <StatusBadge variant={meta.variant} className={className}>
      {meta.label}
    </StatusBadge>
  );
};
