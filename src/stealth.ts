import { secp256k1 } from '@noble/curves/secp256k1';
import { keccak_256 } from '@noble/hashes/sha3';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import type { MetaAddress, StealthPaymentPayload } from './types';
import { isValidPublicKey, isValidPrivateKey, normalizeHex } from './utils';

/**
 * GhostSDK - Client-side Diffie-Hellman stealth address derivations
 * Implements ERC-5564 compatible stealth address protocol using secp256k1
 */
export class GhostSDK {
  /**
   * Generates a Stealth Address Payload for a receiver using their Meta-Address.
   * This function creates a unique, single-use address that only the recipient can detect.
   *
   * @param receiverMeta - The recipient's Meta-Address containing spending and viewing public keys
   * @returns StealthPaymentPayload containing the stealth address, ephemeral public key, and view tag
   * @throws Error if Meta-Address keys are invalid
   *
   * @example
   * const meta = {
   *   spendingPublicKey: '0x04...',
   *   viewingPublicKey: '0x04...'
   * };
   * const payload = GhostSDK.generateStealthAddress(meta);
   */
  static generateStealthAddress(receiverMeta: MetaAddress): StealthPaymentPayload {
    // Validate input
    if (!isValidPublicKey(receiverMeta.spendingPublicKey)) {
      throw new Error('Invalid spending public key format');
    }
    if (!isValidPublicKey(receiverMeta.viewingPublicKey)) {
      throw new Error('Invalid viewing public key format');
    }

    // 1. Generate ephemeral private key r
    const ephemeralPrivateKey = secp256k1.utils.randomPrivateKey();
    const ephemeralPublicKey = secp256k1.getPublicKey(ephemeralPrivateKey, false);

    // 2. Perform ECDH: S = r * V (using receiver's Viewing Public Key V)
    const sharedSecretPoint = secp256k1.getSharedSecret(
      ephemeralPrivateKey,
      hexToBytes(normalizeHex(receiverMeta.viewingPublicKey)),
      false
    );

    // 3. Hash shared secret: hashedSecret = keccak256(S)
    const sharedSecretHash = keccak_256(sharedSecretPoint);

    // 4. Compute View Tag (first byte of shared secret hash for 99.6% scan filtering efficiency)
    const viewTag = sharedSecretHash[0];

    // 5. Derive Stealth Public Key: P_stealth = K_spending + keccak256(S) * G
    const secretScalar = BigInt('0x' + bytesToHex(sharedSecretHash));
    const point1 = secp256k1.ProjectivePoint.fromHex(normalizeHex(receiverMeta.spendingPublicKey));
    const point2 = secp256k1.ProjectivePoint.BASE.multiply(secretScalar);
    const stealthPoint = point1.add(point2);
    const stealthPublicKeyHex = stealthPoint.toHex(false);

    return {
      stealthAddress: stealthPublicKeyHex,
      ephemeralPublicKey: bytesToHex(ephemeralPublicKey),
      viewTag,
    };
  }

  /**
   * Scans a single on-chain Announcement to check if funds belong to the recipient.
   * Uses view tag for fast pre-filtering before expensive elliptic curve operations.
   *
   * @param viewingPrivateKeyHex - Recipient's viewing private key (hex string)
   * @param spendingPublicKeyHex - Recipient's spending public key (hex string)
   * @param ephemeralPublicKeyHex - Ephemeral public key from on-chain announcement (hex string)
   * @param viewTag - View tag from on-chain announcement
   * @param onChainStealthAddress - The stealth address to verify
   * @returns true if the payment belongs to the recipient, false otherwise
   * @throws Error if any input parameters are invalid
   *
   * @example
   * const isForMe = GhostSDK.isPaymentForRecipient(
   *   viewingPrivateKey,
   *   spendingPublicKey,
   *   ephemeralPublicKey,
   *   viewTag,
   *   onChainStealthAddress
   * );
   */
  static isPaymentForRecipient(
    viewingPrivateKeyHex: string,
    spendingPublicKeyHex: string,
    ephemeralPublicKeyHex: string,
    viewTag: number,
    onChainStealthAddress: string
  ): boolean {
    // Validate inputs
    if (!isValidPrivateKey(viewingPrivateKeyHex)) {
      throw new Error('Invalid viewing private key format');
    }
    if (!isValidPublicKey(spendingPublicKeyHex)) {
      throw new Error('Invalid spending public key format');
    }
    if (!isValidPublicKey(ephemeralPublicKeyHex)) {
      throw new Error('Invalid ephemeral public key format');
    }
    if (!Number.isInteger(viewTag) || viewTag < 0 || viewTag > 255) {
      throw new Error('Invalid view tag: must be a byte (0-255)');
    }
    if (!isValidPublicKey(onChainStealthAddress)) {
      throw new Error('Invalid on-chain stealth address format');
    }

    // 1. Compute ECDH: S = v * R (receiver's viewing private key * ephemeral public key R)
    const sharedSecretPoint = secp256k1.getSharedSecret(
      hexToBytes(normalizeHex(viewingPrivateKeyHex)),
      hexToBytes(normalizeHex(ephemeralPublicKeyHex)),
      false
    );

    // 2. Hash shared secret
    const sharedSecretHash = keccak_256(sharedSecretPoint);

    // 3. Fast View-Tag Check (Rejects 255/256 false positives immediately)
    if (sharedSecretHash[0] !== viewTag) {
      return false;
    }

    // 4. Derive expected stealth public key and verify match
    const secretScalar = BigInt('0x' + bytesToHex(sharedSecretHash));
    const point1 = secp256k1.ProjectivePoint.fromHex(normalizeHex(spendingPublicKeyHex));
    const point2 = secp256k1.ProjectivePoint.BASE.multiply(secretScalar);
    const expectedStealthAddress = point1.add(point2).toHex(false);

    return expectedStealthAddress === normalizeHex(onChainStealthAddress);
  }

