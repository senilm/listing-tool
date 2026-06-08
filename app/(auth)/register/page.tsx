import { Suspense } from "react";

import { SignUpForm } from "@/features/auth/components/sign-up-form";

const RegisterPage = () => {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
};

export default RegisterPage;
