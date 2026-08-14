# Ghost SDK Integration Guide

This guide shows how to integrate Ghost SDK into your Ghost Protocol repositories.

## 📦 Installation

### Option 1: From npm (once published)

```bash
npm install ghost-sdk
```

### Option 2: From GitHub (development)

```bash
npm install github:ghost-wallet-protocol/ghost-sdk
```

### Option 3: From local path (during development)

```bash
npm install /path/to/ghost-sdk
```

---

## 🔗 Integration for Each Repository

### 1. ghost-contracts

**Purpose**: Client-side address generation before contract interaction

```typescript
import { GhostSDK } from 'ghost-sdk';

// Before sending transaction to contract:
const recipientMeta = {
  spendingPublicKey: recipientSpending,
  viewingPublicKey: recipientViewing,
};

// Generate stealth address
const payload = GhostSDK.generateStealthAddress(recipientMeta);

// Send payload to contract
// Contract receives: ephemeralPublicKey, viewTag, stealthAddress
```

**Installation**:
```bash
cd ghost-contracts
npm install ghost-sdk --save
```

**Use Cases**:
- Generate stealth addresses before contract deployment
- Validate addresses on client-side
- Pre-compute view tags for efficiency

**Files to Update**:
- `package.json` - Add dependency
- Contract interface TypeScript files - Import SDK
- Client code - Use SDK functions

---

### 2. ghost-frontend

**Purpose**: UI/UX for stealth address generation and payment scanning

```typescript
import { GhostSDK } from 'ghost-sdk';

// Setup
const spendingKeyPair = GhostSDK.generateKeyPair();
const viewingKeyPair = GhostSDK.generateKeyPair();

const metaAddress = {
  spendingPublicKey: spendingKeyPair.publicKey,
  viewingPublicKey: viewingKeyPair.publicKey,
};

// Display to user for sharing
showMetaAddressQR(metaAddress);

// Generate stealth address for payment
const payload = GhostSDK.generateStealthAddress(metaAddress);
sendPaymentTo(payload.stealthAddress);
```

**Installation**:
```bash
cd ghost-frontend
npm install ghost-sdk --save
```

**Use Cases**:
- Generate and display meta-addresses
- Create stealth address for incoming payments
- Scan blockchain for user's payments
- Derive spending keys from received payments
- Key management UI

**Frontend Components**:
- Meta-Address Display Component
- Stealth Address Generator
- Payment Scanner
- Key Manager
- Wallet Integration

**Files to Update**:
- `package.json` - Add dependency
- React components - Import and use SDK
- State management - Store key pairs
- API integration - Scanner endpoints

---

### 3. ghost-relayer

**Purpose**: Validate and relay stealth address payments

```typescript
import { GhostSDK, isValidPublicKey } from 'ghost-sdk';

// Validate incoming announcement
function validateAnnouncement(announcement) {
  if (!isValidPublicKey(announcement.ephemeralPublicKey)) {
    throw new Error('Invalid ephemeral key');
  }
  if (!isValidPublicKey(announcement.stealthAddress)) {
    throw new Error('Invalid stealth address');
  }
  return true;
}

// Use in relay service
router.post('/relay', (req, res) => {
  const { announcement, transactionData } = req.body;
  
  // Validate with SDK
  if (validateAnnouncement(announcement)) {
    relayTransaction(transactionData);
  }
});
```

**Installation**:
```bash
cd ghost-relayer
npm install ghost-sdk --save
```

**Use Cases**:
- Validate stealth address announcements
- Relay transactions to contracts
- Input validation for API endpoints
- Testing relayer with SDK examples

**API Endpoints**:
- `POST /relay` - Relay transaction with announcement
- `POST /validate` - Validate address payload
- `GET /status` - Check relayer health

**Files to Update**:
- `package.json` - Add dependency
- `src/routes/` - Add validation middleware
- `src/services/` - Use SDK for validation
- Tests - Use SDK examples

---

## 🔄 Data Flow Integration

