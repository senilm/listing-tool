import { notFound } from "next/navigation";
import { Suspense } from "react";

import { DataTableFallback } from "@/components/data-table/data-table-fallback";
import { PageHeader } from "@/components/page-header";
import { EbayAccountDetails } from "@/features/ebay-accounts/components/ebay-account-details";
import { getEbayAccount } from "@/features/ebay-accounts/services/ebay-account-service";
import { AccountPublicationsTable } from "@/features/publications/components/account-publications-table";
import { requireSession } from "@/lib/auth/session";

type EbayAccountDetailPageProps = {
  params: Promise<{ id: string }>;
};

const EbayAccountDetailPage = async ({
  params,
}: EbayAccountDetailPageProps) => {
  const { id } = await params;
  const session = await requireSession();
  const account = await getEbayAccount({ id, userId: session.user.id });

  if (!account) notFound();

  return (
    <>
      <PageHeader
        title={account.label}
        description="Everything published to this eBay account."
      />

      <EbayAccountDetails account={account} />

      <Suspense fallback={<DataTableFallback />}>
        <AccountPublicationsTable accountId={account.id} />
      </Suspense>
    </>
  );
};

export default EbayAccountDetailPage;
