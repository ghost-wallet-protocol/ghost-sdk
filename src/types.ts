/**
 * Represents the Meta-Address of a stealth address recipient.
 * Contains the public keys needed to generate stealth addresses for this recipient.
 */
export interface MetaAddress {
  /** Uncompressed hex string (65 bytes / 130 hex chars) for spending public key */
  spendingPublicKey: string;
  /** Uncompressed hex string (65 bytes / 130 hex chars) for viewing public key */
  viewingPublicKey: string;
}

/**
 * Stealth Payment Payload containing all data needed for on-chain stealth address derivation.
 */
export interface StealthPaymentPayload {
  /** Derived single-use target address as uncompressed hex string */
  stealthAddress: string;
  /** Ephemeral public key broadcasted on-chain for recipient scanning */
  ephemeralPublicKey: string;
  /** 1-byte view tag for fast client-side scanning (99.6% filtering efficiency) */
  viewTag: number;
}

/**
 * Validation result for various SDK operations
 */
export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  /** Error message if validation failed */
  error?: string;
}
