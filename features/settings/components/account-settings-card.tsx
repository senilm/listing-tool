"use client";

import { LoadingTransition } from "@/components/loading-transition";
import { Typography } from "@/components/typography";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth/client";
import { getInitials } from "@/lib/format";

export const AccountSettingsCard = () => {
  const { data: session, isPending } = authClient.useSession();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>Your profile information.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoadingTransition
          isLoading={isPending}
          loader={
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          }
        >
          {session?.user ? (
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                {!!session.user.image && (
                  <AvatarImage
                    src={session.user.image}
                    alt={session.user.name}
                  />
                )}
                <AvatarFallback className="font-semibold">
                  {getInitials(session.user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <Typography variant="small">{session.user.name}</Typography>
                <Typography variant="muted">{session.user.email}</Typography>
              </div>
            </div>
          ) : null}
        </LoadingTransition>
      </CardContent>
    </Card>
  );
};
