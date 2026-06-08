"use client";

import { toast } from "@/lib/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useDisconnectEbayAccount } from "@/features/ebay-accounts/hooks/use-ebay-account-mutations";

type DisconnectEbayAccountDialogProps = {
  id: string;
  label: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const DisconnectEbayAccountDialog = ({
  id,
  label,
  open,
  onOpenChange,
}: DisconnectEbayAccountDialogProps) => {
  const disconnectAccount = useDisconnectEbayAccount();

  const handleDisconnect = async () => {
    try {
      await disconnectAccount.mutateAsync(id);
    } catch {
      toast.error("Could not disconnect the account");
      return;
    }

    toast.success("Account disconnected");
    onOpenChange(false);
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Disconnect ${label}?`}
      description="This wipes the stored token and marks the account disabled. You can reconnect it later by linking the same eBay account again."
      confirmLabel="Disconnect"
      variant="destructive"
      isLoading={disconnectAccount.isPending}
      onConfirm={handleDisconnect}
    />
  );
};
