import { Suspense } from "react";

import { DataTableFallback } from "@/components/data-table/data-table-fallback";
import { PageHeader } from "@/components/page-header";
import { EbayAccountsTable } from "@/features/ebay-accounts/components/ebay-accounts-table";
import { EbayConnectFeedback } from "@/features/ebay-accounts/components/ebay-connect-feedback";

const EbayAccountsPage = () => {
  return (
    <>
      <PageHeader
        title="eBay Accounts"
        description="Linked eBay seller accounts."
      />

      <Suspense>
        <EbayConnectFeedback />
      </Suspense>

      <Suspense fallback={<DataTableFallback />}>
        <EbayAccountsTable />
      </Suspense>
    </>
  );
};

export default EbayAccountsPage;
