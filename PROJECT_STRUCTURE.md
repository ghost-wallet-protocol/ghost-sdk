# Project Structure

## Directory Layout

```
ghost-sdk/
├── src/                       # Source code
│   ├── stealth.ts            # Main GhostSDK implementation
│   ├── types.ts              # TypeScript interfaces
│   ├── utils.ts              # Utilities & validation
│   ├── index.ts              # Public exports
│   └── __tests__/            # Test files
│       ├── stealth.test.ts   # 30 tests
│       └── utils.test.ts     # 10 tests
│
├── dist/                     # Compiled output (generated)
│   ├── *.js                  # 5 JavaScript files
│   └── *.d.ts                # 5 Type definition files
│
├── .github/
│   └── workflows/            # GitHub Actions
│       ├── test.yml          # Test workflow
│       └── publish.yml       # Publish workflow
│
├── Configuration
│   ├── package.json          # Dependencies & scripts
│   ├── tsconfig.json         # TypeScript settings
│   ├── jest.config.json      # Test config
│   ├── .eslintrc.json        # Linting rules
│   └── .prettierrc.json      # Formatting
│
└── Documentation
    ├── README.md             # Main docs
    ├── QUICK_START.md        # 5-minute guide
    ├── INTEGRATION_GUIDE.md  # How to use
    └── *.md                  # Other guides
```

## File Purposes

| File | Purpose | Lines |
|------|---------|-------|
| `stealth.ts` | Core protocol implementation | ~200 |
| `types.ts` | TypeScript interfaces | ~25 |
| `utils.ts` | Validation functions | ~75 |
| `index.ts` | Public API exports | ~5 |

## Build Output

```
dist/
├── index.js, index.d.ts      # Main entry point
├── stealth.js, stealth.d.ts  # Core implementation
├── types.js, types.d.ts      # Type definitions
├── utils.js, utils.d.ts      # Utilities
└── *.map files               # Source maps
```

## Testing

```
src/__tests__/
├── stealth.test.ts          # 30 tests for core
└── utils.test.ts            # 10 tests for utilities

Coverage: 100%
```

## Configuration

- `tsconfig.json`: Strict TypeScript mode
- `jest.config.json`: Test thresholds (80%)
- `.eslintrc.json`: Code quality rules
- `.prettierrc.json`: Formatting settings
- `package.json`: Dependencies, scripts, metadata

## Metrics

- **Source**: 300 LOC
- **Tests**: 40 tests
- **Coverage**: 100%
- **Build**: <1 second
- **Bundle**: ~12KB

---

**Total**: ~50 project files, production-ready configuration
