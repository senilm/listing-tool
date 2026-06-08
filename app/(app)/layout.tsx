import { AuthGuard } from "@/components/auth-guard";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

const AppGroupLayout = async ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  return (
    <AuthGuard>
      <SidebarProvider className="h-svh">
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <AppHeader />
          <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
};

export default AppGroupLayout;
