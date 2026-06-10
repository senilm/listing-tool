"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { FormField } from "@/components/form-field";
import { PasswordInput } from "@/components/password-input";
import { Typography } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { AuthFormHeader } from "@/features/auth/components/auth-form-header";
import { authClient } from "@/lib/auth/client";
import { APP_NAME } from "@/lib/constants";
import {
  REDIRECT_PARAM,
  getSafeRedirectPath,
  withRedirectParam,
} from "@/lib/redirect";
import { dashboardRoute, registerRoute } from "@/lib/routes";
import { toast } from "@/lib/toast";
import { signInSchema, type SignInValues } from "@/validations/auth";

export const SignInForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get(REDIRECT_PARAM);

  const form = useForm<SignInValues>({
    resolver: standardSchemaResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: SignInValues) => {
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });

    if (error) {
      toast.error(error.message ?? "Unable to sign in");
      return;
    }

    router.push(getSafeRedirectPath(redirectTo) ?? dashboardRoute());
    router.refresh();
  };

  return (
    <>
      <AuthFormHeader
        title={`Sign in to ${APP_NAME}`}
        description="Enter your credentials to continue."
      />

      <form
        onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
        className="flex flex-col gap-6"
      >
        <FieldGroup>
          <FormField
            control={form.control}
            name="email"
            label="Email"
            render={(field) => (
              <Input
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                maxLength={254}
                {...field}
              />
            )}
          />
          <FormField
            control={form.control}
            name="password"
            label="Password"
            render={(field) => (
              <PasswordInput
                placeholder="Enter your password"
                autoComplete="current-password"
                {...field}
              />
            )}
          />
        </FieldGroup>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={form.formState.isSubmitting}
        >
          Sign in
          <ArrowRight />
        </Button>
      </form>

      <Typography variant="muted" className="text-center">
        Don&apos;t have an account?{" "}
        <Link
          href={withRedirectParam(registerRoute(), redirectTo)}
          className="font-medium text-primary hover:underline"
        >
          Sign up
        </Link>
      </Typography>
    </>
  );
};
