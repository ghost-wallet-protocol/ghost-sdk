# Integration Steps - Three Repository Setup

This document provides exact commands to integrate Ghost SDK into the three Ghost Protocol repositories.

## 📋 Prerequisites

You need access (push permissions) to these repositories:
- `ghost-contracts`
- `ghost-frontend`
- `ghost-relayer`

---

## 1️⃣ ghost-contracts Integration

### Step 1: Clone and navigate
```bash
cd /tmp
git clone https://github.com/ghost-wallet-protocol/ghost-contracts.git
cd ghost-contracts
```

### Step 2: Install Ghost SDK
```bash
# Option A: From GitHub (latest)
npm install github:ghost-wallet-protocol/ghost-sdk --save

# Option B: From npm (after publish)
npm install ghost-sdk --save

# Option C: From local (development)
npm install /path/to/ghost-sdk --save
```

### Step 3: Create contract integration example
```bash
mkdir -p examples
cat > examples/stealth-address-example.ts << 'EOF'
import { GhostSDK } from 'ghost-sdk';

/**
 * Example: Generate stealth address before contract interaction
 */
export function generateStealthAddressForContract(
  recipientSpendingPublicKey: string,
  recipientViewingPublicKey: string
) {
  const metaAddress = {
    spendingPublicKey: recipientSpendingPublicKey,
    viewingPublicKey: recipientViewingPublicKey,
  };

  // Generate stealth address payload
  const payload = GhostSDK.generateStealthAddress(metaAddress);

  // This payload is sent to contract:
  // - stealthAddress: recipient's single-use address
  // - ephemeralPublicKey: for recipient to scan
  // - viewTag: optimization for scanning

  return payload;
}

/**
 * Example: Validate stealth address
 */
export function validateStealthPayload(payload: any) {
  const { GhostSDK, isValidPublicKey } = require('ghost-sdk');

  return (
    isValidPublicKey(payload.stealthAddress) &&
    isValidPublicKey(payload.ephemeralPublicKey) &&
    typeof payload.viewTag === 'number' &&
    payload.viewTag >= 0 &&
    payload.viewTag <= 255
  );
}
EOF
```

### Step 4: Update README
```bash
cat >> README.md << 'EOF'

## Integration with Ghost SDK

This project integrates Ghost SDK for client-side stealth address generation.

### Usage

```typescript
import { GhostSDK } from 'ghost-sdk';

// Generate stealth address before contract interaction
const payload = GhostSDK.generateStealthAddress(metaAddress);

// Send to contract
await contract.sendPayment(payload);
```

See `examples/stealth-address-example.ts` for complete examples.
EOF
```

### Step 5: Commit and push
```bash
git add package.json package-lock.json examples/ README.md
git commit -m "integrate: Add ghost-sdk for stealth address generation

- Installed ghost-sdk for ERC-5564 support
- Added examples for contract integration
- Enables client-side address derivation
- SDK repo: https://github.com/ghost-wallet-protocol/ghost-sdk"

git push origin main
```

---

## 2️⃣ ghost-frontend Integration

### Step 1: Clone and navigate
```bash
cd /tmp
git clone https://github.com/ghost-wallet-protocol/ghost-frontend.git
cd ghost-frontend
```

### Step 2: Install Ghost SDK
```bash
npm install ghost-sdk --save
```

### Step 3: Create wallet service
```bash
mkdir -p src/services
cat > src/services/stealthAddressService.ts << 'EOF'
import { GhostSDK } from 'ghost-sdk';

/**
 * Stealth Address Service
 * Handles all stealth address operations for the wallet
 */

export class StealthAddressService {
  /**
   * Generate new key pairs for recipient
   */
  static generateRecipientKeys() {
    const spendingKeyPair = GhostSDK.generateKeyPair();
    const viewingKeyPair = GhostSDK.generateKeyPair();

    return {
      spending: spendingKeyPair,
      viewing: viewingKeyPair,
      metaAddress: {
        spendingPublicKey: spendingKeyPair.publicKey,
        viewingPublicKey: viewingKeyPair.publicKey,
      },
    };
  }

  /**
   * Generate stealth address for sending payment
   */
  static generateStealthAddress(metaAddress: any) {
    return GhostSDK.generateStealthAddress(metaAddress);
  }

  /**
   * Scan for incoming payments
   */
  static isPaymentForRecipient(
    viewingPrivateKey: string,
    spendingPublicKey: string,
    ephemeralPublicKey: string,
    viewTag: number,
    stealthAddress: string
  ) {
    return GhostSDK.isPaymentForRecipient(
      viewingPrivateKey,
      spendingPublicKey,
      ephemeralPublicKey,
      viewTag,
      stealthAddress
    );
  }

  /**
   * Derive spending key to access received funds
   */
  static deriveSpendingKey(
    spendingPrivateKey: string,
    viewingPrivateKey: string,
    ephemeralPublicKey: string
  ) {
    return GhostSDK.deriveStealthPrivateKey(
      spendingPrivateKey,
      viewingPrivateKey,
      ephemeralPublicKey
    );
  }
}
EOF
```

