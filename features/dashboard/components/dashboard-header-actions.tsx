import { Plus, Store } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ebayAccountConnectApiRoute } from "@/lib/api-routes";
import { productCreateRoute } from "@/lib/routes";

export const DashboardHeaderActions = () => (
  <>
    <Button asChild variant="outline" size="sm">
      <a href={ebayAccountConnectApiRoute()}>
        <Store />
        Connect account
      </a>
    </Button>
    <Button asChild size="sm">
      <Link href={productCreateRoute()}>
        <Plus />
        Create product
      </Link>
    </Button>
  </>
);
