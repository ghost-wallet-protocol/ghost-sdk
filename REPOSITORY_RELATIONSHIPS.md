# Ghost Protocol Repository Relationships

**Ecosystem**: 4 interconnected repositories for privacy-first payments

## Repository Overview

### ghost-sdk (Library)
Core cryptographic operations for stealth addresses. Used by all other repos.
- Generates stealth addresses (ECDH + keccak256)
- Scans for incoming payments
- Derives private keys for spending
- ~300 lines, 40 tests, 100% coverage

### ghost-contracts (Blockchain)
Smart contracts for on-chain stealth payments.
- Receives payments to stealth addresses
- Emits announcements (ephemeralKey, viewTag)
- Stores payment records

### ghost-relayer (Backend)
Middleware service between frontend and blockchain.
- Validates announcements using ghost-sdk
- Relays transactions to blockchain
- Provides payment query API
- Database storage

### ghost-frontend (UI)
User wallet application.
- Uses ghost-sdk for all cryptography
- Uses ghost-relayer API for payments
- Scans blockchain for received funds
- Displays wallet & history

## Data Flow

```
User → Frontend (uses sdk) → Relayer (validates) → Blockchain
         ↓                                              ↓
    Generate stealth                            Emit announcement
    address & sign                                    ↓
         ↑─────────────────────────────────────← User scans
             (uses sdk to check if for me)
```

## Dependency Matrix

| Repo | Depends On | Used By |
|------|-----------|---------|
| **ghost-sdk** | @noble libs | All 3 repos |
| **ghost-contracts** | blockchain | relayer, frontend |
| **ghost-relayer** | sdk, blockchain | frontend |
| **ghost-frontend** | sdk, relayer | users |

## Integration Points

**SDK → Frontend**: TypeScript imports for crypto ops
```typescript
import { GhostSDK } from 'ghost-sdk';
const payload = GhostSDK.generateStealthAddress(metaAddress);
```

**SDK → Relayer**: Validation during payment relay
```typescript
if (isValidPublicKey(payload.ephemeralPublicKey)) {
  relayToBlockchain();
}
```

**Frontend → Relayer**: REST API calls
```
POST /api/relay { stealthAddress, ephemeralPublicKey, amount }
```

**Relayer → Blockchain**: Web3.js transactions
```typescript
contract.sendPayment(stealthAddress, amount, ephemeralKey);
```

## Critical Workflows

**Send Payment**:
1. User enters recipient meta-address (Frontend)
2. Frontend generates stealth address (ghost-sdk)
3. Frontend sends via Relayer API
4. Relayer validates & relays to blockchain
5. Contract executes & emits announcement

**Receive Payment**:
1. Blockchain emits announcement event
2. Frontend detects it
3. Frontend uses ghost-sdk to check if it's for me
4. Frontend derives spending key (ghost-sdk)
5. Frontend adds to wallet

## Deployment Order

1. **ghost-sdk**: Core library (no dependencies)
2. **ghost-contracts**: Deploy contracts to blockchain
3. **ghost-relayer**: Start backend service
4. **ghost-frontend**: Connect to relayer & blockchain

---

**Status**: Production-ready modular design ✅
