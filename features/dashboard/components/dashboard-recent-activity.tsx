import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

import { TruncatedText } from "@/components/truncated-text";
import { Typography } from "@/components/typography";
import { Card, CardContent } from "@/components/ui/card";
import { PublicationStatusBadge } from "@/features/publications/components/publication-status-badge";
import { type PublicationSummary } from "@/features/publications/services/publication-service";
import { publicationsRoute } from "@/lib/routes";

type DashboardRecentActivityProps = {
  items: PublicationSummary[];
};

export const DashboardRecentActivity = ({
  items,
}: DashboardRecentActivityProps) => (
  <Card className="gap-0 overflow-hidden py-0">
    <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
      <Typography variant="small">Recent activity</Typography>
      <Link
        href={publicationsRoute()}
        className="text-xs font-medium text-primary hover:underline"
      >
        View all
      </Link>
    </div>
    <CardContent className="px-0 py-0">
      {items.length === 0 ? (
        <Typography variant="muted" className="px-4 py-6">
          No publications yet. Publish a product to an eBay account to see it
          here.
        </Typography>
      ) : (
        <ul className="divide-y">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 px-4 py-2.5"
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <TruncatedText className="text-sm font-medium">
                  {item.productTitle}
                </TruncatedText>
                <Typography variant="muted" className="truncate text-xs">
                  {item.accountLabel}
                </Typography>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <PublicationStatusBadge status={item.status} />
                <span className="hidden w-30 text-right text-xs text-muted-foreground sm:inline">
                  {formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);
