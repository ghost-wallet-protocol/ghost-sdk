# Quick Start - Ghost SDK

Get started in 5 minutes.

## Installation

```bash
npm install ghost-sdk
```

## Basic Usage

### 1. Generate Keys
```typescript
import { GhostSDK } from 'ghost-sdk';

const spending = GhostSDK.generateKeyPair();
const viewing = GhostSDK.generateKeyPair();

const metaAddress = {
  spendingPublicKey: spending.publicKey,
  viewingPublicKey: viewing.publicKey,
};
```

### 2. Generate Stealth Address
```typescript
const payload = GhostSDK.generateStealthAddress(metaAddress);

// Send funds to: payload.stealthAddress
// Publish: payload.ephemeralPublicKey, payload.viewTag
```

### 3. Scan for Payments
```typescript
const isForMe = GhostSDK.isPaymentForRecipient(
  viewing.privateKey,
  spending.publicKey,
  ephemeralPublicKey,
  viewTag,
  stealthAddress
);

if (isForMe) {
  const key = GhostSDK.deriveStealthPrivateKey(
    spending.privateKey,
    viewing.privateKey,
    ephemeralPublicKey
  );
  // Use key to spend
}
```

## Commands

```bash
npm run build          # Compile
npm test               # Run tests
npm run test:coverage  # Coverage report
npm run lint           # Check quality
npm run format         # Format code
```

## API Quick Reference

| Function | Purpose |
|----------|---------|
| `generateKeyPair()` | Create key pair |
| `getPublicKey(priv)` | Derive public key |
| `generateStealthAddress(meta)` | Create single-use address |
| `isPaymentForRecipient(...)` | Scan for payment |
| `deriveStealthPrivateKey(...)` | Derive spending key |

## Utilities

```typescript
import { isValidPublicKey, normalizeHex } from 'ghost-sdk';

isValidPublicKey('0x04...')  // true/false
normalizeHex('0xabc')        // 'abc'
```

## Examples

See `examples.ts` for 8 complete working examples.

## Documentation

- README.md - Full API reference
- REPOSITORY_RELATIONSHIPS.md - How it fits in ecosystem
- WAVE_PROGRAM_PLAN.md - Contribution opportunities
