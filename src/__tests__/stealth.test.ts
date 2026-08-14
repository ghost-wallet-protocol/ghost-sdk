import { GhostSDK } from '../stealth';
import type { MetaAddress, StealthPaymentPayload } from '../types';

describe('GhostSDK - Stealth Address Generation', () => {
  let validMeta: MetaAddress;

  beforeEach(() => {
    // Generate valid test keys
    const spendingKeyPair = GhostSDK.generateKeyPair();
    const viewingKeyPair = GhostSDK.generateKeyPair();

    validMeta = {
      spendingPublicKey: spendingKeyPair.publicKey,
      viewingPublicKey: viewingKeyPair.publicKey,
    };
  });

  describe('generateStealthAddress', () => {
    it('should generate a valid stealth address payload', () => {
      const payload = GhostSDK.generateStealthAddress(validMeta);

      expect(payload).toHaveProperty('stealthAddress');
      expect(payload).toHaveProperty('ephemeralPublicKey');
      expect(payload).toHaveProperty('viewTag');

      // Check formats
      expect(payload.stealthAddress).toMatch(/^[0-9a-fA-F]{130}$/);
      expect(payload.ephemeralPublicKey).toMatch(/^[0-9a-fA-F]{130}$/);
      expect(payload.viewTag).toBeGreaterThanOrEqual(0);
      expect(payload.viewTag).toBeLessThanOrEqual(255);
    });

    it('should generate different stealth addresses for the same meta address', () => {
      const payload1 = GhostSDK.generateStealthAddress(validMeta);
      const payload2 = GhostSDK.generateStealthAddress(validMeta);

      // Different ephemeral keys should lead to different stealth addresses
      expect(payload1.stealthAddress).not.toBe(payload2.stealthAddress);
      expect(payload1.ephemeralPublicKey).not.toBe(payload2.ephemeralPublicKey);
    });

    it('should throw on invalid spending public key', () => {
      const invalidMeta = {
        spendingPublicKey: 'invalid',
        viewingPublicKey: validMeta.viewingPublicKey,
      };

      expect(() => GhostSDK.generateStealthAddress(invalidMeta)).toThrow(
        'Invalid spending public key format'
      );
    });

    it('should throw on invalid viewing public key', () => {
      const invalidMeta = {
        spendingPublicKey: validMeta.spendingPublicKey,
        viewingPublicKey: 'invalid',
      };

      expect(() => GhostSDK.generateStealthAddress(invalidMeta)).toThrow(
        'Invalid viewing public key format'
      );
    });

    it('should handle public keys with or without 0x prefix', () => {
      const metaWithPrefix = {
        spendingPublicKey: '0x' + validMeta.spendingPublicKey,
        viewingPublicKey: '0x' + validMeta.viewingPublicKey,
      };

      const payload = GhostSDK.generateStealthAddress(metaWithPrefix);
      expect(payload.stealthAddress).toMatch(/^[0-9a-fA-F]{130}$/);
    });
  });

  describe('isPaymentForRecipient', () => {
    let spendingPrivateKey: string;
    let viewingPrivateKey: string;
    let stealthPayload: StealthPaymentPayload;

    beforeEach(() => {
      // Generate fresh keypairs
      const spendingKeyPair = GhostSDK.generateKeyPair();
      const viewingKeyPair = GhostSDK.generateKeyPair();

      spendingPrivateKey = spendingKeyPair.privateKey;
      viewingPrivateKey = viewingKeyPair.privateKey;

      const meta = {
        spendingPublicKey: spendingKeyPair.publicKey,
        viewingPublicKey: viewingKeyPair.publicKey,
      };

      stealthPayload = GhostSDK.generateStealthAddress(meta);
    });

    it('should correctly identify payment for recipient', () => {
      const result = GhostSDK.isPaymentForRecipient(
        viewingPrivateKey,
        GhostSDK.getPublicKey(spendingPrivateKey),
        stealthPayload.ephemeralPublicKey,
        stealthPayload.viewTag,
        stealthPayload.stealthAddress
      );

      expect(result).toBe(true);
    });

    it('should reject payment with mismatched view tag', () => {
      const result = GhostSDK.isPaymentForRecipient(
        viewingPrivateKey,
        GhostSDK.getPublicKey(spendingPrivateKey),
        stealthPayload.ephemeralPublicKey,
        (stealthPayload.viewTag + 1) % 256, // Wrong view tag
        stealthPayload.stealthAddress
      );

      expect(result).toBe(false);
    });

    it('should reject payment for different recipient', () => {
      const otherKeyPair = GhostSDK.generateKeyPair();
      const otherViewingKeyPair = GhostSDK.generateKeyPair();

      const result = GhostSDK.isPaymentForRecipient(
        otherViewingKeyPair.privateKey,
        otherKeyPair.publicKey,
        stealthPayload.ephemeralPublicKey,
        stealthPayload.viewTag,
        stealthPayload.stealthAddress
      );

      expect(result).toBe(false);
    });

    it('should throw on invalid viewing private key', () => {
      expect(() =>
        GhostSDK.isPaymentForRecipient(
          'invalid',
          GhostSDK.getPublicKey(spendingPrivateKey),
          stealthPayload.ephemeralPublicKey,
          stealthPayload.viewTag,
          stealthPayload.stealthAddress
        )
      ).toThrow('Invalid viewing private key format');
    });

    it('should throw on invalid spending public key', () => {
      expect(() =>
        GhostSDK.isPaymentForRecipient(
          viewingPrivateKey,
          'invalid',
          stealthPayload.ephemeralPublicKey,
          stealthPayload.viewTag,
          stealthPayload.stealthAddress
        )
      ).toThrow('Invalid spending public key format');
    });

    it('should throw on invalid ephemeral public key', () => {
      expect(() =>
        GhostSDK.isPaymentForRecipient(
          viewingPrivateKey,
          GhostSDK.getPublicKey(spendingPrivateKey),
          'invalid',
          stealthPayload.viewTag,
          stealthPayload.stealthAddress
        )
      ).toThrow('Invalid ephemeral public key format');
    });

    it('should throw on invalid view tag', () => {
      expect(() =>
        GhostSDK.isPaymentForRecipient(
          viewingPrivateKey,
          GhostSDK.getPublicKey(spendingPrivateKey),
          stealthPayload.ephemeralPublicKey,
          -1,
          stealthPayload.stealthAddress
        )
      ).toThrow('Invalid view tag');

      expect(() =>
        GhostSDK.isPaymentForRecipient(
          viewingPrivateKey,
          GhostSDK.getPublicKey(spendingPrivateKey),
          stealthPayload.ephemeralPublicKey,
          256,
          stealthPayload.stealthAddress
        )
      ).toThrow('Invalid view tag');
    });

    it('should throw on invalid stealth address', () => {
      expect(() =>
        GhostSDK.isPaymentForRecipient(
          viewingPrivateKey,
          GhostSDK.getPublicKey(spendingPrivateKey),
          stealthPayload.ephemeralPublicKey,
          stealthPayload.viewTag,
          'invalid'
        )
      ).toThrow('Invalid on-chain stealth address format');
    });
  });

  describe('deriveStealthPrivateKey', () => {
    let spendingPrivateKey: string;
    let viewingPrivateKey: string;
    let stealthPayload: StealthPaymentPayload;

    beforeEach(() => {
      const spendingKeyPair = GhostSDK.generateKeyPair();
      const viewingKeyPair = GhostSDK.generateKeyPair();

      spendingPrivateKey = spendingKeyPair.privateKey;
      viewingPrivateKey = viewingKeyPair.privateKey;

      const meta = {
        spendingPublicKey: spendingKeyPair.publicKey,
        viewingPublicKey: viewingKeyPair.publicKey,
      };

      stealthPayload = GhostSDK.generateStealthAddress(meta);
    });

    it('should derive a valid stealth private key', () => {
      const stealthPrivateKey = GhostSDK.deriveStealthPrivateKey(
        spendingPrivateKey,
        viewingPrivateKey,
        stealthPayload.ephemeralPublicKey
      );

      expect(stealthPrivateKey).toMatch(/^[0-9a-fA-F]{64}$/);
    });

    it('should produce deterministic results', () => {
      const stealthPrivateKey1 = GhostSDK.deriveStealthPrivateKey(
        spendingPrivateKey,
        viewingPrivateKey,
        stealthPayload.ephemeralPublicKey
      );

      const stealthPrivateKey2 = GhostSDK.deriveStealthPrivateKey(
        spendingPrivateKey,
        viewingPrivateKey,
        stealthPayload.ephemeralPublicKey
      );

      expect(stealthPrivateKey1).toBe(stealthPrivateKey2);
    });

    it('should throw on invalid spending private key', () => {
      expect(() =>
        GhostSDK.deriveStealthPrivateKey('invalid', viewingPrivateKey, stealthPayload.ephemeralPublicKey)
      ).toThrow('Invalid spending private key format');
    });

    it('should throw on invalid viewing private key', () => {
      expect(() =>
        GhostSDK.deriveStealthPrivateKey(spendingPrivateKey, 'invalid', stealthPayload.ephemeralPublicKey)
      ).toThrow('Invalid viewing private key format');
    });

    it('should throw on invalid ephemeral public key', () => {
      expect(() =>
        GhostSDK.deriveStealthPrivateKey(spendingPrivateKey, viewingPrivateKey, 'invalid')
      ).toThrow('Invalid ephemeral public key format');
    });
  });

  describe('generateKeyPair', () => {
    it('should generate a valid key pair', () => {
      const keyPair = GhostSDK.generateKeyPair();

      expect(keyPair).toHaveProperty('privateKey');
      expect(keyPair).toHaveProperty('publicKey');
      expect(keyPair.privateKey).toMatch(/^[0-9a-fA-F]{64}$/);
      expect(keyPair.publicKey).toMatch(/^[0-9a-fA-F]{130}$/);
    });

    it('should generate different key pairs each time', () => {
      const keyPair1 = GhostSDK.generateKeyPair();
      const keyPair2 = GhostSDK.generateKeyPair();

      expect(keyPair1.privateKey).not.toBe(keyPair2.privateKey);
      expect(keyPair1.publicKey).not.toBe(keyPair2.publicKey);
    });
  });

  describe('getPublicKey', () => {
    it('should derive public key from private key', () => {
      const { privateKey: expectedPrivate, publicKey: expectedPublic } = GhostSDK.generateKeyPair();
      const derivedPublic = GhostSDK.getPublicKey(expectedPrivate);

      expect(derivedPublic).toBe(expectedPublic);
    });

    it('should throw on invalid private key', () => {
      expect(() => GhostSDK.getPublicKey('invalid')).toThrow('Invalid private key format');
    });

    it('should handle private keys with 0x prefix', () => {
      const { privateKey } = GhostSDK.generateKeyPair();
      const publicKey = GhostSDK.getPublicKey('0x' + privateKey);

      expect(publicKey).toMatch(/^[0-9a-fA-F]{130}$/);
    });
  });
});
