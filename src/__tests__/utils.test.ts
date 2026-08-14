import {
  isValidHex,
  isValidPublicKey,
  isValidPrivateKey,
  isValidScalar,
  normalizeHex,
  ensureHexPrefix,
} from '../utils';

describe('Utils - Validation Functions', () => {
  describe('isValidHex', () => {
    it('should validate correct hex strings', () => {
      expect(isValidHex('abc123')).toBe(true);
      expect(isValidHex('0xabc123')).toBe(true);
      expect(isValidHex('ABC123')).toBe(true);
    });

    it('should reject invalid hex strings', () => {
      expect(isValidHex('xyz')).toBe(false);
      expect(isValidHex('0xzyz')).toBe(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(isValidHex(123 as any)).toBe(false);
    });

    it('should validate hex length when specified', () => {
      expect(isValidHex('abcdef', 6)).toBe(true);
      expect(isValidHex('abcdef', 5)).toBe(false);
      expect(isValidHex('0xabcdef', 6)).toBe(true);
    });
  });

  describe('isValidPublicKey', () => {
    it('should validate correct public key format (130 hex chars)', () => {
      const validKey = '0'.repeat(130);
      expect(isValidPublicKey(validKey)).toBe(true);
    });

    it('should reject wrong length', () => {
      expect(isValidPublicKey('0'.repeat(64))).toBe(false);
      expect(isValidPublicKey('0'.repeat(129))).toBe(false);
    });

    it('should reject non-hex characters', () => {
      expect(isValidPublicKey('g' + '0'.repeat(129))).toBe(false);
    });
  });

  describe('isValidPrivateKey', () => {
    it('should validate correct private key format (64 hex chars)', () => {
      const validKey = '0'.repeat(64);
      expect(isValidPrivateKey(validKey)).toBe(true);
    });

    it('should reject wrong length', () => {
      expect(isValidPrivateKey('0'.repeat(63))).toBe(false);
      expect(isValidPrivateKey('0'.repeat(65))).toBe(false);
    });

    it('should reject non-hex characters', () => {
      expect(isValidPrivateKey('g' + '0'.repeat(63))).toBe(false);
    });
  });

  describe('isValidScalar', () => {
    it('should validate valid scalars', () => {
      expect(isValidScalar(1n)).toBe(true);
      expect(isValidScalar(BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140'))).toBe(true);
    });

    it('should reject zero', () => {
      expect(isValidScalar(0n)).toBe(false);
    });

    it('should reject negative numbers', () => {
      expect(isValidScalar(-1n)).toBe(false);
    });

    it('should reject scalars >= curve order', () => {
      const curveOrder = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
      expect(isValidScalar(curveOrder)).toBe(false);
      expect(isValidScalar(curveOrder + 1n)).toBe(false);
    });
  });

  describe('normalizeHex', () => {
    it('should remove 0x prefix', () => {
      expect(normalizeHex('0xabcdef')).toBe('abcdef');
    });

    it('should not modify strings without 0x prefix', () => {
      expect(normalizeHex('abcdef')).toBe('abcdef');
    });
  });

  describe('ensureHexPrefix', () => {
    it('should add 0x prefix if missing', () => {
      expect(ensureHexPrefix('abcdef')).toBe('0xabcdef');
    });

    it('should not duplicate 0x prefix', () => {
      expect(ensureHexPrefix('0xabcdef')).toBe('0xabcdef');
    });
  });
});
