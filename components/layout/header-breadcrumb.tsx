"use client";

import { ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Typography } from "@/components/typography";

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  products: "Products",
  "ebay-accounts": "eBay Accounts",
  publications: "Publications",
  settings: "Settings",
  create: "Create",
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const getLabel = (segment: string) =>
  SEGMENT_LABELS[segment] ??
  segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

export const HeaderBreadcrumb = () => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments
    .filter((segment) => !UUID_PATTERN.test(segment))
    .map((segment, index, kept) => ({
      label: getLabel(segment),
      path: "/" + kept.slice(0, index + 1).join("/"),
    }));

  if (crumbs.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex min-w-0 items-center gap-1.5 overflow-hidden whitespace-nowrap"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <motion.span
              key={crumb.path}
              className="flex items-center gap-1.5"
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {index > 0 && (
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />
              )}
              {isLast ? (
                <Typography variant="small" as="span" aria-current="page">
                  {crumb.label}
                </Typography>
              ) : (
                <Link
                  href={crumb.path}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {crumb.label}
                </Link>
              )}
            </motion.span>
          );
        })}
      </AnimatePresence>
    </nav>
  );
};
