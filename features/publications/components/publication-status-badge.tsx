import {
  StatusBadge,
  type StatusBadgeVariant,
} from "@/components/status-badge";
import { PublicationStatus } from "@/lib/enums/publication";

const STATUS_META: Record<
  PublicationStatus,
  { label: string; variant: StatusBadgeVariant }
> = {
  [PublicationStatus.Published]: { label: "Published", variant: "success" },
  [PublicationStatus.Failed]: { label: "Failed", variant: "destructive" },
};

type PublicationStatusBadgeProps = {
  status: PublicationStatus;
  className?: string;
};

export const PublicationStatusBadge = ({
  status,
  className,
}: PublicationStatusBadgeProps) => {
  const meta = STATUS_META[status];

  return (
    <StatusBadge variant={meta.variant} className={className}>
      {meta.label}
    </StatusBadge>
  );
};
