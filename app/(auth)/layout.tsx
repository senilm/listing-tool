import { AuthLeftPanel } from "@/features/auth/components/auth-left-panel";

const AuthGroupLayout = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  return (
    <div className="flex min-h-screen">
      <AuthLeftPanel />
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
};

export default AuthGroupLayout;
