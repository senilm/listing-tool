import { Suspense } from "react";

import { SignInForm } from "@/features/auth/components/sign-in-form";
import { SignInFormSkeleton } from "@/features/auth/components/sign-in-form-skeleton";

const LoginPage = () => {
  return (
    <Suspense fallback={<SignInFormSkeleton />}>
      <SignInForm />
    </Suspense>
  );
};

export default LoginPage;
