# Ghost SDK

A production-ready TypeScript SDK for ERC-5564 compatible stealth address derivations. Handles client-side Diffie-Hellman key exchanges using secp256k1 curve math for private, single-use addresses on EVM chains.

## Features

- **ERC-5564 Compatible**: Implements the stealth address standard for Ethereum and EVM-compatible chains
- **Efficient Scanning**: 99.6% filter efficiency with view tags to minimize client-side computation
- **Cryptographically Secure**: Uses proven @noble/curves and @noble/hashes libraries
- **Fully Typed**: Written in TypeScript with complete type safety
- **Comprehensive Testing**: >80% code coverage with deterministic test suite
- **Zero Dependencies Risk**: Minimal dependencies, all from trusted sources

## Installation

```bash
npm install ghost-sdk
# or
yarn add ghost-sdk
# or
pnpm add ghost-sdk
```

## Quick Start

### Generate a Meta-Address (Recipient Setup)

A meta-address is a pair of public keys that enables stealth address generation:

```typescript
import { GhostSDK } from 'ghost-sdk';

// Generate spending and viewing key pairs
const spendingKeyPair = GhostSDK.generateKeyPair();
const viewingKeyPair = GhostSDK.generateKeyPair();

// Share this meta-address with senders
const metaAddress = {
  spendingPublicKey: spendingKeyPair.publicKey,
  viewingPublicKey: viewingKeyPair.publicKey,
};

// Store these securely
const recipientPrivateKeys = {
  spendingPrivateKey: spendingKeyPair.privateKey,
  viewingPrivateKey: viewingKeyPair.privateKey,
};
```

### Send a Stealth Payment (Sender Flow)

```typescript
import { GhostSDK } from 'ghost-sdk';

const metaAddress = {
  spendingPublicKey: '0x04...',
  viewingPublicKey: '0x04...',
};

// Generate stealth address payload for recipient
const payload = GhostSDK.generateStealthAddress(metaAddress);

// Send funds to payload.stealthAddress on-chain
// Broadcast payload.ephemeralPublicKey and payload.viewTag in event logs
console.log(payload);
// {
//   stealthAddress: '0x04...',      // Send funds here
//   ephemeralPublicKey: '0x04...',  // Publish on-chain
//   viewTag: 42                      // Publish on-chain
// }
```

### Scan for Payments (Recipient Scanning)

```typescript
import { GhostSDK } from 'ghost-sdk';

// From on-chain announcement
const announcement = {
  ephemeralPublicKey: '0x04...',
  viewTag: 42,
  stealthAddress: '0x04...',
};

// Fast scan using view tag
const isForMe = GhostSDK.isPaymentForRecipient(
  recipientPrivateKeys.viewingPrivateKey,
  recipientPrivateKeys.spendingPublicKey,
  announcement.ephemeralPublicKey,
  announcement.viewTag,
  announcement.stealthAddress
);

if (isForMe) {
  console.log('Found payment for me!');
  
  // Derive stealth private key to spend funds
  const stealthPrivateKey = GhostSDK.deriveStealthPrivateKey(
    recipientPrivateKeys.spendingPrivateKey,
    recipientPrivateKeys.viewingPrivateKey,
    announcement.ephemeralPublicKey
  );
  
  // Use stealthPrivateKey to sign transactions
}
```

## API Reference

### `GhostSDK.generateStealthAddress(receiverMeta: MetaAddress): StealthPaymentPayload`

Generates a stealth address payload for a recipient.

**Parameters:**
- `receiverMeta`: Object with `spendingPublicKey` and `viewingPublicKey` (hex strings, 130 chars each)

**Returns:**
- `StealthPaymentPayload` with `stealthAddress`, `ephemeralPublicKey`, and `viewTag`

**Throws:** Error if meta-address keys are invalid

---

### `GhostSDK.isPaymentForRecipient(...): boolean`

Checks if an on-chain announcement contains funds for the recipient.

**Parameters:**
- `viewingPrivateKeyHex`: Recipient's viewing private key (64 hex chars)
- `spendingPublicKeyHex`: Recipient's spending public key (130 hex chars)
- `ephemeralPublicKeyHex`: From on-chain announcement (130 hex chars)
- `viewTag`: From on-chain announcement (0-255)
- `onChainStealthAddress`: The address to check (130 hex chars)

**Returns:** `boolean` - true if payment is for recipient, false otherwise

**Throws:** Error if any parameter is invalid

---

