import { StatusBadge, type StatusBadgeVariant } from "@/components/status-badge";
import { PublicationStatus } from "@/lib/enums/publication";

const STATUS_META: Record<
  PublicationStatus,
  { label: string; variant: StatusBadgeVariant }
> = {
  [PublicationStatus.Draft]: { label: "Draft", variant: "default" },
  [PublicationStatus.Scheduled]: { label: "Scheduled", variant: "info" },
  [PublicationStatus.Publishing]: { label: "Publishing", variant: "info" },
  [PublicationStatus.Published]: { label: "Published", variant: "success" },
  [PublicationStatus.Failed]: { label: "Failed", variant: "destructive" },
  [PublicationStatus.Ended]: { label: "Ended", variant: "default" },
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
