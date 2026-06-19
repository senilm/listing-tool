"use client";

import { Pie, PieChart } from "recharts";

import { Typography } from "@/components/typography";
import { Card, CardContent } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PublicationStatus } from "@/lib/enums/publication";

const STATUS_CHART_CONFIG = {
  [PublicationStatus.Published]: { label: "Published", color: "#10b981" },
  [PublicationStatus.Failed]: { label: "Failed", color: "#ef4444" },
} satisfies ChartConfig;

type DashboardStatusChartProps = {
  publications: Record<PublicationStatus, number>;
};

export const DashboardStatusChart = ({
  publications,
}: DashboardStatusChartProps) => {
  const data = Object.values(PublicationStatus)
    .map((status) => ({
      status,
      value: publications[status],
      fill: STATUS_CHART_CONFIG[status].color,
    }))
    .filter((entry) => entry.value > 0);

  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="border-b px-4 py-3">
        <Typography variant="small">Publications by status</Typography>
      </div>
      <CardContent className="px-4 py-4">
        {total === 0 ? (
          <Typography variant="muted" className="py-6 text-center">
            No publications yet.
          </Typography>
        ) : (
          <ChartContainer
            config={STATUS_CHART_CONFIG}
            className="mx-auto aspect-square max-h-[240px]"
          >
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="status" hideLabel />}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="status"
                innerRadius={60}
                strokeWidth={2}
              />
              <ChartLegend
                content={<ChartLegendContent nameKey="status" />}
                className="flex-wrap gap-2"
              />
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};
