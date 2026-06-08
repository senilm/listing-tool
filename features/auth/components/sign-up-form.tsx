"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { ArrowRight } from "lucide-react";

import { authClient } from "@/lib/auth/client";
import { APP_NAME } from "@/lib/constants";
import { dashboardRoute, loginRoute } from "@/lib/routes";
import {
  REDIRECT_PARAM,
  getSafeRedirectPath,
  withRedirectParam,
} from "@/lib/redirect";
import { toast } from "@/lib/toast";
import { signUpSchema, type SignUpValues } from "@/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldGroup } from "@/components/ui/field";
import { FormField } from "@/components/form-field";
import { PasswordInput } from "@/components/password-input";
import { Typography } from "@/components/typography";
import { AuthFormHeader } from "@/features/auth/components/auth-form-header";
import { PasswordRequirements } from "@/features/auth/components/password-requirements";
import { PasswordMatchIndicator } from "@/features/auth/components/password-match-indicator";

export const SignUpForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get(REDIRECT_PARAM);

  const form = useForm<SignUpValues>({
    resolver: standardSchemaResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const password = useWatch({ control: form.control, name: "password" });
  const confirmPassword = useWatch({
    control: form.control,
    name: "confirmPassword",
  });

  const onSubmit = async (values: SignUpValues) => {
    const { error } = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
    });

    if (error) {
      toast.error(error.message ?? "Unable to create account");
      return;
    }

    router.push(getSafeRedirectPath(redirectTo) ?? dashboardRoute());
    router.refresh();
  };

  return (
    <>
      <AuthFormHeader
        title={`Create your account`}
        description="Get started in a few seconds."
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <FieldGroup>
          <FormField
            control={form.control}
            name="name"
            label="Name"
            required
            render={(field) => (
              <Input
                placeholder="Your name"
                autoComplete="name"
                maxLength={100}
                {...field}
              />
            )}
          />
          <FormField
            control={form.control}
            name="email"
            label="Email"
            required
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
            required
            description={<PasswordRequirements />}
            render={(field) => (
              <PasswordInput
                placeholder="Create a password"
                autoComplete="new-password"
                {...field}
              />
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            label="Confirm password"
            required
            render={(field) => (
              <PasswordInput
                placeholder="Re-enter your password"
                autoComplete="new-password"
                {...field}
              />
            )}
          />
          <PasswordMatchIndicator
            password={password}
            confirmPassword={confirmPassword}
          />
        </FieldGroup>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={form.formState.isSubmitting}
        >
          Create account
          <ArrowRight />
        </Button>
      </form>

      <Typography variant="muted" className="text-center">
        Already have an account?{" "}
        <Link
          href={withRedirectParam(loginRoute(), redirectTo)}
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </Typography>
    </>
  );
};
