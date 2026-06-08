import { Suspense } from "react";

import { listEbayAccounts } from "@/features/ebay-accounts/services/ebay-account-service";
import { PageHeader } from "@/components/page-header";
import { ConnectEbayAccountButton } from "@/features/ebay-accounts/components/connect-ebay-account-button";
import { EbayAccountsList } from "@/features/ebay-accounts/components/ebay-accounts-list";
import { EbayConnectFeedback } from "@/features/ebay-accounts/components/ebay-connect-feedback";

const EbayAccountsPage = async () => {
  const accounts = await listEbayAccounts();

  return (
    <div>
      <PageHeader
        title="eBay Accounts"
        description="Linked eBay seller accounts."
      >
        <ConnectEbayAccountButton />
      </PageHeader>

      <Suspense>
        <EbayConnectFeedback />
      </Suspense>

      <EbayAccountsList accounts={accounts} />
    </div>
  );
};

export default EbayAccountsPage;
