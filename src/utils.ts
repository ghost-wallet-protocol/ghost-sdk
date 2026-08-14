/**
 * Utility functions for input validation and conversion
 */

/**
 * Validates if a string is a valid hex string
 */
export function isValidHex(value: string, expectedLength?: number): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  // Must start with 0x (optional) and contain only hex characters
  const hexPattern = /^(0x)?[0-9a-fA-F]*$/;
  if (!hexPattern.test(value)) {
    return false;
  }

  const hexPart = value.startsWith('0x') ? value.slice(2) : value;

  // Check expected length if provided
  if (expectedLength !== undefined && hexPart.length !== expectedLength) {
    return false;
  }

  return true;
}

/**
 * Validates if a hex string represents a valid public key (65 bytes for uncompressed)
 */
export function isValidPublicKey(hex: string): boolean {
  // Uncompressed public key: 0x04 prefix (1 byte) + X (32 bytes) + Y (32 bytes)
  // Hex representation: 130 characters (65 bytes * 2)
  return isValidHex(hex, 130);
}

/**
 * Validates if a hex string represents a valid private key (32 bytes)
 */
export function isValidPrivateKey(hex: string): boolean {
  return isValidHex(hex, 64);
}

/**
 * Validates if a number is in valid range for secp256k1 scalar
 */
export function isValidScalar(value: bigint): boolean {
  const CURVE_ORDER = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
  return value > 0n && value < CURVE_ORDER;
}

/**
 * Normalizes hex string by removing 0x prefix if present
 */
export function normalizeHex(hex: string): string {
  return hex.startsWith('0x') ? hex.slice(2) : hex;
}

/**
 * Ensures hex string starts with 0x
 */
export function ensureHexPrefix(hex: string): string {
  return hex.startsWith('0x') ? hex : '0x' + hex;
}