  /**
   * Derives the Stealth Private Key needed to sign withdrawal transactions.
   * Only the recipient can derive this key using their private keys and the ephemeral public key.
   *
   * @param spendingPrivateKeyHex - Recipient's spending private key (hex string, 32 bytes)
   * @param viewingPrivateKeyHex - Recipient's viewing private key (hex string, 32 bytes)
   * @param ephemeralPublicKeyHex - Ephemeral public key from on-chain announcement (hex string)
   * @returns The derived stealth private key as a hex string (64 hex chars / 32 bytes)
   * @throws Error if any input parameters are invalid
   *
   * @example
   * const stealthPrivateKey = GhostSDK.deriveStealthPrivateKey(
   *   spendingPrivateKey,
   *   viewingPrivateKey,
   *   ephemeralPublicKey
   * );
   */
  static deriveStealthPrivateKey(
    spendingPrivateKeyHex: string,
    viewingPrivateKeyHex: string,
    ephemeralPublicKeyHex: string
  ): string {
    // Validate inputs
    if (!isValidPrivateKey(spendingPrivateKeyHex)) {
      throw new Error('Invalid spending private key format');
    }
    if (!isValidPrivateKey(viewingPrivateKeyHex)) {
      throw new Error('Invalid viewing private key format');
    }
    if (!isValidPublicKey(ephemeralPublicKeyHex)) {
      throw new Error('Invalid ephemeral public key format');
    }

    const sharedSecretPoint = secp256k1.getSharedSecret(
      hexToBytes(normalizeHex(viewingPrivateKeyHex)),
      hexToBytes(normalizeHex(ephemeralPublicKeyHex)),
      false
    );
    const sharedSecretHash = keccak_256(sharedSecretPoint);
    const hashScalar = BigInt('0x' + bytesToHex(sharedSecretHash));
    const spendScalar = BigInt('0x' + normalizeHex(spendingPrivateKeyHex));

    // k_stealth = (k_spend + keccak256(S)) mod N
    const N = secp256k1.CURVE.n;
    const stealthPrivateKeyBigInt = (spendScalar + hashScalar) % N;

    return stealthPrivateKeyBigInt.toString(16).padStart(64, '0');
  }

  /**
   * Generates a new key pair for use in the stealth address protocol.
   * Returns both private and public keys in uncompressed format.
   *
   * @returns Object with privateKey and publicKey (both as hex strings)
   *
   * @example
   * const { privateKey, publicKey } = GhostSDK.generateKeyPair();
   */
  static generateKeyPair(): { privateKey: string; publicKey: string } {
    const privateKey = secp256k1.utils.randomPrivateKey();
    const publicKey = secp256k1.getPublicKey(privateKey, false);

    return {
      privateKey: bytesToHex(privateKey),
      publicKey: bytesToHex(publicKey),
    };
  }

  /**
   * Derives the public key from a private key.
   *
   * @param privateKeyHex - Private key as hex string (32 bytes)
   * @returns Public key as uncompressed hex string (65 bytes / 130 hex chars)
   * @throws Error if private key is invalid
   *
   * @example
   * const publicKey = GhostSDK.getPublicKey(privateKey);
   */
  static getPublicKey(privateKeyHex: string): string {
    if (!isValidPrivateKey(privateKeyHex)) {
      throw new Error('Invalid private key format');
    }

    const publicKey = secp256k1.getPublicKey(hexToBytes(normalizeHex(privateKeyHex)), false);
    return bytesToHex(publicKey);
  }
}
