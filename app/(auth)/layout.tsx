import { AuthLeftPanel } from "@/features/auth/components/auth-left-panel";

const AuthGroupLayout = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  return (
    <div className="grid min-h-svh lg:grid-cols-3">
      <AuthLeftPanel />
      <div className="flex col-span-2 items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthGroupLayout;
