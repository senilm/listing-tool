import { type EbayAccountSummary } from "@/features/ebay-accounts/services/ebay-account-service";
import { EbayAccountCard } from "@/features/ebay-accounts/components/ebay-account-card";
import { EbayAccountsEmpty } from "@/features/ebay-accounts/components/ebay-accounts-empty";

type EbayAccountsListProps = {
  accounts: EbayAccountSummary[];
};

export const EbayAccountsList = ({ accounts }: EbayAccountsListProps) => {
  if (accounts.length === 0) {
    return <EbayAccountsEmpty />;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <EbayAccountCard key={account.id} account={account} />
      ))}
    </div>
  );
};
