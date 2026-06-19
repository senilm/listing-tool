import { format } from "date-fns";
import { RefreshCw } from "lucide-react";

import { Typography } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EbayAccountStatusBadge } from "@/features/ebay-accounts/components/ebay-account-status-badge";
import { type EbayAccountSummary } from "@/features/ebay-accounts/services/ebay-account-service";
import { ebayAccountConnectApiRoute } from "@/lib/api-routes";
import { EbayAccountStatus } from "@/lib/enums/ebay-account";

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
        {account.status === EbayAccountStatus.NeedsReconsent && (
          <div className="space-y-1.5">
            <Typography variant="muted" className="text-xs">
              Action needed
            </Typography>
            <Button asChild size="sm" variant="outline">
              <a href={ebayAccountConnectApiRoute()}>
                <RefreshCw />
                Reconnect
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