```
┌─────────────────┐
│  ghost-frontend │  Generate stealth address
│   (User sends)  │  Display meta-address
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│        Use GhostSDK to:             │
│  • generateStealthAddress()         │
│  • generateKeyPair()                │
│  • getPublicKey()                   │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────┐
│ ghost-contracts │  Receive stealth address
│  (Blockchain)   │  Store ephemeralPublicKey + viewTag
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ghost-relayer  │  Validate announcements
│  (Middleware)   │  Relay transactions
└────────┬────────┘
         │
         ▼
   Transaction
   Complete
```

---

## 📋 Integration Checklist

### ghost-contracts
- [ ] Add `ghost-sdk` to `package.json`
- [ ] Run `npm install`
- [ ] Import in contract interface code
- [ ] Update contract API docs with SDK usage
- [ ] Add integration tests
- [ ] Create example in README

### ghost-frontend
- [ ] Add `ghost-sdk` to `package.json`
- [ ] Run `npm install`
- [ ] Create meta-address component
- [ ] Create stealth address generator component
- [ ] Add to wallet state management
- [ ] Create key storage service
- [ ] Add example flows to documentation
- [ ] Test with real contract interaction

### ghost-relayer
- [ ] Add `ghost-sdk` to `package.json`
- [ ] Run `npm install`
- [ ] Create validation middleware
- [ ] Add input validation to endpoints
- [ ] Create test fixtures from SDK examples
- [ ] Update API documentation
- [ ] Add validation error handling
- [ ] Create integration tests

---

## 🚀 Example: Complete Flow

```typescript
import { GhostSDK } from 'ghost-sdk';

// 1. User generates keys (frontend)
const userSpending = GhostSDK.generateKeyPair();
const userViewing = GhostSDK.generateKeyPair();

const metaAddress = {
  spendingPublicKey: userSpending.publicKey,
  viewingPublicKey: userViewing.publicKey,
};

// 2. Share meta-address with sender
shareMetaAddress(metaAddress);

// 3. Sender generates stealth address (frontend/contracts)
const payload = GhostSDK.generateStealthAddress(metaAddress);

// 4. Relayer validates (relayer)
if (isValidPublicKey(payload.ephemeralPublicKey)) {
  // 5. Contract receives transaction
  await sendToContract({
    stealthAddress: payload.stealthAddress,
    ephemeralPublicKey: payload.ephemeralPublicKey,
    viewTag: payload.viewTag,
  });
}

// 6. User scans blockchain (frontend)
const isForMe = GhostSDK.isPaymentForRecipient(
  userViewing.privateKey,
  userSpending.publicKey,
  payload.ephemeralPublicKey,
  payload.viewTag,
  payload.stealthAddress
);

if (isForMe) {
  // 7. Derive spending key
  const stealthPrivateKey = GhostSDK.deriveStealthPrivateKey(
    userSpending.privateKey,
    userViewing.privateKey,
    payload.ephemeralPublicKey
  );
  
  // User can now spend from the stealth address
}
```

---

## 📚 Documentation Links

- **SDK Repository**: https://github.com/ghost-wallet-protocol/ghost-sdk
- **SDK README**: See `README.md` in SDK repo
- **API Reference**: See `README.md` - API Reference section
- **Examples**: See `examples.ts` in SDK repo
- **Security**: See `SECURITY.md` in SDK repo

---

## 🔐 Security Notes

1. **Never expose private keys** in frontend code
2. **Validate all inputs** before using SDK functions
3. **Use HTTPS** for all API calls
4. **Store keys securely** (encrypted storage/vaults)
5. **Test thoroughly** before production deployment

---

## 🆘 Troubleshooting

### Package Not Found

```bash
# Install from git during development
npm install github:ghost-wallet-protocol/ghost-sdk

# Or from local path
npm install /path/to/ghost-sdk
```

### Type Errors

Ensure TypeScript is installed:
```bash
npm install --save-dev typescript
npm install --save-dev @types/node
```

### Build Issues

Clear and rebuild:
```bash
npm ci
npm run build
```

---

## 📞 Support

See `PUSH_INSTRUCTIONS.md` and `QUICK_START.md` in the SDK repository for detailed guidance.

For issues or questions:
1. Check SDK README
2. Review examples.ts
3. Check CONTRIBUTING.md for guidelines
4. Open GitHub issue

---

**Status**: Integration Ready ✅  
**SDK Version**: 1.0.0  
**Last Updated**: 2026-08-14
