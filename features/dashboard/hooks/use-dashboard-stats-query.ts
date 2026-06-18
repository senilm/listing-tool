import { useQuery } from "@tanstack/react-query";

import { fetchDashboardStats } from "@/features/dashboard/services/dashboard-client";
import { QUERY_KEYS } from "@/lib/query-keys";

export const useDashboardStatsQuery = () =>
  useQuery({
    queryKey: QUERY_KEYS.dashboardStats,
    queryFn: ({ signal }) => fetchDashboardStats(signal),
  });
