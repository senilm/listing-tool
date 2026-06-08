import { Suspense } from "react";

import { CenteredSpinner } from "@/components/spinner";
import { SignInForm } from "@/features/auth/components/sign-in-form";

const LoginPage = () => {
  return (
    <Suspense fallback={<CenteredSpinner />}>
      <SignInForm />
    </Suspense>
  );
};

export default LoginPage;
