"use client";

import Link from "next/link";

import { Typography } from "@/components/typography";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EbayAccountStatusBadge } from "@/features/ebay-accounts/components/ebay-account-status-badge";
import { type EbayAccountSummary } from "@/features/ebay-accounts/services/ebay-account-service";
import { ebayAccountsRoute } from "@/lib/routes";
import { cn } from "@/lib/utils";

type AccountSelectStepProps = {
  accounts: EbayAccountSummary[];
  selectedIds: string[];
  isLoading: boolean;
  onToggle: (id: string, checked: boolean) => void;
};

export const AccountSelectStep = ({
  accounts,
  selectedIds,
  isLoading,
  onToggle,
}: AccountSelectStepProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <Typography variant="muted">
        No connected eBay accounts.{" "}
        <Link href={ebayAccountsRoute()} className="underline">
          Connect one
        </Link>{" "}
        to publish.
      </Typography>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {accounts.map((account) => {
        const isSelected = selectedIds.includes(account.id);
        return (
          <Label
            key={account.id}
            htmlFor={`publish-account-${account.id}`}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
              isSelected
                ? "border-primary bg-primary/5"
                : "hover:border-input hover:bg-muted/50",
            )}
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold uppercase",
                isSelected
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {account.label.charAt(0)}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate font-medium">{account.label}</span>
              <EbayAccountStatusBadge
                status={account.status}
                className="w-fit"
              />
            </div>
            <Checkbox
              id={`publish-account-${account.id}`}
              checked={isSelected}
              onCheckedChange={(checked) =>
                onToggle(account.id, checked === true)
              }
            />
          </Label>
        );
      })}
    </div>
  );
};
