"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { Typography } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchEbayAccounts } from "@/features/ebay-accounts/services/ebay-account-client";
import { usePublishProduct } from "@/features/publications/hooks/use-publish-product";
import { EbayAccountStatus } from "@/lib/enums/ebay-account";
import { PublicationStatus } from "@/lib/enums/publication";
import { QUERY_KEYS } from "@/lib/query-keys";
import { ebayAccountsRoute } from "@/lib/routes";
import { toast } from "@/lib/toast";

const ACTIVE_ACCOUNTS_PARAMS = `status=${EbayAccountStatus.Active}&limit=100`;

type PublishProductDialogProps = {
  productId: string;
  productTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const PublishProductDialog = ({
  productId,
  productTitle,
  open,
  onOpenChange,
}: PublishProductDialogProps) => {
  const publishProduct = usePublishProduct();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [prevOpen, setPrevOpen] = useState(open);

  // Reset the selection each time the dialog opens (adjust-state-during-render,
  // the repo's lint-safe alternative to a sync effect).
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setSelectedIds([]);
  }

  const accountsQuery = useQuery({
    queryKey: QUERY_KEYS.ebayAccounts(ACTIVE_ACCOUNTS_PARAMS),
    queryFn: ({ signal }) => fetchEbayAccounts(ACTIVE_ACCOUNTS_PARAMS, signal),
    enabled: open,
  });

  const accounts = accountsQuery.data?.items ?? [];
  const hasNoAccounts = !accountsQuery.isLoading && accounts.length === 0;

  const toggle = (id: string, checked: boolean) =>
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((value) => value !== id),
    );

  const handlePublish = async () => {
    try {
      const { results } = await publishProduct.mutateAsync({
        productId,
        accountIds: selectedIds,
      });
      const published = results.filter(
        (result) => result.status === PublicationStatus.Published,
      ).length;
      const failed = results.length - published;

      if (failed === 0) {
        toast.success(`Published to ${published} account${published === 1 ? "" : "s"}`);
      } else if (published === 0) {
        toast.error(`Failed to publish to ${failed} account${failed === 1 ? "" : "s"}`);
      } else {
        toast.warning(`Published to ${published}, ${failed} failed`);
      }
      onOpenChange(false);
    } catch {
      toast.error("Could not publish the product");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish to eBay</DialogTitle>
          <DialogDescription>
            Choose which linked accounts to publish “{productTitle}” to.
          </DialogDescription>
        </DialogHeader>

        {accountsQuery.isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : hasNoAccounts ? (
          <Typography variant="muted">
            No active eBay accounts.{" "}
            <Link href={ebayAccountsRoute()} className="underline">
              Connect one
            </Link>{" "}
            to publish.
          </Typography>
        ) : (
          <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
            {accounts.map((account) => (
              <Label
                key={account.id}
                htmlFor={`publish-account-${account.id}`}
                className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-muted"
              >
                <Checkbox
                  id={`publish-account-${account.id}`}
                  checked={selectedIds.includes(account.id)}
                  onCheckedChange={(checked) => toggle(account.id, checked === true)}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{account.label}</span>
                  {account.ebayUsername ? (
                    <span className="text-xs text-muted-foreground">
                      {account.ebayUsername}
                    </span>
                  ) : null}
                </div>
              </Label>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            loading={publishProduct.isPending}
            disabled={selectedIds.length === 0}
            onClick={() => void handlePublish()}
          >
            Publish
            {selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
