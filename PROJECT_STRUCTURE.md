# Project Structure

```
ghost-sdk/
├── src/                           # Source code
│   ├── __tests__/                 # Test files
│   │   ├── stealth.test.ts       # Stealth SDK tests (30 tests)
│   │   └── utils.test.ts         # Utility function tests (10 tests)
│   ├── index.ts                  # Main export file
│   ├── types.ts                  # TypeScript type definitions
│   ├── stealth.ts                # Main GhostSDK implementation
│   └── utils.ts                  # Utility functions
│
├── dist/                          # Compiled output (generated)
│   ├── index.d.ts                # Type definitions
│   ├── index.js                  # CommonJS bundle
│   ├── stealth.js
│   ├── stealth.d.ts
│   ├── types.js
│   ├── types.d.ts
│   ├── utils.js
│   └── utils.d.ts
│
├── .github/
│   └── workflows/                 # GitHub Actions CI/CD
│       ├── test.yml              # Automated testing (Node 18, 20)
│       └── publish.yml           # Automated npm publishing
│
├── examples.ts                    # Comprehensive usage examples
│
├── Configuration files
│   ├── package.json              # Project metadata and scripts
│   ├── tsconfig.json             # TypeScript configuration
│   ├── jest.config.json          # Jest test configuration
│   ├── .eslintrc.json            # ESLint rules
│   ├── .prettierrc.json          # Prettier formatting
│   └── .gitignore                # Git ignore rules
│
├── Documentation
│   ├── README.md                 # Main documentation
│   ├── CONTRIBUTING.md           # Contributing guidelines
│   ├── CHANGELOG.md              # Version history
│   ├── SECURITY.md               # Security policy
│   ├── PRODUCTION.md             # Deployment guide
│   ├── PROJECT_STRUCTURE.md      # This file
│   └── LICENSE                   # MIT License
│
└── Root configuration
    └── Various config files
```

## File Purposes

### Core Implementation

| File | Purpose |
|------|---------|
| `src/stealth.ts` | Main GhostSDK class with all cryptographic operations |
| `src/types.ts` | TypeScript interfaces and type definitions |
| `src/utils.ts` | Input validation and hex conversion utilities |
| `src/index.ts` | Public API exports |

### Testing

| File | Purpose |
|------|---------|
| `src/__tests__/stealth.test.ts` | 30 comprehensive tests for GhostSDK |
| `src/__tests__/utils.test.ts` | 10 tests for utility functions |
| Coverage: **100% statements, branches, functions, lines** |

### Configuration

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts, metadata |
| `tsconfig.json` | TypeScript strict mode settings |
| `jest.config.json` | Test runner configuration |
| `.eslintrc.json` | Code quality rules |
| `.prettierrc.json` | Code formatting rules |

### CI/CD

| File | Purpose |
|------|---------|
| `.github/workflows/test.yml` | Run tests on Node 18 & 20 |
| `.github/workflows/publish.yml` | Auto-publish to npm on release |

### Documentation

| File | Purpose |
|------|---------|
| `README.md` | Main user documentation |
| `CONTRIBUTING.md` | Contribution guidelines |
| `CHANGELOG.md` | Version history and releases |
| `SECURITY.md` | Security policy and best practices |
| `PRODUCTION.md` | Production deployment guide |
| `LICENSE` | MIT License |

## Build Output

### dist/ Directory Contents

After `npm run build`, the `dist/` directory contains:

```
dist/
├── index.d.ts              # Type definitions for main export
├── index.js                # Compiled CommonJS module
├── index.js.map            # Source map for debugging
├── stealth.d.ts            # Type definitions
├── stealth.js              # Compiled stealth.ts
├── stealth.js.map          # Source map
├── types.d.ts              # Type definitions
├── types.js                # Compiled types
├── types.js.map            # Source map
├── utils.d.ts              # Type definitions
├── utils.js                # Compiled utils
└── utils.js.map            # Source map
```

## Package Distribution

When published to npm:

```
ghost-sdk@1.0.0
├── dist/                   # Only compiled files distributed
├── README.md
├── package.json
└── LICENSE
```

The `src/` directory and test files are not included in npm package (see `files` in package.json).

## Development Workflow

```
source code (src/)
       ↓
   build (tsc)
       ↓
  compiled (dist/)
       ↓
  npm publish → npm registry
```

## Code Organization

### By Concern

- **Cryptography**: `stealth.ts` - ECDH, secp256k1, key derivation
- **Validation**: `utils.ts` - Input validation and hex handling
- **Types**: `types.ts` - Interfaces and type safety
- **Tests**: `__tests__/` - 40 comprehensive tests

### By Access Level

- **Public API**: `GhostSDK` class methods, type exports, utilities
- **Internal**: Helper functions in `stealth.ts`

## Key Metrics

- **Lines of Code**: ~300 (source), ~400 (tests)
- **Test Coverage**: 100% (40 tests)
- **Dependencies**: 2 (production), 6 (dev)
- **Bundle Size**: ~12KB (minified)
- **Performance**: <15ms per operation