### `GhostSDK.deriveStealthPrivateKey(...): string`

Derives the stealth private key to spend received funds.

**Parameters:**
- `spendingPrivateKeyHex`: Recipient's spending private key (64 hex chars)
- `viewingPrivateKeyHex`: Recipient's viewing private key (64 hex chars)
- `ephemeralPublicKeyHex`: From on-chain announcement (130 hex chars)

**Returns:** Stealth private key as hex string (64 chars)

**Throws:** Error if any parameter is invalid

---

### `GhostSDK.generateKeyPair(): { privateKey: string; publicKey: string }`

Generates a new cryptographic key pair.

**Returns:** Object with `privateKey` and `publicKey` (both hex strings)

---

### `GhostSDK.getPublicKey(privateKeyHex: string): string`

Derives public key from private key.

**Parameters:**
- `privateKeyHex`: Private key (64 hex chars)

**Returns:** Public key as hex string (130 chars)

**Throws:** Error if private key is invalid

## Utility Functions

### Input Validation

```typescript
import {
  isValidHex,
  isValidPublicKey,
  isValidPrivateKey,
  isValidScalar,
  normalizeHex,
  ensureHexPrefix,
} from 'ghost-sdk';

// Validate hex strings
isValidHex('abc123', 6); // true if 6 chars

// Validate public/private keys
isValidPublicKey('0x04...'); // true if 130 hex chars
isValidPrivateKey('abc123...'); // true if 64 hex chars

// Validate scalars
isValidScalar(BigInt('0x123')); // true if in valid range

// Convert hex formats
normalizeHex('0xabc'); // 'abc'
ensureHexPrefix('abc'); // '0xabc'
```

## Security Considerations

1. **Private Key Management**: Never expose private keys. Store `spendingPrivateKey` and `viewingPrivateKey` securely.

2. **View Tag Filtering**: View tags reject 255/256 false positives. Still perform full address verification.

3. **Deterministic ECDH**: The shared secret is computed deterministically from the same inputs, enabling consistent stealth address generation.

4. **No Key Derivation**: This SDK does not implement key derivation. Use HD wallets (BIP-44) separately if needed.

5. **Input Validation**: All public APIs validate inputs and throw on invalid parameters.

## Example: End-to-End Flow

```typescript
import { GhostSDK } from 'ghost-sdk';

// Step 1: Recipient generates key pairs
const recipientSpending = GhostSDK.generateKeyPair();
const recipientViewing = GhostSDK.generateKeyPair();

const metaAddress = {
  spendingPublicKey: recipientSpending.publicKey,
  viewingPublicKey: recipientViewing.publicKey,
};

// Step 2: Sender generates stealth address
const payload = GhostSDK.generateStealthAddress(metaAddress);

// Step 3: Sender sends funds to payload.stealthAddress
// (In real scenario, this would be an on-chain transaction)

// Step 4: Recipient scans announcement
const isForMe = GhostSDK.isPaymentForRecipient(
  recipientViewing.privateKey,
  recipientSpending.publicKey,
  payload.ephemeralPublicKey,
  payload.viewTag,
  payload.stealthAddress
);

// Step 5: Recipient derives private key to spend
if (isForMe) {
  const stealthPrivateKey = GhostSDK.deriveStealthPrivateKey(
    recipientSpending.privateKey,
    recipientViewing.privateKey,
    payload.ephemeralPublicKey
  );
  
  // Use stealthPrivateKey for transactions
  console.log('Can now spend from:', payload.stealthAddress);
}
```

## Development

### Setup

```bash
npm install
```

### Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Code Quality

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format
```

### Build

```bash
npm run build
```

## Performance

- **generateStealthAddress**: ~5-10ms per call
- **isPaymentForRecipient**: ~10-20ms per call (includes ECC operations)
- **deriveStealthPrivateKey**: ~5-10ms per call
- **View tag filter**: Reduces false positives by 99.6% (255/256 rejection rate)

## Browser Compatibility

This SDK works in:
- Node.js 18+
- Modern browsers (with bundler)
- React Native

For browser usage, bundle with your preferred tool (webpack, rollup, etc.).

## References

- [ERC-5564: Stealth Addresses](https://eips.ethereum.org/EIPS/eip-5564)
- [secp256k1](https://en.wikipedia.org/wiki/Secp256k1)
- [@noble/curves](https://github.com/paulmillr/noble-curves)

## License

MIT

## Support

For issues, questions, or contributions, please open an issue on GitHub.
