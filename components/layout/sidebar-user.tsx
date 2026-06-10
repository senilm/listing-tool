"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SidebarMenuButton,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth/client";
import { getInitials } from "@/lib/format";
import { settingsRoute } from "@/lib/routes";

export const SidebarUser = () => {
  const { data: session, isPending } = authClient.useSession();
  const pathname = usePathname();

  if (isPending) return <SidebarMenuSkeleton showIcon />;
  if (!session?.user) return null;

  const { name, email, image } = session.user;
  const isActive = pathname.startsWith(settingsRoute());

  return (
    <SidebarMenuButton asChild size="lg" isActive={isActive} tooltip={name}>
      <Link href={settingsRoute()}>
        <Avatar className="size-7 rounded-md">
          {!!image && <AvatarImage src={image} alt={name} />}
          <AvatarFallback className="rounded-md text-xs font-semibold">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">{name}</span>
          <span className="truncate text-xs text-muted-foreground">{email}</span>
        </div>
      </Link>
    </SidebarMenuButton>
  );
};
