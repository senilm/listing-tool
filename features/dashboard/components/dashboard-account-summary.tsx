import { format } from "date-fns";
import Link from "next/link";

import { TruncatedText } from "@/components/truncated-text";
import { Typography } from "@/components/typography";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type AccountSummary } from "@/features/dashboard/services/dashboard-service";
import { EbayAccountStatusBadge } from "@/features/ebay-accounts/components/ebay-account-status-badge";
import { ebayAccountsRoute } from "@/lib/routes";

type DashboardAccountSummaryProps = {
  accounts: AccountSummary[];
};

export const DashboardAccountSummary = ({
  accounts,
}: DashboardAccountSummaryProps) => (
  <Card className="gap-0 overflow-hidden py-0">
    <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
      <Typography variant="small">Accounts</Typography>
      <Link
        href={ebayAccountsRoute()}
        className="text-xs font-medium text-primary hover:underline"
      >
        Manage
      </Link>
    </div>
    <CardContent className="px-0 py-0">
      {accounts.length === 0 ? (
        <Typography variant="muted" className="px-4 py-6">
          No eBay accounts linked yet.
        </Typography>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Live</TableHead>
              <TableHead className="text-right">Last publish</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="max-w-[180px] font-medium">
                  <TruncatedText>{account.label}</TruncatedText>
                </TableCell>
                <TableCell>
                  <EbayAccountStatusBadge status={account.status} />
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {account.liveCount}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {account.lastPublishedAt
                    ? format(new Date(account.lastPublishedAt), "d MMM yyyy")
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </CardContent>
  </Card>
);
