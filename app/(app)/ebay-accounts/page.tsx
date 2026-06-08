import { Suspense } from "react";

import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EbayAccountsTable } from "@/features/ebay-accounts/components/ebay-accounts-table";
import { EbayConnectFeedback } from "@/features/ebay-accounts/components/ebay-connect-feedback";

const EbayAccountsPage = () => {
  return (
    <div>
      <PageHeader
        title="eBay Accounts"
        description="Linked eBay seller accounts."
      />

      <Suspense>
        <EbayConnectFeedback />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <EbayAccountsTable />
      </Suspense>
    </div>
  );
};

export default EbayAccountsPage;
