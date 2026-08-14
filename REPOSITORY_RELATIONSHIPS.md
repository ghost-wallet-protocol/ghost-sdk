# Ghost Protocol Repository Relationships

**Ecosystem**: Ghost Protocol - Privacy-first payment system  
**Architecture**: Modular, event-driven  
**Integration**: Complete end-to-end flow  

## Repository Overview

### 1. ghost-sdk
**Type**: Core Library  
**Language**: TypeScript  
**Purpose**: Client-side cryptography & key management  
**Role**: Foundation for all stealth address operations  

**What it does**:
- Generates stealth addresses from meta-addresses
- Scans for incoming payments with view tags
- Derives private keys for spending
- Handles all ERC-5564 protocol math

**Used by**: ghost-frontend, ghost-relayer, ghost-contracts  
**Dependencies**: @noble/curves, @noble/hashes  

### 2. ghost-contracts
**Type**: Smart Contracts  
**Language**: Solidity (or Soroban for Stellar)  
**Purpose**: On-chain protocol implementation  
**Role**: Blockchain-side transaction handling  

**What it does**:
- Receives stealth address payments
- Emits announcement events
- Stores payment records
- Manages contract state

**Uses**: (Announces) ghost-sdk  
**Used by**: ghost-relayer (watches events), ghost-frontend (sends transactions)  
**Dependencies**: Web3.js/Ethers.js  

### 3. ghost-frontend
**Type**: Web Application  
**Language**: TypeScript/React  
**Purpose**: User interface & wallet  
**Role**: End-user interaction point  

**What it does**:
- Displays wallet & balance
- Generates meta-addresses
- Initiates payments
- Scans for received funds
- Shows transaction history

**Uses**: ghost-sdk (all crypto), ghost-relayer (sends payments)  
**Used by**: End users  
**Dependencies**: React, ghost-sdk, API client  

### 4. ghost-relayer
**Type**: Backend Service  
**Language**: TypeScript/Node.js  
**Purpose**: Payment relay & validation  
**Role**: Middleware between frontend and blockchain  

**What it does**:
- Validates payment announcements
- Relays transactions to blockchain
- Stores payment metadata
- Provides payment query API
- Handles rate limiting

**Uses**: ghost-sdk (validation), blockchain RPC  
**Used by**: ghost-frontend (API), ghost-contracts (events)  
**Dependencies**: Express.js, database, ghost-sdk  

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  ghost-frontend (UI)                    │
│        User initiates payment, scans receipts           │
└──────────┬──────────────────────────────────┬───────────┘
           │                                  │
           │ Uses ghost-sdk for:              │ Uses ghost-sdk for:
           │ • Generate stealth address      │ • Scan announcements
           │ • Sign transactions             │ • Derive spending keys
           │                                  │
           ▼                                  ▼
      ┌─────────────────────────────────────────────┐
      │         ghost-sdk (Core Library)            │
      │    generateStealthAddress()                 │
      │    isPaymentForRecipient()                  │
      │    deriveStealthPrivateKey()                │
      └─────────────────────────────────────────────┘
           │                                  │
           │ Sends payment                    │ Watches events
           ▼                                  ▼
      ┌──────────────────────────────────────────────┐
      │        ghost-relayer (Backend)               │
      │  • Validates using ghost-sdk                 │
      │  • Relays to blockchain                      │
      │  • Stores payment metadata                   │
      └──────────────────────────────────────────────┘
           │                                  │
           │ Sends signed transaction         │ Queries events
           ▼                                  ▼
      ┌──────────────────────────────────────────────┐
      │      ghost-contracts (Blockchain)            │
      │  • Receives stealth address payment          │
      │  • Emits announcement event                  │
      │  • Stores payment records                    │
      └──────────────────────────────────────────────┘
```

## Dependency Matrix

| Repo | Depends On | Provides To |
|------|-----------|------------|
| **ghost-sdk** | @noble/curves, @noble/hashes | All 3 repos |
| **ghost-contracts** | blockchain RPC | ghost-relayer, ghost-frontend |
| **ghost-frontend** | ghost-sdk, ghost-relayer API | End users |
| **ghost-relayer** | ghost-sdk, blockchain RPC, DB | ghost-frontend |

## Integration Points

### 1. SDK ↔ Frontend
**Connection**: TypeScript imports  
**Data**: Crypto operations  
**Frequency**: Per transaction & scan  

```typescript
import { GhostSDK } from 'ghost-sdk';

// Frontend generates stealth address
const payload = GhostSDK.generateStealthAddress(metaAddress);

