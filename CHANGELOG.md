# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-14

### Added
- Initial release of Ghost SDK
- Complete ERC-5564 stealth address implementation
- `GhostSDK.generateStealthAddress()` for creating stealth address payloads
- `GhostSDK.isPaymentForRecipient()` for scanning on-chain announcements
- `GhostSDK.deriveStealthPrivateKey()` for deriving spending keys
- `GhostSDK.generateKeyPair()` for generating cryptographic key pairs
- `GhostSDK.getPublicKey()` for deriving public keys from private keys
- Utility functions for input validation and hex conversion
- Comprehensive test suite with 100% code coverage
- TypeScript support with full type safety
- ESLint and Prettier configuration
- Full documentation and examples

### Features
- 99.6% scanning efficiency with view tags
- Deterministic ECDH key derivation
- Input validation for all public APIs
- Secure cryptography using @noble/curves and @noble/hashes
- Browser and Node.js compatibility
