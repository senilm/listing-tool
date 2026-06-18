"use client";

import {
  CircleCheck,
  EyeOff,
  Globe,
  Package,
  PlugZap,
  Store,
  TriangleAlert,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { StatsCard } from "@/components/stats-card";
import { type DashboardStats } from "@/features/dashboard/services/dashboard-service";
import { PublicationStatus } from "@/lib/enums/publication";
import {
  ebayAccountsRoute,
  productsRoute,
  publicationsRoute,
} from "@/lib/routes";

type DashboardStatCardsProps = {
  stats: DashboardStats;
};

export const DashboardStatCards = ({ stats }: DashboardStatCardsProps) => {
  const router = useRouter();
  const failed = stats.publications[PublicationStatus.Failed];
  const { needsReconsent } = stats.accounts;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <StatsCard
        title="Products"
        value={stats.productCount}
        icon={Package}
        subtitle="In your catalog"
        onClick={() => router.push(productsRoute())}
      />
      <StatsCard
        title="Not yet live"
        value={stats.productsNotLive}
        icon={EyeOff}
        subtitle="No live listing anywhere"
        onClick={() => router.push(productsRoute())}
      />
      <StatsCard
        title="Live listings"
        value={stats.publications[PublicationStatus.Published]}
        icon={Globe}
        subtitle="Published to eBay"
        onClick={() =>
          router.push(
            `${publicationsRoute()}?status=${PublicationStatus.Published}`,
          )
        }
      />
      <StatsCard
        title="Active accounts"
        value={stats.accounts.active}
        icon={Store}
        subtitle={`${stats.accounts.total} linked`}
        onClick={() => router.push(ebayAccountsRoute())}
      />
      <StatsCard
        title="Failed publications"
        value={failed}
        icon={failed > 0 ? TriangleAlert : CircleCheck}
        variant={failed > 0 ? "alert" : "default"}
        subtitle={
          failed > 0
            ? "Review the errors and retry"
            : "All publications healthy"
        }
        onClick={() =>
          router.push(
            `${publicationsRoute()}?status=${PublicationStatus.Failed}`,
          )
        }
      />
      <StatsCard
        title="Accounts to reconnect"
        value={needsReconsent}
        icon={needsReconsent > 0 ? PlugZap : CircleCheck}
        variant={needsReconsent > 0 ? "alert" : "default"}
        subtitle={
          needsReconsent > 0
            ? "Re-grant access to keep publishing"
            : "All accounts connected"
        }
        onClick={() => router.push(ebayAccountsRoute())}
      />
    </div>
  );
};
