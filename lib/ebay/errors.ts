// Raised when eBay rejects a token request. `invalidGrant` is true only when the
// refresh token itself is revoked/expired (eBay error `invalid_grant`) — a
// terminal state the seller can only fix by re-consenting. Other failures
// (network, 5xx, throttling) leave it false so callers don't wrongly flag the
// account.
export class EbayTokenError extends Error {
  readonly status: number;
  readonly invalidGrant: boolean;

  constructor(status: number, body: string, invalidGrant: boolean) {
    super(`eBay token request failed: ${status} ${body}`);
    this.name = "EbayTokenError";
    this.status = status;
    this.invalidGrant = invalidGrant;
  }
}
