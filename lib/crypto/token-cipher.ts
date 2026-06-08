import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_BYTES = 32;
const IV_BYTES = 12;

// Read and validate the key lazily so importing this module never throws —
// only encrypt/decrypt require EBAY_TOKEN_ENCRYPTION_KEY to be present.
const getKey = (): Buffer => {
  const raw = process.env.EBAY_TOKEN_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "EBAY_TOKEN_ENCRYPTION_KEY is not set — add a 32-byte hex key to .env.local (openssl rand -hex 32).",
    );
  }
  const key = Buffer.from(raw, "hex");
  if (key.length !== KEY_BYTES) {
    throw new Error(
      `EBAY_TOKEN_ENCRYPTION_KEY must be ${KEY_BYTES} bytes of hex (${KEY_BYTES * 2} characters).`,
    );
  }
  return key;
};

// AES-256-GCM. The output `iv:authTag:ciphertext` (all hex) is self-contained,
// so the stored string carries everything decryptToken needs.
export const encryptToken = (plaintext: string): string => {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
};

export const decryptToken = (payload: string): string => {
  const [ivHex, authTagHex, cipherHex] = payload.split(":");
  if (!ivHex || !authTagHex || !cipherHex) {
    throw new Error("Malformed encrypted token payload.");
  }
  const decipher = createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(cipherHex, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
};
