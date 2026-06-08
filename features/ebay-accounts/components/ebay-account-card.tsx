import { format } from "date-fns";

import { EbayAccountStatus } from "@/lib/enums/ebay-account";
import { type EbayAccountSummary } from "@/features/ebay-accounts/services/ebay-account-service";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Typography } from "@/components/typography";
import { EbayAccountStatusBadge } from "@/features/ebay-accounts/components/ebay-account-status-badge";
import { EbayAccountActions } from "@/features/ebay-accounts/components/ebay-account-actions";

type EbayAccountCardProps = {
  account: EbayAccountSummary;
};

export const EbayAccountCard = ({ account }: EbayAccountCardProps) => {
  const isDisabled = account.status === EbayAccountStatus.Disabled;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="truncate">{account.label}</CardTitle>
        <CardDescription className="truncate">
          {account.ebayUsername ?? "Username unavailable"}
        </CardDescription>
        {!isDisabled && (
          <CardAction>
            <EbayAccountActions id={account.id} label={account.label} />
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-2">
        <EbayAccountStatusBadge status={account.status} />
        <Typography variant="muted">
          Linked {format(account.createdAt, "d MMM yyyy")}
        </Typography>
      </CardContent>
    </Card>
  );
};
