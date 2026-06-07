import { resolveSellerSetup } from "@/lib/ebay/account-setup";

// One-time per account: ensures business policies + an inventory location exist
// and returns their IDs. Safe to re-run (it reuses what's already there).
export const POST = async () => {
  try {
    const setup = await resolveSellerSetup();
    return Response.json(setup);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Setup failed" },
      { status: 500 },
    );
  }
};
