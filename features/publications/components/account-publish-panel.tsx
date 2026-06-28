"use client";

import { useState } from "react";

import { DateTimeInput } from "@/components/date-time-input";
import { LoadingTransition } from "@/components/loading-transition";
import { Typography } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTestPolicies } from "@/features/ebay-accounts/hooks/use-create-test-policies";
import { useListingOptions } from "@/features/ebay-accounts/hooks/use-listing-options";
import { PolicySelectField } from "@/features/publications/components/policy-select-field";
import { type AccountPublishForm } from "@/features/publications/utils/publish-form";
import { toast } from "@/lib/toast";
import { TITLE_MAX_LENGTH } from "@/validations/product";
import {
  isScheduleWindowValid,
  MAX_SCHEDULE_DAYS,
} from "@/validations/publication";

const IS_SANDBOX = process.env.NEXT_PUBLIC_EBAY_ENV !== "production";

const SCHEDULE_WINDOW_MS = MAX_SCHEDULE_DAYS * 24 * 60 * 60 * 1000;

type AccountPublishPanelProps = {
  accountId: string;
  isActive: boolean;
  currency: string;
  value: AccountPublishForm;
  onChange: (patch: Partial<AccountPublishForm>) => void;
};

export const AccountPublishPanel = ({
  accountId,
  isActive,
  currency,
  value,
  onChange,
}: AccountPublishPanelProps) => {
  const optionsQuery = useListingOptions(accountId, isActive);
  const createTestPolicies = useCreateTestPolicies(accountId);

  const [scheduleBounds] = useState(() => ({
    min: new Date(),
    max: new Date(Date.now() + SCHEDULE_WINDOW_MS),
  }));

  const handleCreateTestPolicies = async () => {
    try {
      await createTestPolicies.mutateAsync();
      toast.success("Test policies created");
    } catch {
      toast.error("Could not create test policies");
    }
  };

  const options = optionsQuery.data;
  const hasMissing =
    !options ||
    options.paymentPolicies.length === 0 ||
    options.returnPolicies.length === 0 ||
    options.fulfillmentPolicies.length === 0 ||
    options.locations.length === 0;

  return (
    <LoadingTransition
      isLoading={optionsQuery.isLoading}
      loader={
        <div className="flex flex-col gap-3 py-2">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      }
    >
      {optionsQuery.isError ? (
        <Typography variant="muted" className="py-2">
          Couldn’t load this account’s policies. It may need reconnecting.
        </Typography>
      ) : !options ? null : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-10">
          <div className="flex flex-col gap-4">
            <Typography variant="small" className="font-medium">
              Listing content
            </Typography>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`title-${accountId}`}>Title</Label>
              <Input
                id={`title-${accountId}`}
                maxLength={TITLE_MAX_LENGTH}
                value={value.title}
                onChange={(event) => onChange({ title: event.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`description-${accountId}`}>Description</Label>
              <Textarea
                id={`description-${accountId}`}
                rows={4}
                placeholder="Leave blank to use the product description"
                value={value.description}
                onChange={(event) =>
                  onChange({ description: event.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`price-${accountId}`}>Price ({currency})</Label>
                <Input
                  id={`price-${accountId}`}
                  inputMode="decimal"
                  value={value.price}
                  onChange={(event) => onChange({ price: event.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`quantity-${accountId}`}>Quantity</Label>
                <Input
                  id={`quantity-${accountId}`}
                  inputMode="numeric"
                  value={value.quantity}
                  onChange={(event) =>
                    onChange({ quantity: event.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <Typography variant="small" className="font-medium">
                Policies &amp; location
              </Typography>
              {IS_SANDBOX && hasMissing ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  loading={createTestPolicies.isPending}
                  onClick={() => void handleCreateTestPolicies()}
                >
                  Create test policies
                </Button>
              ) : null}
            </div>

            <PolicySelectField
              id={`payment-${accountId}`}
              label="Payment policy"
              placeholder="Select a payment policy"
              value={value.paymentPolicyId}
              options={options.paymentPolicies}
              onChange={(id) => onChange({ paymentPolicyId: id })}
            />
            <PolicySelectField
              id={`return-${accountId}`}
              label="Return policy"
              placeholder="Select a return policy"
              value={value.returnPolicyId}
              options={options.returnPolicies}
              onChange={(id) => onChange({ returnPolicyId: id })}
            />
            <PolicySelectField
              id={`fulfillment-${accountId}`}
              label="Fulfillment policy"
              placeholder="Select a fulfillment policy"
              value={value.fulfillmentPolicyId}
              options={options.fulfillmentPolicies}
              onChange={(id) => onChange({ fulfillmentPolicyId: id })}
            />
            <PolicySelectField
              id={`location-${accountId}`}
              label="Inventory location"
              placeholder="Select a location"
              value={value.merchantLocationKey}
              options={options.locations}
              onChange={(id) => onChange({ merchantLocationKey: id })}
            />

            <div className="flex flex-col gap-3 border-t pt-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor={`schedule-${accountId}`}>
                    Schedule for later
                  </Label>
                  <Typography variant="muted">
                    eBay launches the listing at the chosen time (up to{" "}
                    {MAX_SCHEDULE_DAYS} days ahead).
                  </Typography>
                </div>
                <Switch
                  id={`schedule-${accountId}`}
                  checked={value.scheduleEnabled}
                  onCheckedChange={(checked) =>
                    onChange({
                      scheduleEnabled: checked,
                      scheduledAt: checked ? value.scheduledAt : undefined,
                    })
                  }
                />
              </div>
              {value.scheduleEnabled ? (
                <DateTimeInput
                  value={value.scheduledAt}
                  onChange={(date) => onChange({ scheduledAt: date })}
                  minDate={scheduleBounds.min}
                  maxDate={scheduleBounds.max}
                  error={
                    value.scheduledAt
                      ? !isScheduleWindowValid(value.scheduledAt)
                      : false
                  }
                />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </LoadingTransition>
  );
};
