import { StatusBadge, type StatusBadgeVariant } from "@/components/status-badge";
import { EbayAccountStatus } from "@/lib/enums/ebay-account";

const STATUS_META: Record<
  EbayAccountStatus,
  { label: string; variant: StatusBadgeVariant }
> = {
  [EbayAccountStatus.Active]: { label: "Active", variant: "success" },
  [EbayAccountStatus.NeedsReconsent]: {
    label: "Needs reconsent",
    variant: "warning",
  },
  [EbayAccountStatus.Disabled]: { label: "Disabled", variant: "destructive" },
};

type EbayAccountStatusBadgeProps = {
  status: EbayAccountStatus;
  className?: string;
};

export const EbayAccountStatusBadge = ({
  status,
  className,
}: EbayAccountStatusBadgeProps) => {
  const meta = STATUS_META[status];

  return (
    <StatusBadge variant={meta.variant} className={className}>
      {meta.label}
    </StatusBadge>
  );
};
