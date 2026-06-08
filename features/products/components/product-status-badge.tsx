import { StatusBadge, type StatusBadgeVariant } from "@/components/status-badge";
import { ProductStatus } from "@/lib/enums/product";

const STATUS_META: Record<
  ProductStatus,
  { label: string; variant: StatusBadgeVariant }
> = {
  [ProductStatus.Active]: { label: "Active", variant: "success" },
  [ProductStatus.Archived]: { label: "Archived", variant: "default" },
};

type ProductStatusBadgeProps = {
  status: ProductStatus;
  className?: string;
};

export const ProductStatusBadge = ({
  status,
  className,
}: ProductStatusBadgeProps) => {
  const meta = STATUS_META[status];

  return (
    <StatusBadge variant={meta.variant} className={className}>
      {meta.label}
    </StatusBadge>
  );
};
