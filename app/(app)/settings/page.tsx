import { PageHeader } from "@/components/page-header";
import { AccountSettingsCard } from "@/features/settings/components/account-settings-card";
import { AppearanceSettingsCard } from "@/features/settings/components/appearance-settings-card";

const SettingsPage = () => {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account and preferences."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <AccountSettingsCard />
        <AppearanceSettingsCard />
      </div>
    </>
  );
};

export default SettingsPage;
