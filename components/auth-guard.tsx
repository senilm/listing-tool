import { type ReactNode } from "react";

import { requireSession } from "@/lib/auth/session";

type AuthGuardProps = {
  children: ReactNode;
};

// Server-side gate for everything it wraps: redirects to login when there's no
// session, otherwise renders its children. The (app) layout wraps the shell in
// this so every authenticated page is protected in one place.
export const AuthGuard = async ({ children }: AuthGuardProps) => {
  await requireSession();
  return <>{children}</>;
};
