"use client";

import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { ebayAccountsRoute } from "@/lib/routes";
import { toast } from "@/lib/toast";

const ERROR_MESSAGES: Record<string, string> = {
  consent_failed: "eBay consent was cancelled or failed. Please try again.",
  no_refresh_token: "eBay did not return a refresh token. Please try again.",
  link_failed: "Could not link the eBay account. Please try again.",
};

// Surfaces the connect/callback outcome (?connected / ?error) as a toast, then
// strips the query params so a refresh doesn't re-fire it.
export const EbayConnectFeedback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");
    if (!connected && !error) return;

    if (connected) {
      toast.success("eBay account connected");
    } else if (error) {
      toast.error(ERROR_MESSAGES[error] ?? "Could not connect the eBay account.");
    }

    router.replace(ebayAccountsRoute());
  }, [searchParams, router]);

  return null;
};