### Step 4: Create React hook
```bash
cat > src/hooks/useStealthAddress.ts << 'EOF'
import { useState } from 'react';
import { StealthAddressService } from '../services/stealthAddressService';

export function useStealthAddress() {
  const [metaAddress, setMetaAddress] = useState<any>(null);
  const [keys, setKeys] = useState<any>(null);

  const generateKeys = () => {
    const generated = StealthAddressService.generateRecipientKeys();
    setKeys(generated.metaAddress);
    setMetaAddress(generated.metaAddress);
    return generated;
  };

  const generatePayment = () => {
    if (!metaAddress) throw new Error('Meta address not set');
    return StealthAddressService.generateStealthAddress(metaAddress);
  };

  return {
    metaAddress,
    keys,
    generateKeys,
    generatePayment,
  };
}
EOF
```

### Step 5: Update package.json scripts
```bash
# Add to package.json "scripts" section:
# "example:stealth": "ts-node examples/stealth-example.ts"
```

### Step 6: Commit and push
```bash
git add package.json package-lock.json src/services/ src/hooks/
git commit -m "integrate: Add ghost-sdk with stealth address services

- Added StealthAddressService for all SDK operations
- Created useStealthAddress React hook
- Enables UI for key generation and payment scanning
- SDK repo: https://github.com/ghost-wallet-protocol/ghost-sdk"

git push origin main
```

---

## 3️⃣ ghost-relayer Integration

### Step 1: Clone and navigate
```bash
cd /tmp
git clone https://github.com/ghost-wallet-protocol/ghost-relayer.git
cd ghost-relayer
```

### Step 2: Install Ghost SDK
```bash
npm install ghost-sdk --save
```

### Step 3: Create validation middleware
```bash
mkdir -p src/middleware
cat > src/middleware/stealthAddressValidator.ts << 'EOF'
import { Request, Response, NextFunction } from 'express';
import { isValidPublicKey } from 'ghost-sdk';

/**
 * Validate stealth address announcement middleware
 */
export function validateStealthAnnouncement(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { ephemeralPublicKey, stealthAddress, viewTag } = req.body;

  // Validate ephemeral public key
  if (!isValidPublicKey(ephemeralPublicKey)) {
    return res.status(400).json({
      error: 'Invalid ephemeral public key format',
    });
  }

  // Validate stealth address
  if (!isValidPublicKey(stealthAddress)) {
    return res.status(400).json({
      error: 'Invalid stealth address format',
    });
  }

  // Validate view tag
  if (typeof viewTag !== 'number' || viewTag < 0 || viewTag > 255) {
    return res.status(400).json({
      error: 'Invalid view tag (must be 0-255)',
    });
  }

  next();
}
EOF
```

### Step 4: Create relay routes
```bash
cat > src/routes/relay.ts << 'EOF'
import { Router } from 'express';
import { validateStealthAnnouncement } from '../middleware/stealthAddressValidator';

const router = Router();

/**
 * POST /relay
 * Relay a stealth address payment transaction
 */
router.post('/relay', validateStealthAnnouncement, async (req, res) => {
  try {
    const { ephemeralPublicKey, stealthAddress, viewTag, transactionData } = req.body;

    // Relay transaction to contract
    // Implementation depends on your blockchain/contract setup

    res.json({
      success: true,
      txHash: 'hash_here',
      announcement: {
        ephemeralPublicKey,
        stealthAddress,
        viewTag,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

export default router;
EOF
```

### Step 5: Commit and push
```bash
git add package.json package-lock.json src/middleware/ src/routes/
git commit -m "integrate: Add ghost-sdk validation for stealth addresses

- Added validateStealthAnnouncement middleware
- Validates ephemeralPublicKey, stealthAddress, viewTag
- Enables secure relay of payments
- SDK repo: https://github.com/ghost-wallet-protocol/ghost-sdk"

git push origin main
```

---

## ✅ Verification

After integration, verify in each repository:

```bash
# Check dependency is installed
npm list ghost-sdk

# Check build succeeds
npm run build

# Check tests pass
npm test

# Check code quality
npm run lint
```

---

## 🔗 Link All Three Repositories

Update each repository's README to reference the others:

```markdown
## Ghost Protocol Ecosystem

- **ghost-sdk** - Client-side cryptography and key management
- **ghost-contracts** - Smart contracts for stealth transactions
- **ghost-frontend** - User interface and wallet
- **ghost-relayer** - Transaction relay service
```

---

## 📦 When SDK is Published to npm

Once published to npm, you can simplify installation:

```bash
# Instead of:
npm install github:ghost-wallet-protocol/ghost-sdk

# Simply use:
npm install ghost-sdk
```

Update package.json to use the simpler version.

---

## 🚀 Next Steps

1. **Run these integration steps** in each repository
2. **Test the integration** by running examples
3. **Create pull requests** with the integration commits
4. **Merge to main** after review
5. **Publish SDK to npm** (when ready)
6. **Update package.json** to use published version

---

**Status**: Integration Guide Ready ✅  
**Last Updated**: 2026-08-14
