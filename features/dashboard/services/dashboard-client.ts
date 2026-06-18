import { type DashboardStats } from "@/features/dashboard/services/dashboard-service";
import { dashboardStatsApiRoute } from "@/lib/api-routes";

export const fetchDashboardStats = async (
  signal?: AbortSignal,
): Promise<DashboardStats> => {
  const res = await fetch(dashboardStatsApiRoute(), { signal });
  if (!res.ok) throw new Error("Failed to load dashboard stats");
  return res.json() as Promise<DashboardStats>;
};
