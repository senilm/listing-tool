"use client";

import { Typography } from "@/components/typography";
import { DashboardAccountSummary } from "@/features/dashboard/components/dashboard-account-summary";
import { DashboardOverviewSkeleton } from "@/features/dashboard/components/dashboard-overview-skeleton";
import { DashboardRecentActivity } from "@/features/dashboard/components/dashboard-recent-activity";
import { DashboardStatCards } from "@/features/dashboard/components/dashboard-stat-cards";
import { DashboardStatusChart } from "@/features/dashboard/components/dashboard-status-chart";
import { useDashboardStatsQuery } from "@/features/dashboard/hooks/use-dashboard-stats-query";

export const DashboardOverview = () => {
  const { data, isLoading, isError } = useDashboardStatsQuery();

  if (isLoading) {
    return <DashboardOverviewSkeleton />;
  }

  if (isError || !data) {
    return (
      <Typography variant="muted">
        Couldn&apos;t load your dashboard. Please try again.
      </Typography>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardStatCards stats={data} />
      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardStatusChart publications={data.publications} />
        <DashboardAccountSummary accounts={data.accountsSummary} />
      </div>
      <DashboardRecentActivity items={data.recent} />
    </div>
  );
};
