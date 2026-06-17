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

export type ListingOption = {
  id: string;
  name: string;
};

export type AccountListingOptions = {
  paymentPolicies: ListingOption[];
  returnPolicies: ListingOption[];
  fulfillmentPolicies: ListingOption[];
  locations: ListingOption[];
};

type PaymentPolicy = { paymentPolicyId: string; name?: string };
type ReturnPolicy = { returnPolicyId: string; name?: string };
type FulfillmentPolicy = { fulfillmentPolicyId: string; name?: string };
type Location = { merchantLocationKey: string; name?: string };

type PaymentPolicyList = { paymentPolicies?: PaymentPolicy[] };
type ReturnPolicyList = { returnPolicies?: ReturnPolicy[] };
type FulfillmentPolicyList = { fulfillmentPolicies?: FulfillmentPolicy[] };
type LocationList = { locations?: Location[] };

const CATEGORY_TYPES = [{ name: "ALL_EXCLUDING_MOTORS_VEHICLES" }];
const DEFAULT_LOCATION_KEY = "warehouse-1";

const labelled = (id: string, name: string | undefined): ListingOption => {
  const trimmed = name?.trim();
  return { id, name: trimmed?.length ? trimmed : id };
};

// Sellers using the Inventory API must be opted into business policies.
// Opting in again is a no-op error we can safely ignore.
const ensureOptedIn = async (accessToken: string) => {
  await ebayRequest(accessToken, ebayProgramOptInRoute(), {
    method: "POST",
    body: { programType: "SELLING_POLICY_MANAGEMENT" },
  }).catch(() => undefined);
};

const listPaymentPolicies = async (
  accessToken: string,
): Promise<ListingOption[]> => {
  const { data } = await ebayRequest<PaymentPolicyList>(
    accessToken,
    ebayPaymentPolicyRoute(),
    { query: { marketplace_id: EBAY_MARKETPLACE_ID } },
  );
  return (data.paymentPolicies ?? []).map((policy) =>
    labelled(policy.paymentPolicyId, policy.name),
  );
};

const listReturnPolicies = async (
  accessToken: string,
): Promise<ListingOption[]> => {
  const { data } = await ebayRequest<ReturnPolicyList>(
    accessToken,
    ebayReturnPolicyRoute(),
    { query: { marketplace_id: EBAY_MARKETPLACE_ID } },
  );
  return (data.returnPolicies ?? []).map((policy) =>
    labelled(policy.returnPolicyId, policy.name),
  );
};

const listFulfillmentPolicies = async (
  accessToken: string,
): Promise<ListingOption[]> => {
  const { data } = await ebayRequest<FulfillmentPolicyList>(
    accessToken,
    ebayFulfillmentPolicyRoute(),
    { query: { marketplace_id: EBAY_MARKETPLACE_ID } },
  );
  return (data.fulfillmentPolicies ?? []).map((policy) =>
    labelled(policy.fulfillmentPolicyId, policy.name),
  );
};

const listLocations = async (accessToken: string): Promise<ListingOption[]> => {
  // GET /location is unreliable in sandbox (errorId 25001); treat a failure as
  // "no locations" so the seller can seed one with the test-policies button.
  try {
    const { data } = await ebayRequest<LocationList>(
      accessToken,
      ebayLocationsRoute(),
      { query: { limit: "100" } },
    );
    return (data.locations ?? []).map((location) =>
      labelled(location.merchantLocationKey, location.name),
    );
  } catch {
    return [];
  }
};

const readListingOptions = async (
  accessToken: string,
): Promise<AccountListingOptions> => {
  const [paymentPolicies, returnPolicies, fulfillmentPolicies, locations] =
    await Promise.all([
      listPaymentPolicies(accessToken),
      listReturnPolicies(accessToken),
      listFulfillmentPolicies(accessToken),
      listLocations(accessToken),
    ]);
  return { paymentPolicies, returnPolicies, fulfillmentPolicies, locations };
};

export const fetchListingOptions = async (
  accessToken: string,
): Promise<AccountListingOptions> => {
  await ensureOptedIn(accessToken);
  return readListingOptions(accessToken);
};

const createDefaultPaymentPolicy = async (accessToken: string) => {
  await ebayRequest(accessToken, ebayPaymentPolicyRoute(), {
    method: "POST",
    body: {
      name: "Default Payment Policy",
      marketplaceId: EBAY_MARKETPLACE_ID,
      categoryTypes: CATEGORY_TYPES,
    },
  });
};

const createDefaultReturnPolicy = async (accessToken: string) => {
  await ebayRequest(accessToken, ebayReturnPolicyRoute(), {
    method: "POST",
    body: {
      name: "Default Return Policy",
      marketplaceId: EBAY_MARKETPLACE_ID,
      categoryTypes: CATEGORY_TYPES,
      returnsAccepted: true,
      returnPeriod: { value: 30, unit: "DAY" },
      returnShippingCostPayer: "BUYER",
    },
  });
};

const createDefaultFulfillmentPolicy = async (accessToken: string) => {
  await ebayRequest(accessToken, ebayFulfillmentPolicyRoute(), {
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
  });
};

const createDefaultLocation = async (accessToken: string) => {
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
};

// Sandbox-only convenience: seeds the default business policies + an inventory
// location so the publish flow can be exercised end-to-end on a fresh sandbox
// account. Only creates what's missing (policy names must be unique), then
// returns the refreshed option lists. The caller gates this to sandbox.
export const createTestPolicies = async (
  accessToken: string,
): Promise<AccountListingOptions> => {
  await ensureOptedIn(accessToken);
  const current = await readListingOptions(accessToken);

  await Promise.all([
    current.paymentPolicies.length
      ? Promise.resolve()
      : createDefaultPaymentPolicy(accessToken),
    current.returnPolicies.length
      ? Promise.resolve()
      : createDefaultReturnPolicy(accessToken),
    current.fulfillmentPolicies.length
      ? Promise.resolve()
      : createDefaultFulfillmentPolicy(accessToken),
    current.locations.length
      ? Promise.resolve()
      : createDefaultLocation(accessToken),
  ]);

  return readListingOptions(accessToken);
};
