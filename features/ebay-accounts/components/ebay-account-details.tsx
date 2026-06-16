import { format } from "date-fns";

import { Typography } from "@/components/typography";
import { Card, CardContent } from "@/components/ui/card";
import { EbayAccountStatusBadge } from "@/features/ebay-accounts/components/ebay-account-status-badge";
import { type EbayAccountSummary } from "@/features/ebay-accounts/services/ebay-account-service";

type EbayAccountDetailsProps = {
  account: EbayAccountSummary;
};

export const EbayAccountDetails = ({ account }: EbayAccountDetailsProps) => {
  return (
    <Card>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Typography variant="muted" className="text-xs">
            Status
          </Typography>
          <EbayAccountStatusBadge status={account.status} />
        </div>
        <div className="space-y-1.5">
          <Typography variant="muted" className="text-xs">
            Connected
          </Typography>
          <Typography variant="small" as="p">
            {format(account.createdAt, "d MMM yyyy")}
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
};
