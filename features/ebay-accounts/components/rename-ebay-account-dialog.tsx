"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

import { ebayAccountApiRoute } from "@/lib/api-routes";
import { toast } from "@/lib/toast";
import {
  renameEbayAccountSchema,
  type RenameEbayAccountValues,
} from "@/validations/ebay-account";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FieldGroup } from "@/components/ui/field";
import { FormField } from "@/components/form-field";

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
  const router = useRouter();
  const form = useForm<RenameEbayAccountValues>({
    resolver: standardSchemaResolver(renameEbayAccountSchema),
    values: { label: currentLabel },
  });

  const onSubmit = async (data: RenameEbayAccountValues) => {
    const res = await fetch(ebayAccountApiRoute(id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      toast.error("Could not rename the account");
      return;
    }

    toast.success("Account renamed");
    onOpenChange(false);
    router.refresh();
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
          onSubmit={form.handleSubmit(onSubmit)}
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
            <Button type="submit" loading={form.formState.isSubmitting}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
