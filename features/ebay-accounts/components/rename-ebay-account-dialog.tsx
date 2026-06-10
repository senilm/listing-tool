"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";

import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRenameEbayAccount } from "@/features/ebay-accounts/hooks/use-ebay-account-mutations";
import { toast } from "@/lib/toast";
import {
  renameEbayAccountSchema,
  type RenameEbayAccountValues,
} from "@/validations/ebay-account";

type RenameEbayAccountDialogProps = {
  id: string;
  currentLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const RenameEbayAccountDialog = ({
  id,
  currentLabel,
  open,
  onOpenChange,
}: RenameEbayAccountDialogProps) => {
  const renameAccount = useRenameEbayAccount();
  const form = useForm<RenameEbayAccountValues>({
    resolver: standardSchemaResolver(renameEbayAccountSchema),
    values: { label: currentLabel },
  });

  const onSubmit = async (data: RenameEbayAccountValues) => {
    try {
      await renameAccount.mutateAsync({ id, label: data.label });
    } catch {
      toast.error("Could not rename the account");
      return;
    }

    toast.success("Account renamed");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename account</DialogTitle>
          <DialogDescription>
            Choose a label to recognise this eBay account.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
          className="flex flex-col gap-6"
        >
          <FieldGroup>
            <FormField
              control={form.control}
              name="label"
              label="Label"
              render={(field) => (
                <Input placeholder="My main store" maxLength={60} {...field} />
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={renameAccount.isPending}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
