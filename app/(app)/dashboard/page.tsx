import { PageHeader } from "@/components/page-header";
import { DashboardHeaderActions } from "@/features/dashboard/components/dashboard-header-actions";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";

const DashboardPage = () => {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your listing activity."
      >
        <DashboardHeaderActions />
      </PageHeader>

      <DashboardOverview />
    </>
  );
};

export default DashboardPage;
