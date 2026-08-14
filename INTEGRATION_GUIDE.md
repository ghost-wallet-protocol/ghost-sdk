# Integration Guide

How to integrate Ghost SDK into your project.

## Installation Options

### Option 1: From npm (Production)
```bash
npm install ghost-sdk
```

### Option 2: From GitHub (Development)
```bash
npm install github:ghost-wallet-protocol/ghost-sdk
```

### Option 3: From Local Path
```bash
npm install /path/to/ghost-sdk
```

## Integration by Project

### ghost-contracts
**Use For**: Client-side validation before contract interaction

```typescript
import { GhostSDK } from 'ghost-sdk';

// Validate stealth address
const payload = GhostSDK.generateStealthAddress(metaAddress);
// Send payload to contract
```

**Scope**: Address generation, validation

---

### ghost-frontend
**Use For**: All cryptographic operations and key management

```typescript
import { GhostSDK } from 'ghost-sdk';

// Generate keys
const keyPair = GhostSDK.generateKeyPair();

// Send payment
const payload = GhostSDK.generateStealthAddress(metaAddress);

// Receive payment
const isForMe = GhostSDK.isPaymentForRecipient(...);
if (isForMe) {
  const key = GhostSDK.deriveStealthPrivateKey(...);
}
```

**Scope**: Full crypto lifecycle

---

### ghost-relayer
**Use For**: Payment validation and announcement verification

```typescript
import { GhostSDK, isValidPublicKey } from 'ghost-sdk';

// Validate incoming payment
if (isValidPublicKey(payload.ephemeralPublicKey)) {
  // Valid, relay to blockchain
  relayToBlockchain(payload);
}
```

**Scope**: Input validation

---

## Usage Pattern

**Sender**:
1. Uses SDK to generate stealth address
2. Signs transaction
3. Sends to relayer/blockchain

**Relayer**:
1. Validates using SDK
2. Relays to blockchain

**Recipient**:
1. Scans blockchain for announcements
2. Uses SDK to check if payment is for them
3. Uses SDK to derive spending key

## Testing Integration

```bash
npm install ghost-sdk
npm test
npm run build
```

## Error Handling

All SDK functions validate inputs and throw on errors:
```typescript
try {
  const payload = GhostSDK.generateStealthAddress(meta);
} catch (error) {
  console.error(error.message);
}
```

## See Also

- README.md - Full API
- WAVE_PROGRAM_PLAN.md - Contributing
- examples.ts - 8 working examples
