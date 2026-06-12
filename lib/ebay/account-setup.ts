import {
  ebayFulfillmentPolicyRoute,
  ebayLocationRoute,
  ebayLocationsRoute,
  ebayPaymentPolicyRoute,
  ebayProgramOptInRoute,
  ebayReturnPolicyRoute,
} from "@/lib/ebay/api-routes";
import { ebayRequest, EBAY_MARKETPLACE_ID } from "@/lib/ebay/client";

export type SellerSetup = {
  paymentPolicyId: string;
  returnPolicyId: string;
  fulfillmentPolicyId: string;
  merchantLocationKey: string;
};

const CATEGORY_TYPES = [{ name: "ALL_EXCLUDING_MOTORS_VEHICLES" }];
const DEFAULT_LOCATION_KEY = "warehouse-1";

// Sellers using the Inventory API must be opted into business policies.
// Opting in again is a no-op error we can safely ignore.
const ensureOptedIn = async (accessToken: string) => {
  await ebayRequest(accessToken, ebayProgramOptInRoute(), {
    method: "POST",
    body: { programType: "SELLING_POLICY_MANAGEMENT" },
  }).catch(() => undefined);
};

const resolvePaymentPolicy = async (accessToken: string): Promise<string> => {
  const { data } = await ebayRequest<{
    paymentPolicies?: { paymentPolicyId: string }[];
  }>(accessToken, ebayPaymentPolicyRoute(), {
    query: { marketplace_id: EBAY_MARKETPLACE_ID },
  });
  if (data.paymentPolicies?.length)
    return data.paymentPolicies[0].paymentPolicyId;

  const created = await ebayRequest<{ paymentPolicyId: string }>(
    accessToken,
    ebayPaymentPolicyRoute(),
    {
      method: "POST",
      body: {
        name: "Default Payment Policy",
        marketplaceId: EBAY_MARKETPLACE_ID,
        categoryTypes: CATEGORY_TYPES,
      },
    },
  );
  return created.data.paymentPolicyId;
};

const resolveReturnPolicy = async (accessToken: string): Promise<string> => {
  const { data } = await ebayRequest<{
    returnPolicies?: { returnPolicyId: string }[];
  }>(accessToken, ebayReturnPolicyRoute(), {
    query: { marketplace_id: EBAY_MARKETPLACE_ID },
  });
  if (data.returnPolicies?.length) return data.returnPolicies[0].returnPolicyId;

  const created = await ebayRequest<{ returnPolicyId: string }>(
    accessToken,
    ebayReturnPolicyRoute(),
    {
      method: "POST",
      body: {
        name: "Default Return Policy",
        marketplaceId: EBAY_MARKETPLACE_ID,
        categoryTypes: CATEGORY_TYPES,
        returnsAccepted: true,
        returnPeriod: { value: 30, unit: "DAY" },
        returnShippingCostPayer: "BUYER",
      },
    },
  );
  return created.data.returnPolicyId;
};

const resolveFulfillmentPolicy = async (
  accessToken: string,
): Promise<string> => {
  const { data } = await ebayRequest<{
    fulfillmentPolicies?: { fulfillmentPolicyId: string }[];
  }>(accessToken, ebayFulfillmentPolicyRoute(), {
    query: { marketplace_id: EBAY_MARKETPLACE_ID },
  });
  if (data.fulfillmentPolicies?.length) {
    return data.fulfillmentPolicies[0].fulfillmentPolicyId;
  }

  const created = await ebayRequest<{ fulfillmentPolicyId: string }>(
    accessToken,
    ebayFulfillmentPolicyRoute(),
    {
      method: "POST",
      body: {
        name: "Default Fulfillment Policy",
        marketplaceId: EBAY_MARKETPLACE_ID,
        categoryTypes: CATEGORY_TYPES,
        handlingTime: { value: 1, unit: "DAY" },
        shippingOptions: [
          {
            optionType: "DOMESTIC",
            costType: "FLAT_RATE",
            shippingServices: [
              {
                sortOrder: 1,
                shippingServiceCode: "USPSPriority",
                freeShipping: true,
              },
            ],
          },
        ],
      },
    },
  );
  return created.data.fulfillmentPolicyId;
};

const resolveLocation = async (accessToken: string): Promise<string> => {
  // GET /location (the list endpoint) is unreliable in sandbox (errorId 25001),
  // so try it but fall back to a keyed create, which is idempotent.
  try {
    const { data } = await ebayRequest<{
      locations?: { merchantLocationKey: string }[];
    }>(accessToken, ebayLocationsRoute(), { query: { limit: "1" } });
    if (data.locations?.length) return data.locations[0].merchantLocationKey;
  } catch {
    // fall through to create
  }

  try {
    // createInventoryLocation returns 204 No Content; the key is what we chose.
    await ebayRequest(accessToken, ebayLocationRoute(DEFAULT_LOCATION_KEY), {
      method: "POST",
      body: {
        name: "Primary Warehouse",
        locationTypes: ["WAREHOUSE"],
        merchantLocationStatus: "ENABLED",
        location: {
          address: {
            addressLine1: "2025 Hamilton Ave",
            city: "San Jose",
            stateOrProvince: "CA",
            postalCode: "95125",
            country: "US",
          },
        },
      },
    });
  } catch (error) {
    // errorId 25803 = a location already exists for this key, which is fine.
    if (!(error instanceof Error && error.message.includes("25803")))
      throw error;
  }
  return DEFAULT_LOCATION_KEY;
};

// Fetches the account's existing business policies + location, creating defaults
// only when none exist (the sandbox case). Returns the IDs an offer needs to
// publish. The caller caches these onto the ebay_account row.
export const resolveSellerSetup = async (
  accessToken: string,
): Promise<SellerSetup> => {
  await ensureOptedIn(accessToken);
  const [
    paymentPolicyId,
    returnPolicyId,
    fulfillmentPolicyId,
    merchantLocationKey,
  ] = await Promise.all([
    resolvePaymentPolicy(accessToken),
    resolveReturnPolicy(accessToken),
    resolveFulfillmentPolicy(accessToken),
    resolveLocation(accessToken),
  ]);
  return {
    paymentPolicyId,
    returnPolicyId,
    fulfillmentPolicyId,
    merchantLocationKey,
  };
};
