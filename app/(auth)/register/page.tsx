import { Suspense } from "react";

import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { SignUpFormSkeleton } from "@/features/auth/components/sign-up-form-skeleton";

const RegisterPage = () => {
  return (
    <Suspense fallback={<SignUpFormSkeleton />}>
      <SignUpForm />
    </Suspense>
  );
};

export default RegisterPage;
