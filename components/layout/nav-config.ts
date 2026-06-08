import { LayoutDashboard, Package, Send, Store } from "lucide-react";

import {
  dashboardRoute,
  ebayAccountsRoute,
  productsRoute,
  publicationsRoute,
} from "@/lib/routes";
import { type NavGroup } from "@/types/navigation";

export const navConfig: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", path: dashboardRoute(), icon: LayoutDashboard }],
  },
  {
    label: "Catalog",
    items: [{ label: "Products", path: productsRoute(), icon: Package }],
  },
  {
    label: "eBay",
    items: [
      { label: "eBay Accounts", path: ebayAccountsRoute(), icon: Store },
      { label: "Publications", path: publicationsRoute(), icon: Send },
    ],
  },
];
