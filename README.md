# Ghost SDK

TypeScript SDK for ERC-5564 stealth address generation. Client-side cryptography for privacy-first payments.

## Features

- **ERC-5564 Compatible**: Stealth address standard for Ethereum & EVM
- **Efficient Scanning**: 99.6% filter efficiency with view tags
- **Type Safe**: Full TypeScript with strict mode
- **Tested**: 40 tests, 100% coverage
- **Minimal Dependencies**: @noble/curves & @noble/hashes only

## Installation

```bash
npm install ghost-sdk
```

## Quick Start

### Generate Meta-Address
```typescript
import { GhostSDK } from 'ghost-sdk';

const spending = GhostSDK.generateKeyPair();
const viewing = GhostSDK.generateKeyPair();

const metaAddress = {
  spendingPublicKey: spending.publicKey,
  viewingPublicKey: viewing.publicKey,
};
```

### Generate Stealth Address
```typescript
const payload = GhostSDK.generateStealthAddress(metaAddress);
// { stealthAddress, ephemeralPublicKey, viewTag }

// Send funds to payload.stealthAddress
// Publish ephemeralPublicKey & viewTag in events
```

### Scan for Payments
```typescript
const isForMe = GhostSDK.isPaymentForRecipient(
  viewingPrivateKey,
  spendingPublicKey,
  ephemeralPublicKey,
  viewTag,
  stealthAddress
);

if (isForMe) {
  const spendKey = GhostSDK.deriveStealthPrivateKey(
    spendingPrivateKey,
    viewingPrivateKey,
    ephemeralPublicKey
  );
  // Use spendKey to sign transactions
}
```

## API Reference

- `generateKeyPair()` - Create public/private key pair
- `getPublicKey(privateKey)` - Derive public from private
- `generateStealthAddress(metaAddress)` - Create stealth address
- `isPaymentForRecipient(...)` - Check if payment is for you
- `deriveStealthPrivateKey(...)` - Get key to spend funds

## Utilities

- `isValidHex(hex, length)` - Validate hex format
- `isValidPublicKey(hex)` - Check 130-char public key
- `isValidPrivateKey(hex)` - Check 64-char private key
- `normalizeHex(hex)` - Remove 0x prefix
- `ensureHexPrefix(hex)` - Add 0x prefix

## Security

- Private keys never leave client
- Uses audited @noble libraries
- Input validation on all functions
- 100% test coverage

## Performance

- generateStealthAddress: 5-10ms
- isPaymentForRecipient: 10-20ms
- deriveStealthPrivateKey: 5-10ms

## Repos

This SDK integrates with:
- ghost-contracts: Smart contracts
- ghost-frontend: User wallet
- ghost-relayer: Backend service

See REPOSITORY_RELATIONSHIPS.md for details.

## License

MIT
