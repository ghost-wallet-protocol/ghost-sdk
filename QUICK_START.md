# Ghost SDK - Quick Start Guide

## Installation

```bash
npm install ghost-sdk
```

## Basic Usage

### 1. Recipient: Generate Meta-Address

```typescript
import { GhostSDK } from 'ghost-sdk';

// Generate key pairs
const spending = GhostSDK.generateKeyPair();
const viewing = GhostSDK.generateKeyPair();

// Share this with senders
const metaAddress = {
  spendingPublicKey: spending.publicKey,
  viewingPublicKey: viewing.publicKey,
};

// Store these securely
const privateKeys = {
  spendingPrivateKey: spending.privateKey,
  viewingPrivateKey: viewing.privateKey,
};
```

### 2. Sender: Generate Stealth Address

```typescript
import { GhostSDK } from 'ghost-sdk';

const recipientMeta = {
  spendingPublicKey: '0x04...', // from recipient
  viewingPublicKey: '0x04...',  // from recipient
};

// Generate stealth address for recipient
const payload = GhostSDK.generateStealthAddress(recipientMeta);

// Send funds to: payload.stealthAddress
// Publish on-chain: payload.ephemeralPublicKey, payload.viewTag
```

### 3. Recipient: Scan & Detect Payment

```typescript
// Check if this payment is for me
const isForMe = GhostSDK.isPaymentForRecipient(
  privateKeys.viewingPrivateKey,
  privateKeys.spendingPublicKey,
  announcement.ephemeralPublicKey,
  announcement.viewTag,
  announcement.stealthAddress
);

if (isForMe) {
  // Derive key to spend funds
  const stealthPrivateKey = GhostSDK.deriveStealthPrivateKey(
    privateKeys.spendingPrivateKey,
    privateKeys.viewingPrivateKey,
    announcement.ephemeralPublicKey
  );
  
  // Use stealthPrivateKey to sign transactions
}
```

## Common Commands

```bash
# Development
npm run dev                # Watch mode compilation

# Testing
npm test                   # Run all tests
npm run test:watch       # Watch mode testing
npm run test:coverage    # Coverage report

# Code Quality
npm run lint             # Check issues
npm run lint:fix         # Auto-fix issues
npm run format           # Format code
npm run type-check       # Type checking

# Building
npm run build            # Compile TypeScript
```

## API Reference

### GhostSDK.generateStealthAddress()
```typescript
const payload = GhostSDK.generateStealthAddress(metaAddress);
// Returns: { stealthAddress, ephemeralPublicKey, viewTag }
```

### GhostSDK.isPaymentForRecipient()
```typescript
const isForMe = GhostSDK.isPaymentForRecipient(
  viewingPrivateKey,
  spendingPublicKey,
  ephemeralPublicKey,
  viewTag,
  stealthAddress
);
// Returns: boolean
```

### GhostSDK.deriveStealthPrivateKey()
```typescript
const key = GhostSDK.deriveStealthPrivateKey(
  spendingPrivateKey,
  viewingPrivateKey,
  ephemeralPublicKey
);
// Returns: hex string (32 bytes)
```

### GhostSDK.generateKeyPair()
```typescript
const { privateKey, publicKey } = GhostSDK.generateKeyPair();
```

### GhostSDK.getPublicKey()
```typescript
const publicKey = GhostSDK.getPublicKey(privateKey);
```

## Utility Functions

```typescript
import {
  isValidHex,
  isValidPublicKey,
  isValidPrivateKey,
  isValidScalar,
  normalizeHex,
  ensureHexPrefix,
} from 'ghost-sdk';

// Validate inputs
isValidPublicKey('0x04...');    // true if valid
isValidPrivateKey('abc123...');  // true if valid
normalizeHex('0xabc');           // 'abc'
ensureHexPrefix('abc');          // '0xabc'
```

## Error Handling

All SDK functions validate inputs and throw clear errors:

```typescript
try {
  const payload = GhostSDK.generateStealthAddress({
    spendingPublicKey: 'invalid',
    viewingPublicKey: 'invalid',
  });
} catch (error) {
  console.error(error.message);
  // Output: "Invalid spending public key format"
}
```

## Performance

- **generateStealthAddress**: ~5-10ms
- **isPaymentForRecipient**: ~10-20ms
- **deriveStealthPrivateKey**: ~5-10ms

## Security Tips

1. **Never share private keys**
   - Keep spendingPrivateKey and viewingPrivateKey secure
   - Use hardware wallets or encrypted vaults

2. **Validate on-chain data**
   - View tags provide 99.6% filtering
   - Always verify the full stealth address match

3. **Input validation**
   - All SDK functions validate inputs
   - Throw on invalid data

## Examples

Full examples available in `examples.ts`:

```bash
# View examples
cat examples.ts
```

Includes:
- Basic setup
- Sender flow
- Recipient scanning
- Key derivation
- End-to-end flow
- Error handling
- Utility functions
- Multiple payments scanning

## Documentation

- **README.md** - Full documentation
- **CONTRIBUTING.md** - How to contribute
- **SECURITY.md** - Security policies
- **PRODUCTION.md** - Production deployment
- **PROJECT_STRUCTURE.md** - Code organization
- **CHANGELOG.md** - Version history

## Troubleshooting

### Type Errors
```bash
npm run type-check  # Check for TypeScript errors
```

### Test Failures
```bash
npm test            # Run full test suite
npm run test:watch  # Debug mode
```

### Linting Issues
```bash
npm run lint:fix    # Auto-fix issues
```

## Getting Help

- 📖 Read the full [README.md](README.md)
- 💡 Check [examples.ts](examples.ts)
- 🔒 Review [SECURITY.md](SECURITY.md)
- 🚀 See [PRODUCTION.md](PRODUCTION.md)
- 💬 Open a GitHub issue
- 📧 Email security@example.com for security issues

---

**Ready to use!** Start with the examples above or read the full documentation.
