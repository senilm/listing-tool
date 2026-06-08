import { Suspense } from "react";

import { SignInForm } from "@/features/auth/components/sign-in-form";

const LoginPage = () => {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
};

export default LoginPage;
