import { Plus } from "lucide-react";
import Link from "next/link";

import { ebayAccountConnectApiRoute } from "@/lib/api-routes";
import { Button } from "@/components/ui/button";

export const ConnectEbayAccountButton = () => {
  return (
    <Button asChild>
      <Link href={ebayAccountConnectApiRoute()}>
        <Plus />
        Connect eBay account
      </Link>
    </Button>
  );
};
