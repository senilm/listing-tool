"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarClock } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  FullScreenDialogBody,
  FullScreenDialogContent,
  FullScreenDialogFooter,
  FullScreenDialogHeader,
} from "@/components/full-screen-dialog";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchEbayAccounts } from "@/features/ebay-accounts/services/ebay-account-client";
import { type ProductSummary } from "@/features/products/services/product-service";
import { AccountPublishPanel } from "@/features/publications/components/account-publish-panel";
import { AccountSelectStep } from "@/features/publications/components/account-select-step";
import { usePublishProduct } from "@/features/publications/hooks/use-publish-product";
import {
  type AccountPublishForm,
  buildOverrides,
  isFormValid,
  scheduledAtFor,
  seedForm,
} from "@/features/publications/utils/publish-form";
import { MAX_LIMIT } from "@/lib/api/pagination-params";
import { PublicationStatus } from "@/lib/enums/publication";
import { QUERY_KEYS } from "@/lib/query-keys";
import { toast } from "@/lib/toast";

const ALL_ACCOUNTS_PARAMS = `limit=${MAX_LIMIT}`;

enum Step {
  Select = "select",
  Configure = "configure",
}

type PublishFlowModalProps = {
  product: ProductSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const PublishFlowModal = ({
  product,
  open,
  onOpenChange,
}: PublishFlowModalProps) => {
  const publishProduct = usePublishProduct();

  const [step, setStep] = useState<Step>(Step.Select);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [forms, setForms] = useState<Record<string, AccountPublishForm>>({});
  const [activeTab, setActiveTab] = useState("");
  const [prevOpen, setPrevOpen] = useState(open);

  // Reset the whole flow each time the dialog opens (adjust-state-during-render,
  // the repo's lint-safe alternative to a sync effect).
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setStep(Step.Select);
      setSelectedIds([]);
      setForms({});
      setActiveTab("");
    }
  }

  const accountsQuery = useQuery({
    queryKey: QUERY_KEYS.ebayAccounts(ALL_ACCOUNTS_PARAMS),
    queryFn: ({ signal }) => fetchEbayAccounts(ALL_ACCOUNTS_PARAMS, signal),
    enabled: open,
  });

  const accounts = accountsQuery.data?.items ?? [];
  const selectedAccounts = accounts.filter((account) =>
    selectedIds.includes(account.id),
  );

  const toggle = (id: string, checked: boolean) =>
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((value) => value !== id),
    );

  const goToConfigure = () => {
    if (!product) return;
    setForms(
      Object.fromEntries(selectedIds.map((id) => [id, seedForm(product)])),
    );
    setActiveTab(selectedIds[0] ?? "");
    setStep(Step.Configure);
  };

  const updateForm = (id: string, patch: Partial<AccountPublishForm>) =>
    setForms((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const allValid =
    selectedIds.length > 0 &&
    selectedIds.every((id) => forms[id] && isFormValid(forms[id]));

  const handlePublish = async () => {
    if (!product) return;
    try {
      const { results } = await publishProduct.mutateAsync({
        productId: product.id,
        accounts: selectedIds.map((id) => ({
          accountId: id,
          paymentPolicyId: forms[id].paymentPolicyId,
          returnPolicyId: forms[id].returnPolicyId,
          fulfillmentPolicyId: forms[id].fulfillmentPolicyId,
          merchantLocationKey: forms[id].merchantLocationKey,
          overrides: buildOverrides(forms[id], product),
          scheduledAt: scheduledAtFor(forms[id]),
        })),
      });

      const published = results.filter(
        (result) => result.status === PublicationStatus.Published,
      ).length;
      const failed = results.length - published;

      if (failed === 0) {
        toast.success(
          `Published to ${published} account${published === 1 ? "" : "s"}`,
        );
      } else if (published === 0) {
        toast.error(
          `Failed to publish to ${failed} account${failed === 1 ? "" : "s"}`,
        );
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
      <FullScreenDialogContent>
        <FullScreenDialogHeader>
          <DialogTitle>Publish to eBay</DialogTitle>
          <DialogDescription>
            {step === Step.Select
              ? `Choose which linked accounts to publish “${product?.title ?? ""}” to.`
              : "Review the listing and pick policies for each account."}
          </DialogDescription>
        </FullScreenDialogHeader>

        {step === Step.Select ? (
          <FullScreenDialogBody>
            <AccountSelectStep
              accounts={accounts}
              selectedIds={selectedIds}
              isLoading={accountsQuery.isLoading}
              onToggle={toggle}
            />
          </FullScreenDialogBody>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex min-h-0 flex-1 flex-col gap-0"
          >
            <div className="shrink-0 border-b px-6 pt-4 pb-3">
              <TabsList className="flex-wrap">
                {selectedAccounts.map((account) => {
                  const form = forms[account.id];
                  const scheduledAt = form?.scheduleEnabled
                    ? form.scheduledAt
                    : undefined;
                  return (
                    <TabsTrigger
                      key={account.id}
                      value={account.id}
                      className="gap-1.5"
                    >
                      {account.label}
                      {scheduledAt ? (
                        <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                          <CalendarClock className="size-3" />
                          {format(scheduledAt, "d MMM, HH:mm")}
                        </span>
                      ) : null}
                      {form && !isFormValid(form) ? (
                        <span className="size-1.5 rounded-full bg-amber-500" />
                      ) : null}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {selectedAccounts.map((account) => (
                <TabsContent
                  key={account.id}
                  value={account.id}
                  className="mt-0"
                >
                  {forms[account.id] ? (
                    <AccountPublishPanel
                      accountId={account.id}
                      isActive={activeTab === account.id}
                      currency={product?.currency ?? "USD"}
                      value={forms[account.id]}
                      onChange={(patch) => updateForm(account.id, patch)}
                    />
                  ) : null}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        )}

        <FullScreenDialogFooter>
          {step === Step.Select ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={selectedIds.length === 0}
                onClick={goToConfigure}
              >
                Next
                {selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(Step.Select)}
              >
                Back
              </Button>
              <Button
                type="button"
                loading={publishProduct.isPending}
                disabled={!allValid}
                onClick={() => void handlePublish()}
              >
                Publish ({selectedIds.length})
              </Button>
            </>
          )}
        </FullScreenDialogFooter>
      </FullScreenDialogContent>
    </Dialog>
  );
};