// Frontend scans for payments
const isForMe = GhostSDK.isPaymentForRecipient(...);
```

### 2. SDK ↔ Relayer
**Connection**: TypeScript imports  
**Data**: Validation operations  
**Frequency**: Per payment received  

```typescript
import { GhostSDK, isValidPublicKey } from 'ghost-sdk';

// Relayer validates announcement
if (isValidPublicKey(payload.ephemeralPublicKey)) {
  // Valid, relay to blockchain
}
```

### 3. Frontend ↔ Relayer
**Connection**: REST API  
**Data**: JSON (payment data)  
**Frequency**: Per user action  

```typescript
// Frontend sends payment request
POST /api/relay {
  stealthAddress,
  ephemeralPublicKey,
  viewTag,
  amount
}

// Relayer responds with tx hash
{ txHash: "0x..." }
```

### 4. Relayer ↔ Contracts
**Connection**: Web3.js/Ethers.js  
**Data**: Transaction data  
**Frequency**: Per payment  

```typescript
// Relayer sends transaction
const tx = await contract.sendPayment(
  stealthAddress,
  amount,
  ephemeralPublicKey,
  viewTag
);

// Contract emits event
event PaymentAnnouncement(
  ephemeralPublicKey,
  viewTag,
  stealthAddress
);
```

### 5. Contracts ↔ Frontend
**Connection**: Event listening (Web3.js)  
**Data**: Announcement events  
**Frequency**: Continuous scanning  

```typescript
// Frontend watches for announcements
contract.on('PaymentAnnouncement', (ephemeralKey, viewTag, address) => {
  // Use ghost-sdk to check if it's for me
  if (GhostSDK.isPaymentForRecipient(...)) {
    // Add to wallet
  }
});
```

## Critical Workflows

### Workflow 1: Send Payment
```
User (Frontend)
    ↓ (1) Enter recipient meta-address
Frontend (Uses ghost-sdk)
    ↓ (2) Generate stealth address
Frontend + Relayer (API call)
    ↓ (3) Request relay
Relayer (Uses ghost-sdk)
    ↓ (4) Validate & relay
Blockchain (Smart Contract)
    ↓ (5) Execute transaction
Blockchain
    └─→ (6) Emit announcement event
```

### Workflow 2: Receive Payment
```
Blockchain (Smart Contract)
    ├─→ (1) Emit announcement event
    └─→ (2) Event contains ephemeralKey, viewTag, stealthAddress
Frontend (Listening)
    ↓ (3) Detect new announcement
Frontend (Uses ghost-sdk)
    ↓ (4) Check if it's for me
Frontend (Uses ghost-sdk)
    ↓ (5) Derive spending key
Frontend
    └─→ (6) Add to wallet
```

## Deployment Dependencies

| Component | Must Deploy Before | Reason |
|-----------|-------------------|--------|
| ghost-sdk | All others | Library dependency |
| ghost-contracts | ghost-relayer | Contract addresses needed |
| ghost-relayer | ghost-frontend | API endpoints needed |
| ghost-frontend | — | Can work offline initially |

## Key Relationships Summary

**ghost-sdk** is the heart:
- Pure crypto library
- Used by all other repos
- No external dependencies (except crypto libs)
- Can be tested independently

**ghost-contracts** is the ledger:
- Stores state on blockchain
- Emits events for scanning
- Doesn't depend on other repos
- Can be upgraded independently

**ghost-relayer** is the bridge:
- Connects frontend to blockchain
- Uses sdk for validation
- Listens to contract events
- Provides query API

**ghost-frontend** is the interface:
- Uses sdk for all crypto
- Uses relayer for payments
- Listens to blockchain for events
- User-facing application

## Technology Stack Integration

| Layer | Component | Stack |
|-------|-----------|-------|
| **Crypto** | ghost-sdk | TypeScript, @noble |
| **Blockchain** | ghost-contracts | Solidity/Soroban |
| **Backend** | ghost-relayer | Node.js, Express |
| **Frontend** | ghost-frontend | React, TypeScript |
| **Infrastructure** | All | GitHub Actions, Docker |

## Success Metrics

✅ **Modularity**: Each repo can be understood independently  
✅ **Integration**: All repos work together seamlessly  
✅ **Testing**: Each component testable in isolation  
✅ **Deployment**: Can deploy components independently  
✅ **Scalability**: Can scale individual components  

---

**Architecture**: Production-ready modular design  
**Status**: All components defined & interconnected  
**Next**: Implementation & testing phase
