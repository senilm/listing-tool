import { Suspense } from "react";

import { CenteredSpinner } from "@/components/spinner";
import { SignUpForm } from "@/features/auth/components/sign-up-form";

const RegisterPage = () => {
  return (
    <Suspense fallback={<CenteredSpinner />}>
      <SignUpForm />
    </Suspense>
  );
};

export default RegisterPage;
