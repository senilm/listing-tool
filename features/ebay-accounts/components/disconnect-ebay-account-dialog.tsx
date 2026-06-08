"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { ebayAccountApiRoute } from "@/lib/api-routes";
import { toast } from "@/lib/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";

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
  const router = useRouter();
  const [isDisconnecting, setIsDisconnecting] = React.useState(false);

  const handleDisconnect = async () => {
    setIsDisconnecting(true);

    const res = await fetch(ebayAccountApiRoute(id), { method: "DELETE" });
    if (!res.ok) {
      toast.error("Could not disconnect the account");
      setIsDisconnecting(false);
      return;
    }

    toast.success("Account disconnected");
    setIsDisconnecting(false);
    onOpenChange(false);
    router.refresh();
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Disconnect ${label}?`}
      description="This wipes the stored token and marks the account disabled. You can reconnect it later by linking the same eBay account again."
      confirmLabel="Disconnect"
      variant="destructive"
      isLoading={isDisconnecting}
      onConfirm={handleDisconnect}
    />
  );
};
