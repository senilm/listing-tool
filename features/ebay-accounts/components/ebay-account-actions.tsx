"use client";

import * as React from "react";
import { MoreHorizontal, Pencil, Unplug } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RenameEbayAccountDialog } from "@/features/ebay-accounts/components/rename-ebay-account-dialog";
import { DisconnectEbayAccountDialog } from "@/features/ebay-accounts/components/disconnect-ebay-account-dialog";

type EbayAccountActionsProps = {
  id: string;
  label: string;
};

export const EbayAccountActions = ({ id, label }: EbayAccountActionsProps) => {
  const [renameOpen, setRenameOpen] = React.useState(false);
  const [disconnectOpen, setDisconnectOpen] = React.useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal />
            <span className="sr-only">Account actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setRenameOpen(true)}>
            <Pencil />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setDisconnectOpen(true)}
          >
            <Unplug />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenameEbayAccountDialog
        id={id}
        currentLabel={label}
        open={renameOpen}
        onOpenChange={setRenameOpen}
      />
      <DisconnectEbayAccountDialog
        id={id}
        label={label}
        open={disconnectOpen}
        onOpenChange={setDisconnectOpen}
      />
    </>
  );
};
