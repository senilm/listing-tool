import { Store } from "lucide-react";

import { Typography } from "@/components/typography";
import { ConnectEbayAccountButton } from "@/features/ebay-accounts/components/connect-ebay-account-button";

export const EbayAccountsEmpty = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Store className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <Typography variant="large">No eBay accounts linked</Typography>
        <Typography variant="muted">
          Connect an eBay seller account to start publishing listings.
        </Typography>
      </div>
      <ConnectEbayAccountButton />
    </div>
  );
};
